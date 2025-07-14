// routes/reviews.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { updateTourPackageRating } = require('../utils/review-utils');

// Create review
router.post('/submit', async (req, res) => {
  try {
    const user = req.user; // Assuming user is set in req.user by authentication middleware
    
    const { tourPackage, rating, comment } = req.body;
    const review = await Review.create({ user, tourPackage, rating, comment });

    await updateTourPackageRating(tourPackage);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get reviews for a tour package
router.get('/tour/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ tourPackage: req.params.id })
      .populate('user', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
