const crypto = require("crypto");

// The raw token is emailed to the user and never stored — only its SHA-256
// hash is persisted, so a database leak alone can't be used to take over an
// account or reset a password.
function generateToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// A 6-digit numeric code for email verification — short enough to type by
// hand, generated with a CSPRNG so it can't be guessed from timing/PRNG state.
function generateVerificationCode() {
  return String(crypto.randomInt(100000, 1000000));
}

module.exports = { generateToken, hashToken, generateVerificationCode };
