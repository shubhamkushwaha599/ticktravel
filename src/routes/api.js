const express = require("express");
const router = express.Router();
const { isValidUserLogin, isValidAdminLogin } = require("../middleware/userAuth");

router.get("/ping", (req, res) => {
  res.json({ err: false, msg: "pong", time: Date.now() });
});

// -----------admin routes-------------
router.use("/admin/tourpackage", require("../admin/tourpackage"));
router.use("/admin/destination", isValidAdminLogin, require("../admin/destination"));

// -------------admin booking routes-------------
router.use("/admin/booking", require("../admin/booking"));
// -------------------------------------------------------------------

// ------user login and registration------
router.use("/auth", require("../api/register"));
router.use("/user", require("../api/user"));

// -----user logged in routes-----
router.use("/user/review", require("../api/review"));
router.use("/user/booking", isValidUserLogin, require("../api/booking"));
router.use("/payment", require('../api/payment'))

// -----search api-----
router.use("/search", require("../api/common"));
// router.use("/get-availability", require("../api/common"));
router.use("/tourpackage", require("../api/tourpackage"));
router.use("/destination", require("../api/destination"));


module.exports = router;
