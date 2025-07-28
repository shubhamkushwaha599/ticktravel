const express = require('express');
const router = express.Router();

// Import models
const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');
const BookingApproval = require('../models/BookingApproval');

// Import utility functions
const { createBooking, updateBooking } = require('../utils/bookingUtils');

// Import error utils
const {
  forbiddenError,
  notFoundError,
  badRequestError,
  internalServerError,
} = require('../utils/errors');


// ✅ Route: GET /bookings/all — Get all bookings
router.get('/all', async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('tourPackage')
      .populate('user');

    res.status(200).json({ data: bookings });
  } catch (err) {
    next(internalServerError('Failed to fetch bookings'));
  }
});


// ✅ Route: GET /bookings/getbyid/:id — Get booking by ID
router.get('/getbyid/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw badRequestError('Booking ID is required');

    const booking = await Booking.findById(id)
      .populate('tourPackage')
      .populate('user');

    if (!booking) throw notFoundError('Booking not found');

    res.status(200).json({ data: booking });
  } catch (err) {
    next(err);
  }
});


// ✅ Route: POST /bookings/create — Create a booking
router.post('/create', async (req, res, next) => {
  try {
    const user = req.user?.id;
    if (!user) throw forbiddenError('User must be logged in to create a booking');

    const {
      tourPackage: tourPackageId,
      selectedDate,
      guests,
      contactInfo,
      notes,
    } = req.body;

    if (!tourPackageId || !selectedDate || !guests || !contactInfo) {
      throw badRequestError('tourPackage, selectedDate, guests, and contactInfo are required');
    }

    const newBooking = await createBooking({
      user,
      tourPackageId,
      selectedDate,
      guests,
      contactInfo,
      notes,
    });

    res.status(201).json({
      message: 'Booking created successfully',
      data: newBooking,
    });
  } catch (err) {
    next(err);
  }
});


// ✅ Route: PUT /bookings/:id/update — Update booking
router.put('/:id/update', async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) throw badRequestError('Booking ID is required');

    const user = req.user?.id || req.user;
    if (!user) throw forbiddenError('User authentication required');

    const {
      guests,
      contactInfo,
      notes,
      payment_id,
    } = req.body;

    const updatedBooking = await updateBooking({
      bookingId,
      user,
      guests,
      contactInfo,
      notes,
      payment_id,
    });

    res.status(200).json({
      message: 'Booking updated successfully',
      data: updatedBooking,
    });
  } catch (err) {
    next(err);
  }
});


// ✅ Route: POST /bookings/:bookingId/action — Approve or reject a booking
router.post('/:bookingId/action', async (req, res, next) => {
  try {
    const user = req.user;
    const bookingId = req.params.bookingId;
    const { approval_id, action, remark } = req.body;

    if (!user?.id || !user?.role) throw forbiddenError('User authentication required');
    if (!approval_id || !action) throw badRequestError('approval_id and action are required');

    const booking = await Booking.findById(bookingId);
    if (!booking) throw notFoundError('Booking not found');

    const bookingApproval = await BookingApproval.findById(approval_id);
    if (!bookingApproval) throw notFoundError('Booking approval not found');

    if (bookingApproval.bookingId.toString() !== bookingId) {
      throw badRequestError('Approval does not match the booking');
    }

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      throw badRequestError('Invalid action. Must be APPROVED or REJECTED');
    }

    bookingApproval.status = action;
    bookingApproval.admin_approved = action === 'APPROVED';
    bookingApproval.admin_remark = remark || '';
    bookingApproval.last_modified_by = user.id;

    booking.status = action;
    booking.last_modified_by = user.id;

    await bookingApproval.save();
    await booking.save();

    res.json({ message: `Booking ${action.toLowerCase()} successfully` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
