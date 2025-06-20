const express = require("express");
const router = express.Router();


router.get("/ping", (req, res) => {
  res.json({ err: false, msg: "pong", time: Date.now() });
});


router.use("/admin/tourpackage", require("../admin/tourpackage"));
router.use("/admin/destination", require("../admin/destination"));

module.exports = router;
