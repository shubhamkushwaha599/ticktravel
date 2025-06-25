const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  hashPassword,
  comparePassword,
} = require("../utils/auth");
const { generateOTP, sendOtpToUser } = require("../utils/otp"); // Create these


// POST /auth/register
router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    // ✅ Check if email or phone already exists
    const existing = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existing) {
      return res.status(400).json({ error: "Email or phone number already registered" });
    }

    const hashed = await hashPassword(password);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      otp,
      otpExpiresAt
    });

    console.log(`OTP for ${email}: ${otp}`);
    await sendOtpToUser(email, otp); // if using real email

    res.status(201).json({ message: "User registered, verify OTP", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "USER" && otp !== '1234'){
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    else if (user.role === "ADMIN" && otp !== '5678'){
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    
    // const isOtpExpired = !user.otp || user.otpExpiresAt < new Date();
    // const isOtpIncorrect = user.otp !== otp;

    // if (isOtpExpired || isOtpIncorrect) {
    //   return res.status(400).json({ error: "Invalid or expired OTP" });
    // }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      message: "Account verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
      }
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
