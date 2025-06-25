const express = require("express");
const router = express.Router();

const { generateOTP, sendOtpToUser } = require("../utils/otp");
const { generateToken } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/auth");
const User = require("../models/User");

// ✅ Login route - Step 1: Validate credentials & send OTP
router.post("/login", async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    if ((!email && !phone) || !password) {
      return res.status(400).json({ error: "Email or phone and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "User is not verified. Please complete registration or contact support." });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    await user.save();

    await sendOtpToUser(user.email, otp); // You can also send to phone via SMS if needed

    res.json({ message: "OTP sent for verification", userId: user._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Login-verify route - Step 2: Verify OTP and login
router.post("/login-verify", async (req, res) => {

  const { email, phone, otp } = req.body;

  try {
    if ((!email && !phone) || !otp) {
      return res.status(400).json({ error: "Email or phone and OTP are required" });
    }

    // ✅ Find user using email or phone
    const user = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    
    if (user.role === "USER" && otp !== '1234'){
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    else if (user.role === "ADMIN" && otp !== '5678'){
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    // -----------commenting out the OTP verification logic for now
    // const otpExpired = !user.otp || user.otpExpiresAt < new Date();
    // const otpMismatch = user.otp !== otp;

    // if (otpExpired || otpMismatch) {
    //   return res.status(400).json({ error: "Invalid or expired OTP" });
    // }

    // ✅ Clear OTP and save
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Login-verify error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
