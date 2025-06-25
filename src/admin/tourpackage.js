const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// -------------file imports----------------------------
const db = require("../dbqueries/dbqueries");
const configureMulter = require("../utils/multer-setup");
const { TOUR_IMAGES_PATH, TOUR_VIDEO_PATH } = require("../config/consts");

// -------------models imports-------------------
const TourPackage = require("../models/TourPackage");

// Ensure directories exist
const imagePath = path.join(__dirname, TOUR_IMAGES_PATH);
const videoPath = path.join(__dirname, TOUR_VIDEO_PATH);

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDirectoryExists(imagePath);
ensureDirectoryExists(videoPath);

// Setup Multer
const multer = configureMulter({ imagePath, videoPath });

router.post("/submit", multer.fields([
  { name: "titleImage", maxCount: 1 },
  { name: "tourImages", maxCount: 10 },
  { name: "videoUrl", maxCount: 1 }
]), async (req, res) => {
  try {
    const authorId = req.body.authorId || "guest@example.com";

    const {
      title,
      description,
      destination,
      durationDays,
      capacity,
      status,
      highlights,
      includes,
      excludes,
      "price[adult]": adultPrice,
      "price[child]": childPrice,
      "price[infant]": infantPrice,
    } = req.body;

    // Parse availableDates
    const availableDates = [];
    for (let i = 0; req.body[`availableDates[${i}][from]`]; i++) {
      availableDates.push({
        from: new Date(req.body[`availableDates[${i}][from]`]),
        to: new Date(req.body[`availableDates[${i}][to]`])
      });
    }

    // Handle media
    const timestamp = Date.now();
    let titleImage = null;
    const tourImages = [];
    let videoFile = null;

    if (req.files?.titleImage?.length > 0) {
      const file = req.files.titleImage[0];
      const newFileName = `${timestamp}-${file.originalname}`;
      const newPath = path.join(imagePath, newFileName);
      fs.renameSync(file.path, newPath);
      titleImage = path.join(TOUR_IMAGES_PATH, newFileName);
    }

    if (req.files?.tourImages?.length > 0) {
      req.files.tourImages.forEach((file, index) => {
        const newFileName = `${timestamp}-${index}-${file.originalname}`;
        const newPath = path.join(imagePath, newFileName);
        fs.renameSync(file.path, newPath);
        tourImages.push(path.join(TOUR_IMAGES_PATH, newFileName));
      });
    }

    if (req.files?.videoUrl?.length > 0) {
      const file = req.files.videoUrl[0];
      const newFileName = `${timestamp}-${file.originalname}`;
      const newPath = path.join(videoPath, newFileName);
      fs.renameSync(file.path, newPath);
      videoFile = path.join(TOUR_VIDEO_PATH, newFileName);
    }

    // Create document
    const newPackage = await db.create(TourPackage, {
      authorId,
      title,
      description,
      destination,
      highlights: Array.isArray(highlights) ? highlights : [highlights].filter(Boolean),
      includes: Array.isArray(includes) ? includes : [includes].filter(Boolean),
      excludes: Array.isArray(excludes) ? excludes : [excludes].filter(Boolean),
      durationDays: Number(durationDays),
      capacity: Number(capacity) || 1,
      availableDates,
      price: {
        adult: Number(adultPrice) || 0,
        child: Number(childPrice) || 0,
        infant: Number(infantPrice) || 0, 
      },
      titleImage,
      tourImages,
      videoUrl: videoFile,
      status: status || 'active',
    });

    res.status(201).json({ message: "Tour package submitted successfully", data: newPackage });

  } catch (error) {
    Object.values(req.files || {}).flat().forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
    console.error("Error in tour package submission:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// update tour package
router.put("/update/:id", multer.fields([
  { name: "titleImage", maxCount: 1 },
  { name: "tourImages", maxCount: 10 },
  { name: "videoUrl", maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      description,
      destination,
      highlights,
      durationDays,
      capacity,
      includes,
      excludes,
      availableDates,
      status,
      price
    } = req.body;

    const timestamp = Date.now();
    const updateData = {};

    // 🔤 Basic fields
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (destination) updateData.destination = destination;
    if (status) updateData.status = status;
    if (durationDays) updateData.durationDays = Number(durationDays);
    if (capacity) updateData.capacity = Number(capacity);

    // 🧾 Arrays
    if (highlights) updateData.highlights = Array.isArray(highlights) ? highlights : [highlights];
    if (includes) updateData.includes = Array.isArray(includes) ? includes : [includes];
    if (excludes) updateData.excludes = Array.isArray(excludes) ? excludes : [excludes];

    // 🗓️ Available Dates
    if (availableDates) {
      try {
        const parsed = JSON.parse(availableDates);
        updateData.availableDates = parsed.map(d => ({
          from: new Date(d.from),
          to: new Date(d.to)
        }));
      } catch (e) {
        return res.status(400).json({ success: false, message: "Invalid format for availableDates" });
      }
    }

    // 💰 Price object
    if (price) {
      try {
        const parsedPrice = typeof price === "string" ? JSON.parse(price) : price;
        updateData.price = {
          ...(parsedPrice.adult && { adult: Number(parsedPrice.adult) }),
          ...(parsedPrice.child && { child: Number(parsedPrice.child) }),
          ...(parsedPrice.infant && { infant: Number(parsedPrice.infant) })
        };
      } catch (e) {
        return res.status(400).json({ success: false, message: "Invalid format for price" });
      }
    }

    // 🖼️ Media handling
    if (req.files?.titleImage?.length > 0) {
      const file = req.files.titleImage[0];
      const newFileName = `${timestamp}-${file.originalname}`;
      const newPath = path.join(imagePath, newFileName);
      fs.renameSync(file.path, newPath);
      updateData.titleImage = path.join(TOUR_IMAGES_PATH, newFileName);
    }

    if (req.files?.tourImages?.length > 0) {
      updateData.tourImages = [];
      req.files.tourImages.forEach((file, index) => {
        const newFileName = `${timestamp}-${index}-${file.originalname}`;
        const newPath = path.join(imagePath, newFileName);
        fs.renameSync(file.path, newPath);
        updateData.tourImages.push(path.join(TOUR_IMAGES_PATH, newFileName));
      });
    }

    if (req.files?.videoUrl?.length > 0) {
      const file = req.files.videoUrl[0];
      const newFileName = `${timestamp}-${file.originalname}`;
      const newPath = path.join(videoPath, newFileName);
      fs.renameSync(file.path, newPath);
      updateData.videoUrl = path.join(TOUR_VIDEO_PATH, newFileName);
    }

    const updated = await db.updateById(TourPackage, req.params.id, updateData);

    if (!updated) {
      return res.status(404).json({ success: false, message: "Tour not found" });
    }

    res.json({ success: true, data: updated });

  } catch (err) {
    console.error("Update Tour Error:", err);
    Object.values(req.files || {}).flat().forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
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
