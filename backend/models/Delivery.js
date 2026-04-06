const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },

  // ✅ EXISTING FIELDS 
  email: String,
  mobile: String,
  status: String,  // sent / failed
  reason: String,

  attempts: [{
    channel: { type: String, enum: ["email", "sms"] },
    status: { type: String, enum: ["sent", "failed"] },
    reason: String,
    timestamp: { type: Date, default: Date.now }
  }]

}, { timestamps: true }); // ✅ Your existing timestamps

module.exports = mongoose.model("Delivery", deliverySchema);