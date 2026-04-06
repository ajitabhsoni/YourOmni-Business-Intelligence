const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  title: String,
  message: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  
  // ✅ NEW FIELDS - ALL OPTIONAL (won't break existing code)
  channels: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  targetSegment: {
    type: String,
    enum: ["all", "active", "inactive", "new"],
    default: "all"
  },
  
  // ✅ EXISTING FIELDS - KEPT EXACTLY AS YOURS
  totalCustomers: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failCount: { type: Number, default: 0 },
  
  // ✅ NEW STATS FIELDS (separate counts)
  emailSentCount: { type: Number, default: 0 },
  emailFailCount: { type: Number, default: 0 },
  smsSentCount: { type: Number, default: 0 },
  smsFailCount: { type: Number, default: 0 },
  
  // ✅ UPDATED status enum - added 'failed' state
  status: {
    type: String,
    enum: ["pending", "sending", "sent", "failed", "draft"],
    default: "pending"
  },
  
  sentAt: { type: Date }
});

module.exports = mongoose.model("Offer", schema);