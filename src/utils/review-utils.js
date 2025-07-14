// utils/reviewUtils.js
const Review = require('../models/Review');
const TourPackage = require('../models/TourPackage');

async function updateTourPackageRating(tourPackageId) {
  const reviews = await Review.find({ tourPackage: tourPackageId });

  const count = reviews.length;
  const average = count > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : 0;

  await TourPackage.findByIdAndUpdate(tourPackageId, {
    rating: {
      average,
      count,
    },
  });
}

module.exports = { updateTourPackageRating };
