const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: String,
  businessType: String,
  secretCode: String
});

module.exports = mongoose.model("Company", companySchema);
