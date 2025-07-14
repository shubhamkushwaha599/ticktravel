const cron = require('node-cron');
const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');

cron.schedule('*/30 * * * *', async () => {
  try {
    const now = new Date();

    // Find expired pending bookings
    const expiredBookings = await Booking.find({
      bookingStatus: 'pending',
      expiryTime: { $lt: now },
    });

    for (const booking of expiredBookings) {
      // Restore capacity
      const pkg = await TourPackage.findById(booking.tourPackage);
      const matchDate = pkg.availableDates.find(
        (d) =>
          new Date(d.from).getTime() === new Date(booking.selectedDate.from).getTime() &&
          new Date(d.to).getTime() === new Date(booking.selectedDate.to).getTime()
      );

      if (matchDate) {
        const guestsCount =
          booking.guests.adults + booking.guests.children + booking.guests.infants;
        matchDate.remainingCapacity += guestsCount;
        await pkg.save();
      }

      // Delete booking
      await booking.deleteOne();
      console.log(`Deleted expired booking: ${booking._id}`);
    }
  } catch (err) {
    console.error('Error cleaning up expired bookings:', err);
  }
});
