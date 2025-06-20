const express = require("express");
const router = express.Router();


router.get("/ping", (req, res) => {
  res.json({ err: false, msg: "pong", time: Date.now() });
});

router.use("/article", require("../api/article"));


module.exports = router;
