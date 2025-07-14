// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tourPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'TourPackage', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
  },
  { timestamps: true }
);

// Prevent duplicate review from same user on same tour package
reviewSchema.index({ user: 1, tourPackage: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
