const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { signToken, cookieMaxAge } = require("../utils/jwt");
const { generateToken, hashToken, generateVerificationCode } = require("../utils/tokens");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/mailer");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOKIE_NAME = "itplace_token";
const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000;
const MAX_VERIFICATION_ATTEMPTS = 5;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function isStrongPassword(password) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

function setAuthCookie(res, token, options) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: cookieMaxAge(options),
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

// POST /api/auth/signup
// Role is intentionally never read from the request body — every new
// account is forced to "user" server-side, regardless of what's sent.
// The account is created unverified and no session is issued yet; the user
// must enter the emailed 6-digit code before they can log in.
router.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }
  if (!isStrongPassword(password)) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters and include a letter and a number." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const code = generateVerificationCode();
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "user",
      isVerified: false,
      emailVerificationToken: hashToken(code),
      emailVerificationExpires: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
      emailVerificationAttempts: 0,
    });

    try {
      await sendVerificationEmail(user.email, user.name, code);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr.message);
    }

    return res.status(201).json({
      message: "Account created. Enter the verification code we emailed you to activate your account.",
      email: user.email,
    });
  } catch (err) {
    console.error("Signup failed:", err.message);
    return res.status(500).json({ error: "Could not create your account. Please try again." });
  }
});

// POST /api/auth/verify-email
router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body ?? {};

  if (!email?.trim() || !code?.trim()) {
    return res.status(400).json({ error: "Email and verification code are required." });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+emailVerificationToken +emailVerificationExpires +emailVerificationAttempts"
    );

    if (!user) {
      return res.status(400).json({ error: "Incorrect email or verification code." });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: "This account is already verified." });
    }
    if (!user.emailVerificationToken || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ error: "This code has expired. Please request a new one." });
    }
    if (user.emailVerificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      return res.status(429).json({ error: "Too many incorrect attempts. Please request a new code." });
    }

    if (hashToken(code.trim()) !== user.emailVerificationToken) {
      user.emailVerificationAttempts += 1;
      await user.save();
      const remaining = MAX_VERIFICATION_ATTEMPTS - user.emailVerificationAttempts;
      return res.status(400).json({
        error:
          remaining > 0
            ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Too many incorrect attempts. Please request a new code.",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerificationAttempts = 0;
    await user.save();

    const authToken = signToken(user._id);
    setAuthCookie(res, authToken);
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("Email verification failed:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/auth/resend-verification
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body ?? {};
  const generic = { message: "If that account exists and isn't verified yet, we've sent a new verification code." };

  if (!email?.trim()) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || user.isVerified) {
      return res.json(generic);
    }

    const code = generateVerificationCode();
    user.emailVerificationToken = hashToken(code);
    user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);
    user.emailVerificationAttempts = 0;
    await user.save();

    try {
      await sendVerificationEmail(user.email, user.name, code);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr.message);
    }

    return res.json(generic);
  } catch (err) {
    console.error("Resend verification failed:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body ?? {};

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const token = signToken(user._id, { rememberMe: Boolean(rememberMe) });
    setAuthCookie(res, token, { rememberMe: Boolean(rememberMe) });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("Login failed:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// POST /api/auth/forgot-password
// Always responds with the same generic message so this endpoint can't be
// used to enumerate which emails have accounts.
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body ?? {};
  const generic = { message: "If an account exists for that email, we've sent a password reset link." };

  if (!email?.trim()) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.json(generic);

    const { token, hash } = generateToken();
    user.passwordResetToken = hash;
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const link = `${process.env.CLIENT_ORIGIN}/reset-password/${token}`;
    try {
      await sendPasswordResetEmail(user.email, user.name, link);
    } catch (mailErr) {
      console.error("Failed to send password reset email:", mailErr.message);
    }

    return res.json(generic);
  } catch (err) {
    console.error("Forgot password failed:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  const { password, confirmPassword } = req.body ?? {};

  if (!password || !confirmPassword) {
    return res.status(400).json({ error: "Please fill in both password fields." });
  }
  if (!isStrongPassword(password)) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters and include a letter and a number." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    const hash = hashToken(req.params.token);
    const user = await User.findOne({
      passwordResetToken: hash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ error: "This reset link is invalid or has expired." });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({ message: "Your password has been reset. You can now log in." });
  } catch (err) {
    console.error("Reset password failed:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// PUT /api/auth/update-password — for a logged-in user changing their password
router.put("/update-password", protect, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body ?? {};

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (!isStrongPassword(newPassword)) {
    return res
      .status(400)
      .json({ error: "New password must be at least 8 characters and include a letter and a number." });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "New passwords do not match." });
  }

  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Your current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: "Your password has been updated." });
  } catch (err) {
    console.error("Update password failed:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

module.exports = router;
