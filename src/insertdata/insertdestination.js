const mongoose = require("mongoose");
const xlsx = require("xlsx");
const path = require("path");
const Destination = require("../models/Destination"); // adjust path if needed

// Connect to MongoDB
require('../config/database').createDbConnection();

// Read Excel
const workbook = xlsx.readFile(path.join(__dirname, "destination.xlsx"));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

// Transform and Clean Data
const cleanedData = rows.map(row => ({
  name: row["Name"]?.trim(),
  country: row["Country"]?.trim(),
  city: row["City"]?.trim(),
  description: row["Description"]?.trim(),
  coordinates: {
    lat: parseFloat(row["Latitude"]) || 0,
    lng: parseFloat(row["Longitude"]) || 0,
    alt: parseFloat(row["Altitude (m)"]) || 0,
  },
  titleImage: row["Title Image"]?.trim(),
  gallery: row["Gallery"] ? row["Gallery"].split(",").map(i => i.trim()) : [],
  attractions: row["Attractions"] ? row["Attractions"].split(",").map(i => i.trim()) : [],
  isPopular: String(row["Is Popular"]).toLowerCase() === 'true',
  status: row["Status"]?.trim().toLowerCase(),
}));

// Insert into MongoDB
Destination.insertMany(cleanedData)
  .then(() => {
    console.log("✅ Destination data inserted successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Error inserting data:", err);
    process.exit(1);
  });
