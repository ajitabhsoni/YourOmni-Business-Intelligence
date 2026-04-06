const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fileName: String,
  data: Array,
  columns: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Dataset", datasetSchema);