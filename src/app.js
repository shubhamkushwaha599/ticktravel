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

// ✅ Import cron job AFTER DB connection is ready
require('./utils/availability-cron');

// dymanic web root
app.use('/api', require('./routes/api'));


// -------for dummy payment checks------------------
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'index.html'));
// });
// --------------------must be removed---------------

// fallback route for static files
app.get("*", (req, res) => {
  // res.send("this is fall back route.")
  // res.sendFile(path.join(__dirname, "views", "tourpackage.html"));
  // res.sendFile(path.join(__dirname, "views", "index.html"));
  res.sendFile(path.join(__dirname, "views", "booking.html"));

  // res.render("index");
  // res.render('razorpay', { title: "Welcome to Razorpay" }); // Pass variables if needed
});


module.exports = app;
