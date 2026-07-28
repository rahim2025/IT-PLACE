const express = require("express");
const Client = require("../models/Client");
const { protect, restrictTo } = require("../middleware/auth");
const { serializeClient } = require("../utils/serializeClient");

const router = express.Router();

function buildClientPayload(body) {
  const errors = {};
  if (!body.name?.trim()) errors.name = "Client name is required.";
  if (!body.location?.trim()) errors.location = "Location is required.";
  if (!body.work?.trim()) errors.work = "Please describe the work delivered.";

  const order = body.order === "" || body.order == null ? 0 : Number(body.order);
  if (!Number.isFinite(order)) errors.order = "Enter a valid display order.";

  return {
    errors,
    payload: {
      name: body.name?.trim(),
      location: body.location?.trim(),
      work: body.work?.trim(),
      order,
      status: body.status === "inactive" ? "inactive" : "active",
    },
  };
}

// GET /api/clients — public
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find().sort({ order: 1, createdAt: 1 });
    res.json({ clients: clients.map(serializeClient) });
  } catch (err) {
    console.error("Failed to list clients:", err.message);
    res.status(500).json({ error: "Could not load clients." });
  }
});

// GET /api/clients/:id — public
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found." });
    res.json({ client: serializeClient(client) });
  } catch {
    res.status(404).json({ error: "Client not found." });
  }
});

// POST /api/clients — admin only
router.post("/", protect, restrictTo("admin"), async (req, res) => {
  const { errors, payload } = buildClientPayload(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Please fix the highlighted fields.", fieldErrors: errors });
  }

  try {
    const client = await Client.create(payload);
    res.status(201).json({ client: serializeClient(client) });
  } catch (err) {
    console.error("Failed to create client:", err.message);
    res.status(500).json({ error: "Could not create the client. Please try again." });
  }
});

// PUT /api/clients/:id — admin only
router.put("/:id", protect, restrictTo("admin"), async (req, res) => {
  const { errors, payload } = buildClientPayload(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Please fix the highlighted fields.", fieldErrors: errors });
  }

  try {
    const client = await Client.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ error: "Client not found." });
    res.json({ client: serializeClient(client) });
  } catch (err) {
    console.error("Failed to update client:", err.message);
    res.status(500).json({ error: "Could not update the client. Please try again." });
  }
});

// DELETE /api/clients/:id — admin only
router.delete("/:id", protect, restrictTo("admin"), async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found." });
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete client:", err.message);
    res.status(500).json({ error: "Could not delete the client. Please try again." });
  }
});

module.exports = router;
