const express = require("express");
const Contact = require("../models/Contact");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  try {
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || undefined,
      message: message.trim(),
    });
    return res.status(201).json({ id: contact._id });
  } catch (err) {
    console.error("Failed to save contact submission:", err.message);
    return res.status(500).json({ error: "Could not save your message. Please try again." });
  }
});

module.exports = router;
