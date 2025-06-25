const express = require("express");
const router = express.Router();
const TourPackage = require("../models/TourPackage");
const db = require("../dbqueries/dbqueries"); // adjust path if needed


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


module.exports = router;
