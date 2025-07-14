const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');

// Create Booking
router.post('/create', async (req, res) => {
  try {
    const user = req.user?.id; // Assuming user is set by authentication middleware

    const {
    //   user, // should be set via auth middleware ideally
      tourPackage: tourPackageId,
      selectedDate,
      guests,
      contactInfo,
      notes,
    } = req.body;

    console.log(req.body)

    if (!user || !tourPackageId || !selectedDate?.from || !selectedDate?.to || !guests?.adults || !contactInfo?.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tourPackage = await TourPackage.findById(tourPackageId);

    if (!tourPackage) {
      return res.status(404).json({ error: 'Tour package not found' });
    }

    const selectedFrom = new Date(selectedDate.from);
    const selectedTo = new Date(selectedDate.to);

    const matchingDate = tourPackage.availableDates.find((range) =>
      new Date(range.from).getTime() === selectedFrom.getTime() &&
      new Date(range.to).getTime() === selectedTo.getTime()
    );

    if (!matchingDate) {
      return res.status(400).json({ error: 'Selected date not available for this tour package' });
    }

    const totalGuests = guests.adults + (guests.children || 0) + (guests.infants || 0);
    if (matchingDate.remainingCapacity < totalGuests) {
      return res.status(400).json({ error: 'Not enough capacity available on selected dates' });
    }

    // Calculate totalAmount from package price
    const price = tourPackage.price;
    const totalAmount =
      (price.adult * guests.adults) +
      (price.child * (guests.children || 0)) +
      (price.infant * (guests.infants || 0));

    // Create the booking
    const newBooking = await Booking.create({
      user,
      tourPackage: tourPackageId,
      selectedDate: {
        from: selectedFrom,
        to: selectedTo,
      },
      guests,
      contactInfo,
      totalAmount,
      notes,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
    });

    // Update remaining capacity
    matchingDate.remainingCapacity -= totalGuests;
    await tourPackage.save();

    res.status(201).json({
      message: 'Booking created successfully',
      data: newBooking,
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Internal server error' });
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

    if (!selectedDate?.from || !selectedDate?.to || !guests?.adults || !contactInfo?.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find existing booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Optional: enforce that only the same user can update
    if (user && booking.user.toString() !== user) {
      return res.status(403).json({ error: 'Unauthorized to update this booking' });
    }

    const oldTourPackage = await TourPackage.findById(booking.tourPackage);
    const newTourPackage = await TourPackage.findById(newTourPackageId);

    if (!newTourPackage) {
      return res.status(404).json({ error: 'New tour package not found' });
    }

    const selectedFrom = new Date(selectedDate.from);
    const selectedTo = new Date(selectedDate.to);

    const newDateRange = newTourPackage.availableDates.find(d =>
      new Date(d.from).getTime() === selectedFrom.getTime() &&
      new Date(d.to).getTime() === selectedTo.getTime()
    );

    if (!newDateRange) {
      return res.status(400).json({ error: 'Selected date not available in tour package' });
    }

    const newGuestCount = guests.adults + (guests.children || 0) + (guests.infants || 0);

    // 1. Restore old capacity
    const oldDateRange = oldTourPackage.availableDates.find(d =>
      new Date(d.from).getTime() === new Date(booking.selectedDate.from).getTime() &&
      new Date(d.to).getTime() === new Date(booking.selectedDate.to).getTime()
    );
    const oldGuestCount = booking.guests.adults + (booking.guests.children || 0) + (booking.guests.infants || 0);
    if (oldDateRange) {
      oldDateRange.remainingCapacity += oldGuestCount;
      await oldTourPackage.save();
    }

    // 2. Check new capacity
    if (newDateRange.remainingCapacity < newGuestCount) {
      return res.status(400).json({ error: 'Not enough capacity in new selected date range' });
    }

    // 3. Deduct new capacity
    newDateRange.remainingCapacity -= newGuestCount;
    await newTourPackage.save();

    // 4. Calculate new total amount
    const price = newTourPackage.price;
    const totalAmount =
      (price.adult * guests.adults) +
      (price.child * (guests.children || 0)) +
      (price.infant * (guests.infants || 0));

    // 5. Update booking
    booking.tourPackage = newTourPackageId;
    booking.selectedDate = { from: selectedFrom, to: selectedTo };
    booking.guests = guests;
    booking.contactInfo = contactInfo;
    booking.notes = notes;
    booking.totalAmount = totalAmount;
    await booking.save();

    res.status(200).json({
      message: 'Booking updated successfully',
      data: booking,
    });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Booking
// router.put('/update/:bookingId', async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(bookingId)) {
//       return res.status(400).json({ error: 'Invalid booking ID' });
//     }

//     const booking = await Booking.findById(bookingId);
//     if (!booking) {
//       return res.status(404).json({ error: 'Booking not found' });
//     }

//     const {
//       selectedDate,
//       guests,
//       contactInfo,
//       notes,
//       paymentStatus,
//       bookingStatus,
//     } = req.body;

//     // Optional: validate updated dates
//     if (selectedDate?.from && selectedDate?.to) {
//       const from = new Date(selectedDate.from);
//       const to = new Date(selectedDate.to);

//       const tourPackage = await TourPackage.findById(booking.tourPackage);
//       const match = tourPackage.availableDates.find(
//         (range) =>
//           new Date(range.from).getTime() === from.getTime() &&
//           new Date(range.to).getTime() === to.getTime()
//       );

//       if (!match) {
//         return res.status(400).json({ error: 'Selected date is not available in package' });
//       }

//       booking.selectedDate = { from, to };
//     }

//     if (guests) booking.guests = guests;
//     if (contactInfo) booking.contactInfo = contactInfo;
//     if (notes !== undefined) booking.notes = notes;
//     if (paymentStatus) booking.paymentStatus = paymentStatus;
//     if (bookingStatus) booking.bookingStatus = bookingStatus;

//     await booking.save();

//     res.json({
//       message: 'Booking updated successfully',
//       data: booking,
//     });
//   } catch (err) {
//     console.error('Error updating booking:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


module.exports = router;