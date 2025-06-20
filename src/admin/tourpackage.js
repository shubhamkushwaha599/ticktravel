const express = require("express");
const router = express.Router();
const TourPackage = require("../models/TourPackage");
const db = require("../dbqueries/dbqueries"); // adjust path if needed

// ✅ Create a new tour package
router.post("/submit", async (req, res) => {
  try {
    const saved = await db.create(TourPackage, req.body);

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get all tour packages
router.get("/all", async (req, res) => {
  try {

    const tours = await db.findAll(TourPackage, {}, null, { sort: { createdAt: -1 } });

    res.json({ success: true, data: tours });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get one tour package by ID
router.get("/get/:id", async (req, res) => {
  try {
    const tour = await db.findById(TourPackage, req.params.id);

    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

    res.json({ success: true, data: tour });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Update a tour package
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await db.updateById(TourPackage, req.params.id, req.body);

    if (!updated) return res.status(404).json({ success: false, message: "Tour not found" });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Delete a tour package
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await db.deleteById(TourPackage, req.params.id);

    if (!deleted) return res.status(404).json({ success: false, message: "Tour not found" });

    res.json({ success: true, message: "Tour deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
