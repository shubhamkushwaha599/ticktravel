const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    country: {
      type: String,
      required: true,
      index: true,
    },

    city: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    coordinates: {
      lat: { type: Number },      // Latitude
      lng: { type: Number },      // Longitude
      alt: { type: Number },      // Altitude (in meters, optional)
    },

    titleImage: {
      type: String,
    },

    gallery: {
      type: [String],
      default: [],
    },

    attractions: {
      type: [String],
      default: [],
    },

    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔍 Optional: Text search index
destinationSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Destination', destinationSchema);
