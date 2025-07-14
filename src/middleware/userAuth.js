const CONSTS = require("../config/consts"); // Ensure correct path
const { verifyToken } = require("../utils/jwt"); // Adjust path as needed


module.exports = {

    isValidAdminLogin(req, res, next) {
        try {
            const authHeader = req.headers.authorization; // ✅ Extract token from header
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ error: "Unauthorized: No token provided" });
            }
            const token = authHeader.split(" ")[1];
            const decoded = verifyToken(token);

            if(!decoded || decoded?.role !== 'ADMIN'){
                return res.status(403).json({ error: "Forbidden: Invalid token or Invalid Admin Role" });
            }
            req.user = decoded;
            next();
        } catch (err) {
            console.error("Admin auth error:", err);
            return res.status(403).json({ error: "Invalid or expired token" });
        }
    },

    isValidSuperAdminLogin(req, res, next) {
        try {
            const authHeader = req.headers.authorization; // ✅ Extract token from header
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ error: "Unauthorized: No token provided" });
            }
            const token = authHeader.split(" ")[1];
            const decoded = verifyToken(token);

            if(!decoded || decoded?.role !== 'SUPERADMIN'){
                return res.status(403).json({ error: "Forbidden: Invalid token or Invalid Admin Role" });
            }
            req.user = decoded;
            next();
        } catch (err) {
            console.error("Admin auth error:", err);
            return res.status(403).json({ error: "Invalid or expired token" });
        }
    },

    isValidUserLogin(req, res, next) {

        // Extract token from header
        const token = req.headers.authorization?.split(" ")[1];
        // console.log("Extracted Token:", token);

        if (!token) {
            return res.status(401).json({ err: true, msg: "Access Denied. No Token Provided." });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(403).json({ err: true, msg: "Invalid or Expired Token." });
        }

        // Fix role check (use AND instead of OR)
        if (decoded.role !== "USER") {
            return res.status(403).json({ err: true, msg: "Forbidden: User access only." });
        }

        req.user = decoded; // Attach admin data to request
        next(); // Proceed to next middleware or route handler
    },

};
