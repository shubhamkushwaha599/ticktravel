const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    tourPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TourPackage',
      required: true,
    },

    selectedDate: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },

    guests: {
      adults: { type: Number, required: true },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },

    contactInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },

    totalAmount: {
      type: Number,
      required: true,
    },
    
    payment_id: { 
    type: String, 
    default: null               // ✅ Safe default
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'pending',
    },

    notes: {
      type: String,
    },

    expiryTime: {
      type: Date,
    }
  },
  { timestamps: true }
);

// ✅ Auto-set expiryTime to 30 minutes after createdAt
bookingSchema.pre('save', function (next) {
  if (!this.expiryTime) {
    this.expiryTime = new Date(this.createdAt.getTime() + 30 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
