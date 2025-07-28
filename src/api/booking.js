const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');

// Import utility functions
const { createBooking } = require('../utils/bookingUtils');

// Create Booking
router.post('/create', async (req, res) => {
  try {
    const user = req.user?.id;

    const {
      tourPackage: tourPackageId,
      selectedDate,
      guests,
      contactInfo,
      notes,
    } = req.body;

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
    console.error('Error creating booking:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
});


// Update Booking
router.put('/:id/update', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const user = req.user?.id;

    const {
      tourPackage: newTourPackageId,
      selectedDate,
      guests,
      contactInfo,
      notes,
    } = req.body;

    const updatedBooking = await updateBooking({
      bookingId,
      user,
      newTourPackageId,
      selectedDate,
      guests,
      contactInfo,
      notes,
    });

    res.status(200).json({
      message: 'Booking updated successfully',
      data: updatedBooking,
    });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
});


module.exports = router;