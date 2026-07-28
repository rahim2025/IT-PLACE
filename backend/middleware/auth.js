const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");

const COOKIE_NAME = "itplace_token";

async function protect(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ error: "You must be logged in to do that." });
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Your session is no longer valid. Please log in again." });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
}

function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}

module.exports = { protect, restrictTo, COOKIE_NAME };
