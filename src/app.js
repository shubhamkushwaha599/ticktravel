const path = require("path");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// connect to the database
require('./config/database').createDbConnection();

const app = express();

// load middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set("view engine", "ejs");

// dymanic web root
app.use('/api', require('./routes/api'));

// fallback route for static files
app.get("*", (req, res) => {
  res.send("this is fall back route.")
});


module.exports = app;
