const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["owner", "employee"] },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  name: String,
  email: String,
  phone: String,
  password: String,
  profileImage: String,
  lastActive: Date,
isOnline: { type: Boolean, default: false },

  approved: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);
