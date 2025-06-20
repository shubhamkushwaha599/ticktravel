const mongoose = require("mongoose");
const xlsx = require("xlsx");
const path = require("path");
const TourPackage = require("../models/TourPackage");
const Destination = require("../models/Destination");

// Connect to DB
require("../config/database").createDbConnection();

// Read Excel
const workbook = xlsx.readFile(path.join(__dirname, "tour_packages.xlsx"));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

// Utility to parse Python-style datetime and fix JSON structure
const parseJSONField = (field) => {
  try {
    if (typeof field === "string") {
      return JSON.parse(field.replace(/'/g, '"'));
    }
    return field;
  } catch {
    return [];
  }
};

const parseDates = (dateStr) => {
  if (!dateStr) return [];

  try {
    const cleanStr = dateStr
      .replace(/datetime\.datetime\((\d+), (\d+), (\d+),?[^)]*\)/g, (_, y, m, d) => {
        return `"${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}"`;
      })
      .replace(/'/g, '"');

    const parsed = JSON.parse(cleanStr);
    return parsed.map(d => ({
      from: new Date(d.from),
      to: new Date(d.to),
    }));
  } catch (err) {
    console.warn("⚠️ Failed to parse availableDates:", dateStr);
    return [];
  }
};

// Transform Excel rows
const cleanedData = rows.map((row) => ({
  title: row.title?.trim(),
  destinationName: row.destination?.trim(), // temp: will convert to ObjectId later
  description: row.description?.trim(),
  highlights: parseJSONField(row.highlights),
  durationDays: parseInt(row.durationDays) || 1,
  capacity: parseInt(row.capacity) || 1,
  availableDates: parseDates(row.availableDates),
  basePrice: {
    adult: parseFloat(row.basePrice_adult) || 0,
    child: parseFloat(row.basePrice_child) || 0,
    infant: parseFloat(row.basePrice_infant) || 0,
  },
  includes: parseJSONField(row.includes),
  excludes: parseJSONField(row.excludes),
  titleImage: row.titleImage,
  tourImages: parseJSONField(row.tourImages),
  videoUrl: row.videoUrl,
  faqs: parseJSONField(row.faqs),
  status: row.status?.trim() || "inactive",
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
}));

// Map destination names to ObjectIds
async function resolveDestinations(data) {
  const names = [...new Set(data.map((d) => d.destinationName))];

  const found = await Destination.find({ name: { $in: names } }).lean();

  const nameToId = {};
  found.forEach((d) => {
    nameToId[d.name] = d._id;
  });

  const withDestinations = data.map((d) => {
    if (!nameToId[d.destinationName]) {
      console.warn(`⚠️ Destination not found: ${d.destinationName}`);
    }
    return {
      ...d,
      destination: nameToId[d.destinationName] || null,
    };
  });

  return withDestinations.filter((d) => d.destination !== null);
}

// Insert to DB
(async () => {
  try {
    const resolvedData = await resolveDestinations(cleanedData);
    await TourPackage.insertMany(resolvedData);
    console.log("✅ Tour packages inserted successfully!");
  } catch (err) {
    console.error("❌ Insertion error:", err);
  } finally {
    mongoose.connection.close();
  }
})();
