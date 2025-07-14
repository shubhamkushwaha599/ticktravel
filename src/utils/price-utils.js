// utils/bookingPrice.js
function calculateTotalPrice(guests, price) {
  return (
    guests.adults * price.adult +
    guests.children * price.child +
    guests.infants * price.infant
  );
}

module.exports = { calculateTotalPrice };
