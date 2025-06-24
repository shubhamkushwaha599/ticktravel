const mongoose = require('mongoose');

const tourPackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // slug: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   lowercase: true,
    //   index: true, // 🔍 fast lookup by slug
    // },

    destination: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    highlights: [String],

    durationDays: {
      type: Number,
      required: true,
      index: true, // 🔍 allow filtering by duration
    },

    capacity: {
      type: Number,
      default: 1,
    },

    availableDates: [
      {
        from: Date,
        to: Date,
      },
    ],

    price: {
      adult: { type: Number, required: true },
      child: { type: Number, default: 0 },
      infant: { type: Number, default: 0 },
    },

    includes: [String],
    excludes: [String],

    // 🖼️ Media
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

    // isFeatured: {
    //   type: Boolean,
    //   default: false,
    //   index: true, // 🔍 query featured tours
    // },

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
      index: true, // 🔍 fast filter for active tours
    },
  },
  {
    timestamps: true,
  }
);

// 🧠 Compound Index (optional, for sorted homepage sections)
tourPackageSchema.index({ createdAt: -1 });

// 🧠 Text Index (for full-text search)
tourPackageSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('TourPackage', tourPackageSchema);
