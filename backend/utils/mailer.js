const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    // Google displays app passwords in space-separated groups of 4 for
    // readability, but the real credential has no spaces — strip them so
    // the value works whether or not it was pasted with the spaces intact.
    pass: (process.env.APP_PASSWORD || "").replace(/\s+/g, ""),
  },
});

async function sendMail({ to, subject, html }) {
  await transporter.sendMail({
    from: `"ITPlace" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

function emailShell(title, bodyHtml) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0f172a;">
      <div style="font-weight: 800; font-size: 20px; margin-bottom: 24px;">
        <span style="display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#0f172a; color:#fff; border-radius:8px; font-size:14px; margin-right:8px;">IT</span>
        Place<span style="color:#0369a1;">.</span>
      </div>
      <h1 style="font-size: 20px; margin: 0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #64748b;">
        ITPlace — IT Infrastructure & Networking Solutions, Riyadh, Saudi Arabia.
      </p>
    </div>
  `;
}

function sendVerificationEmail(to, name, code) {
  return sendMail({
    to,
    subject: `${code} is your ITPlace verification code`,
    html: emailShell(
      `Welcome, ${name.split(" ")[0]}!`,
      `<p style="font-size:14px; line-height:1.6; color:#334155;">
        Thanks for creating an account with ITPlace. Enter this code to verify your email address:
      </p>
      <div style="margin-top:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; text-align:center;">
        <span style="font-size:32px; font-weight:800; letter-spacing:8px; color:#0f172a;">${code}</span>
      </div>
      <p style="margin-top:20px; font-size:12px; color:#64748b;">
        This code expires in 15 minutes. If you didn't create this account, you can safely ignore this email.
      </p>`
    ),
  });
}

function sendPasswordResetEmail(to, name, link) {
  return sendMail({
    to,
    subject: "Reset your ITPlace password",
    html: emailShell(
      `Reset your password`,
      `<p style="font-size:14px; line-height:1.6; color:#334155;">
        Hi ${name.split(" ")[0]}, we received a request to reset your ITPlace account password.
      </p>
      <a href="${link}" style="display:inline-block; margin-top:16px; background:#0369a1; color:#fff; text-decoration:none; font-weight:600; font-size:14px; padding:12px 24px; border-radius:999px;">
        Reset Password
      </a>
      <p style="margin-top:20px; font-size:12px; color:#64748b;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will stay unchanged.
      </p>`
    ),
  });
}

module.exports = { sendMail, sendVerificationEmail, sendPasswordResetEmail };
