const express = require('express');
const router = express.Router();
const razorpay = require('../utils/razorpay-setup');
const Payment = require('../models/payment'); // ✅ Import the Payment model
require('dotenv').config(); // Ensure env vars are available

// ✅ Home page
// router.get('/', (req, res) => {
// //   res.render('index', { title: "Welcome to Razorpay" });
// res.sendFile(path.join(__dirname, 'views', 'index.html'));
// });

// ✅ Create Razorpay Order
router.post('/create/orderId', async (req, res) => {
  const options = {
    amount: 5000 * 100, // in paise
    currency: "INR",
  };

  try {
    const order = await razorpay.orders.create(options);
    res.send(order);

    await Payment.create({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'pending',
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send('Error creating order');
  }
});

// ✅ Verify Razorpay Payment
router.post('/api/payment/verify', async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');

    const isValid = validatePaymentVerification(
      { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
      signature,
      secret
    );

    if (isValid) {
      const payment = await Payment.findOne({ orderId: razorpayOrderId });
      if (!payment) return res.status(404).send('Payment record not found');

      payment.paymentId = razorpayPaymentId;
      payment.signature = signature;
      payment.status = 'completed';
      await payment.save();

      res.json({ status: 'success' });
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send('Error verifying payment');
  }
});

module.exports = router;
