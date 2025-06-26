const express = require("express");
const router = express.Router();

// -------models and utils imports-------
const TourPackage = require("../models/TourPackage");
const Destination = require("../models/Destination");

// -------db queries import-------
const db = require("../dbqueries/dbqueries"); // adjust path if needed


router.get("/:searchStr", async (req, res) => {
  try {
    console.log("Search request received with searchStr:",)
    const searchStr = decodeURIComponent(req.params.searchStr).trim();
    if (!searchStr) {
      return res.status(400).json({ success: false, message: "Search string cannot be empty" });
    }

    const [matchingPackages, matchingDestinations] = await Promise.all([
      TourPackage.find(
        { $text: { $search: searchStr }, status: 'active' },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } }),

      Destination.find(
        { $text: { $search: searchStr }, status: 'active' },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } })
    ]);

    if (matchingPackages.length === 0 && matchingDestinations.length === 0) {
      return res.status(404).json({ success: false, message: "No matching results found." });
    }

    res.status(200).json({
      success: true,
      data: {
        tourPackages: matchingPackages,
        destinations: matchingDestinations
      }
    });

  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});




module.exports = router;