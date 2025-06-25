const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpToUser = async (email, otp) => {
  // 🔁 Replace with real email/SMS sender
  console.log(`Send OTP ${otp} to email ${email}`);
};

module.exports = { generateOTP, sendOtpToUser };
