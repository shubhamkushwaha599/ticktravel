const mongoose = require('mongoose');

const tourPackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    highlights: [String],

    availableDates: [
      {
        from: { type: Date, required: true },
        to: { type: Date, required: true },
        capacity: { type: Number, default: 1 },
        bookedCount: { type: Number, default: 0 },
        remainingCapacity: { type: Number, default: 1 }, // ✅ Added
        duration: { type: Number }, // ✅ Added (optional override of durationDays)
      },
    ],

    price: {
      adult: { type: Number, required: true },
      child: { type: Number, default: 0 },
      infant: { type: Number, default: 0 },
    },

    includes: [String],
    excludes: [String],

    titleImage: {
      type: String,
    },

    tourImages: {
      type: [String],
      default: [],
    },

    videoUrl: {
      type: String,
    },

    faqs: [
      {
        question: String,
        answer: String,
      },
    ],

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tourPackageSchema.index({ createdAt: -1 });
tourPackageSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('TourPackage', tourPackageSchema);
