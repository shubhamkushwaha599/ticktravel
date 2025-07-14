const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const db = require("../dbqueries/dbqueries"); // adjust path if needed

const TourPackage = require("../models/TourPackage");

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

// GET /tour-package/:id/remaining-seats
router.get('/:id/remaining-seats', async (req, res) => {
  try {
    const tourPackageId = req.params.id;

    const tourPackage = await TourPackage.findById(tourPackageId);
    if (!tourPackage) {
      return res.status(404).json({ error: 'Tour package not found' });
    }

    const result = tourPackage.availableDates.map(dateSlot => ({
      from: dateSlot.from.toISOString().split('T')[0],
      to: dateSlot.to.toISOString().split('T')[0],
      remainingCapacity: dateSlot.remainingCapacity,
    }));

    res.status(200).json({ tourPackageId, dates: result });
  } catch (err) {
    console.error('Error fetching remaining capacities:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


 


module.exports = router;
