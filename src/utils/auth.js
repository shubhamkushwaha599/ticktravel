const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePassword = async (password, hash) => bcrypt.compare(password, hash);
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

module.exports = { hashPassword, comparePassword, generateOTP, generateToken };
