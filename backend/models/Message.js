const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  seen: { type: Boolean, default: false },
  
type: { type: String, default: "text" },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);
