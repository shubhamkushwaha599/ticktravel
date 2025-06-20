const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ err: false, msg: 'This is the article API endpoint.' });
});

module.exports = router;
