const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// -------------file imports----------------------------
const db = require("../dbqueries/dbqueries");
const configureMulter = require("../utils/multer-setup");
const { TOUR_IMAGES_PATH, TOUR_VIDEO_PATH } = require("../config/consts");

// -------------models imports-------------------
const Destination = require("../models/Destination"); // ✅ FIXED: Missing import

// Ensure directories exist
const imagePath = path.join(__dirname, TOUR_IMAGES_PATH);
const videoPath = path.join(__dirname, TOUR_VIDEO_PATH);

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDirectoryExists(imagePath);  // ✅ Ensure image upload path
ensureDirectoryExists(videoPath);  // ✅ Ensure video upload path

// Setup Multer
const multer = configureMulter({ imagePath, videoPath });

// ✅ Submit a destination
router.post("/submit", multer.fields([
  { name: "titleImage", maxCount: 1 },
  { name: "gallery", maxCount: 10 }
]), async (req, res) => {
  try {
    const {
      name,
      country,
      city,
      description,
      lat,
      lng,
      alt,
      attractions,
      isPopular,
      status
    } = req.body;

    const authorId = req.user?.email || "guest@example.com";

    const timestamp = Date.now();
    let titleImage = null;
    let galleryImages = [];

    // ✅ Save title image
    if (req.files?.titleImage?.length > 0) {
      const file = req.files.titleImage[0];
      const newFileName = `${timestamp}-title-${file.originalname}`;
      const newPath = path.join(imagePath, newFileName);
      ensureDirectoryExists(path.dirname(newPath));
      fs.renameSync(file.path, newPath);
      titleImage = path.join(TOUR_IMAGES_PATH, newFileName);
    }

    // ✅ Save gallery images
    if (req.files?.gallery?.length > 0) {
      req.files.gallery.forEach((file, idx) => {
        const newFileName = `${timestamp}-gallery-${idx}-${file.originalname}`;
        const newPath = path.join(imagePath, newFileName);
        ensureDirectoryExists(path.dirname(newPath));
        fs.renameSync(file.path, newPath);
        galleryImages.push(path.join(TOUR_IMAGES_PATH, newFileName));
      });
    }

    // ✅ Parse attractions if sent as string
    const parsedAttractions = typeof attractions === "string"
      ? attractions.split(",").map(a => a.trim())
      : Array.isArray(attractions) ? attractions : [];

    // ✅ Create DB entry
    const newDestination = await db.create(Destination, {
      name,
      country,
      city,
      description,
      coordinates: {
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        alt: alt ? Number(alt) : undefined,
      },
      titleImage,
      gallery: galleryImages,
      attractions: parsedAttractions,
      isPopular: isPopular === "true" || isPopular === true,
      status: status || "active",
    });

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      data: newDestination
    });

  } catch (error) {
    // ✅ Cleanup files on error
    Object.values(req.files || {}).flat().forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    console.error("Error creating destination:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
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


// ✅ Update a destination
router.put("/update/:id", multer.fields([
  { name: "titleImage", maxCount: 1 },
  { name: "gallery", maxCount: 10 }
]), async (req, res) => {
  try {
    const { name, country, city, description, attractions, status, lat, lng, alt } = req.body;

    const updateData = {
      name,
      country,
      city,
      description,
      status,
      coordinates: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        alt: parseFloat(alt),
      },
    };

    // Handle attractions array
    if (attractions) {
      updateData.attractions = Array.isArray(attractions)
        ? attractions
        : attractions.split(",").map(a => a.trim());
    }

    // Update title image if uploaded
    if (req.files?.titleImage?.length > 0) {
      const timestamp = Date.now();
      const file = req.files.titleImage[0];
      const newFileName = `${timestamp}-${file.originalname}`;
      const newPath = path.join(imagePath, newFileName);
      fs.renameSync(file.path, newPath);
      updateData.titleImage = path.join(TOUR_IMAGES_PATH, newFileName);
    }

    // Update gallery images if uploaded
    if (req.files?.gallery?.length > 0) {
      const timestamp = Date.now();
      updateData.gallery = [];

      req.files.gallery.forEach((file, index) => {
        const newFileName = `${timestamp}-${index}-${file.originalname}`;
        const newPath = path.join(imagePath, newFileName);
        fs.renameSync(file.path, newPath);
        updateData.gallery.push(path.join(TOUR_IMAGES_PATH, newFileName));
      });
    }

    // Perform DB update
    const updatedDestination = await db.updateById(Destination, req.params.id, updateData);

    if (!updatedDestination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    res.json({ success: true, message: "Destination updated successfully", data: updatedDestination });

  } catch (error) {
    // Cleanup on error
    Object.values(req.files || {}).flat().forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    console.error("Error updating destination:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
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
