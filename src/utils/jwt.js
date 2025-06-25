const jwt = require("jsonwebtoken");
const CONSTS = require("../config/consts"); // Store your secret key

// Generate JWT Token
const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name, // User's full name
        photoUrl: user.photoUrl || "", // Profile photo URL
        extraInfo: user.extraInfo || {}, // Additional user details
        exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60, // Expiry time (2 hours)
    };

    return jwt.sign(payload, CONSTS.JWT_SECRET);
};

// Verify JWT Token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, CONSTS.JWT_SECRET);
    } catch (err) {
        return null; // Return null if verification fails
    }
};

module.exports = { generateToken, verifyToken };
