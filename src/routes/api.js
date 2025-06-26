const express = require("express");
const router = express.Router();


router.get("/ping", (req, res) => {
  res.json({ err: false, msg: "pong", time: Date.now() });
});

// -----------admin routes-------------
router.use("/admin/tourpackage", require("../admin/tourpackage"));
router.use("/admin/destination", require("../admin/destination"));

// ------user login and registration------
router.use("/auth", require("../api/register"));
router.use("/user", require("../api/user"));

// -----search api-----
router.use("/search", require("../api/common"));
router.use("tourpackage", require("../api/tourpackage"));


module.exports = router;
