const jwt = require("jsonwebtoken");

const DEFAULT_EXPIRY = "7d";
const REMEMBER_ME_EXPIRY = "30d";

function signToken(userId, { rememberMe = false } = {}) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? REMEMBER_ME_EXPIRY : DEFAULT_EXPIRY,
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function cookieMaxAge({ rememberMe = false } = {}) {
  const day = 24 * 60 * 60 * 1000;
  return rememberMe ? 30 * day : 7 * day;
}

module.exports = { signToken, verifyToken, cookieMaxAge };
