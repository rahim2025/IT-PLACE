const express = require("express");
const User = require("../models/User");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// GET /api/users — admin only
router.get("/", protect, restrictTo("admin"), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map(publicUser) });
  } catch (err) {
    console.error("Failed to list users:", err.message);
    res.status(500).json({ error: "Could not load users." });
  }
});

// PATCH /api/users/:id/role — admin only
router.patch("/:id/role", protect, restrictTo("admin"), async (req, res) => {
  const { role } = req.body ?? {};

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "Role must be either 'user' or 'admin'." });
  }
  if (String(req.user._id) === req.params.id && role !== "admin") {
    return res.status(400).json({ error: "You cannot remove your own admin access." });
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("Failed to update user role:", err.message);
    res.status(500).json({ error: "Could not update the user's role." });
  }
});

module.exports = router;
