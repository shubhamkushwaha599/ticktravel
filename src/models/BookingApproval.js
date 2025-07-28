const mongoose = require("mongoose");

const BookingApprovalSchema = new mongoose.Schema({
  booking_id : {type : String},
  payment_status: {type : String},
  status: { type: String, default: "Pending" }, // enum.ApprovalStatus.Pending
  payment_id: {type : String},

  
  admin_remark : { type: String },
  admin_approved : {type: Boolean, default : false},

  last_modified_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // <- New field
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("BookingApproval", BookingApprovalSchema);
