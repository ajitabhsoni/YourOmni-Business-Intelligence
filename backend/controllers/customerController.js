const detectCustomerColumns = require("../utils/customerColumnDetector");
const Customer = require("../models/Customer");
const csv = require("csv-parser");
const fs = require("fs");
// const detectCustomerColumns = require("../utils/customerColumnDetector");
const pdfParse = require("pdf-parse");

// GET ALL
exports.getCustomers = async (req, res) => {
  const list = await Customer.find({
    companyId: req.user.companyId
  }).sort({ createdAt: -1 });

  res.json(list);
};

// MANUAL ADD
exports.addCustomer = async (req, res) => {
  await Customer.create({
    companyId: req.user.companyId,
    name: req.body.name,
    mobile: req.body.mobile,
    email: req.body.email,
    createdBy: req.user.id
  });

  res.json({ message: "Added" });
};

// DELETE (OWNER ONLY)
exports.deleteCustomer = async (req, res) => {
  if (req.user.role !== "owner")
    return res.status(403).json({ message: "Only owner can delete" });

  await Customer.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

exports.uploadCustomers = async (req, res) => {
  const filePath = req.file.path;
  const name = req.file.originalname.toLowerCase();

  let rows = [];

  // 🟢 CSV
  if (name.endsWith(".csv")) {
    await new Promise((resolve) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", d => rows.push(d))
        .on("end", resolve);
    });
  }

  // 🔴 PDF
  else if (name.endsWith(".pdf")) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);

    const lines = data.text
      .split("\n")
      .map(l => l.trim())
      .filter(l => l);

    if (lines.length < 2)
      return res.status(400).json({ message: "No usable data" });

    const headers = lines[0].split(/\s+/);

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/\s+/);
      const obj = {};
      headers.forEach((h, j) => obj[h] = values[j]);
      rows.push(obj);
    }
  }

  else {
    return res.status(400).json({ message: "Unsupported file" });
  }

  if (!rows.length) return res.status(400).json({ message: "Empty file" });

  // 🎯 detect columns
  const headers = Object.keys(rows[0]);
  const map = detectCustomerColumns(headers);

  // 🎯 save
  for (const r of rows) {
    await Customer.create({
      companyId: req.user.companyId,
      name: r[map.name],
      mobile: r[map.mobile],
      email: r[map.email],
      createdBy: req.user.id
    });
  }

  res.json({ message: "Customers imported" });
};
