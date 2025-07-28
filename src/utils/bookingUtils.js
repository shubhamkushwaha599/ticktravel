const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');
const BookingApproval = require('../models/BookingApproval');

async function createBooking({ user, tourPackageId, selectedDate, guests, contactInfo, notes }) {
  if (!user || !tourPackageId || !selectedDate?.from || !selectedDate?.to || !guests?.adults || !contactInfo?.email) {
    throw { status: 400, message: 'Missing required fields' };
  }

  const tourPackage = await TourPackage.findById(tourPackageId);
  if (!tourPackage) {
    throw { status: 404, message: 'Tour package not found' };
  }

  const selectedFrom = new Date(selectedDate.from);
  const selectedTo = new Date(selectedDate.to);

  const matchingDate = tourPackage.availableDates.find((range) =>
    new Date(range.from).getTime() === selectedFrom.getTime() &&
    new Date(range.to).getTime() === selectedTo.getTime()
  );

  if (!matchingDate) {
    throw { status: 400, message: 'Selected date not available for this tour package' };
  }

  const totalGuests = guests.adults + (guests.children || 0) + (guests.infants || 0);
  if (matchingDate.remainingCapacity < totalGuests) {
    throw { status: 400, message: 'Not enough capacity available on selected dates' };
  }

  const price = tourPackage.price;
  const totalAmount =
    (price.adult * guests.adults) +
    (price.child * (guests.children || 0)) +
    (price.infant * (guests.infants || 0));

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

  return newBooking;
}


const updateBooking = async ({ bookingId, user, guests, contactInfo, notes, payment_id }) => {
  if (!guests?.adults || !contactInfo?.email) {
    throw { status: 400, message: 'Missing required fields' };
  }

  const booking = await Booking.findById(bookingId).populate('tourPackage');
  if (!booking) {
    throw { status: 404, message: 'Booking not found' };
  }

  const userId = typeof user === 'object' ? user.id : user;

  if (userId && booking.user.toString() !== userId) {
    throw { status: 403, message: 'Unauthorized to update this booking' };
  }

  // Recalculate total
  const price = booking.tourPackage.price;
  const totalAmount =
    (price.adult * guests.adults) +
    (price.child * (guests.children || 0)) +
    (price.infant * (guests.infants || 0));

  // Update booking details
  booking.guests = guests;
  booking.contactInfo = contactInfo;
  booking.notes = notes;
  booking.totalAmount = totalAmount;

  if (payment_id) {
    booking.payment_id = payment_id;
    booking.bookingStatus = 'pending';
    booking.last_modified_by = userId;

    let bookingApproval = await BookingApproval.findOne({ bookingId });

    if (!bookingApproval) {
      bookingApproval = new BookingApproval({
        bookingId,
        payment_id,
        payment_status: 'confirmed',
        status: 'pending',
        created_by: userId,
        last_modified_by: userId,
      });

      await bookingApproval.save();
    }
  }

  await booking.save();

  return booking;
};


// const updateBooking = async ({ bookingId, user, guests, contactInfo, notes, payment_id }) => {
//   if (!guests?.adults || !contactInfo?.email) {
//     throw { status: 400, message: 'Missing required fields' };
//   }

//   const booking = await Booking.findById(bookingId).populate('tourPackage');
//   if (!booking) {
//     throw { status: 404, message: 'Booking not found' };
//   }

//   if (user && booking.user.toString() !== user) {
//     throw { status: 403, message: 'Unauthorized to update this booking' };
//   }

//   // ✅ Recalculate total based on current tour package prices
//   const price = booking.tourPackage.price;
//   const totalAmount =
//     (price.adult * guests.adults) +
//     (price.child * (guests.children || 0)) +
//     (price.infant * (guests.infants || 0));

//   // ✅ Update booking fields
//   booking.guests = guests;
//   booking.contactInfo = contactInfo;
//   booking.notes = notes;
//   booking.totalAmount = totalAmount;

//   if (payment_id) {
//     booking.payment_id = payment_id;
//     booking.bookingStatus = 'pending';
//     booking.last_modified_by = user.id;

//     let bookingApproval = await BookingApproval.findOne({ bookingId });

//     if (!bookingApproval) {
//       bookingApproval = new BookingApproval({
//         bookingId,
//         payment_id,
//         payment_status: 'confirmed',
//         status: 'pending',
//         created_by: user.id,
//         last_modified_by: user.id
//       });

//       await bookingApproval.save();
//     }
//   }

//   await booking.save();

//   return booking;
// };

module.exports = {
  createBooking,
  updateBooking
};
