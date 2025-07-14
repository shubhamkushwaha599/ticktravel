const express = require("express");
const router = express.Router();

//--------models and utils imports-------
const Destination = require("../models/Destination");

//------------db queries import------------
const db = require("../dbqueries/dbqueries"); // adjust path if needed


// -------------------destination related Public APIs-----------------------
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

module.exports = router;

// --------------------------------------------------------------------
