const express = require("express");
const router = express.Router();
const Destination = require("../models/Destination");
const db = require("../dbqueries/dbqueries"); // adjust path if needed

// ✅ Create a destination
router.post("/submit", async (req, res) => {
  try {
    const saved = await db.create(Destination, req.body);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get all destinations
router.get("/all", async (req, res) => {
  try {
    const destinations = await db.findAll(Destination, {}, null, { sort: { createdAt: -1 } });
    res.json({ success: true, data: destinations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get destination by ID
router.get("/get/:id", async (req, res) => {
  try {
    const destination = await db.findById(Destination, req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });
    res.json({ success: true, data: destination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Update destination by ID
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await db.updateById(Destination, req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "Destination not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Delete destination by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await db.deleteById(Destination, req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Destination not found" });
    res.json({ success: true, message: "Destination deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Count destinations
router.get("/count", async (req, res) => {
  try {
    const count = await db.countDocuments(Destination);
    res.json({ success: true, total: count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Paginate destinations
router.get("/paginated", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await db.paginate(Destination, {}, { page: +page, limit: +limit });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
