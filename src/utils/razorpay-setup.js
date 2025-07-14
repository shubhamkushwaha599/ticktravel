const CONST = require('../config/consts')
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: CONST.RAZORPAY_KEY_ID,
  key_secret: CONST.RAZORPAY_KEY_SECRET,
});


module.exports = razorpay;