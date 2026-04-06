const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const User = require("../models/User");
const Company = require("../models/Company");

exports.ownerRegister = async (req, res) => {
  const { name, email, phone, password, companyName, businessType } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const company = await Company.create({
    name: companyName,
    businessType,
    secretCode: uuid().slice(0, 6)
  });

  await User.create({
    role: "owner",
    companyId: company._id,
    name,
    email,
    phone,
    password: hash,
    approved: true
  });

  res.json({ message: "Owner registered", secretCode: company.secretCode });
};

exports.employeeRegister = async (req, res) => {
  const { name, email, phone, password, secretCode } = req.body;

  const company = await Company.findOne({ secretCode });
  if (!company) return res.status(400).json({ message: "Invalid code" });

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    role: "employee",
    companyId: company._id,
    name,
    email,
    phone,
    password: hash,
    approved: false
  });

  res.json({ message: "Request sent to owner" });
};

// FIND THIS - your login function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // ✅ FIX: Make sure you're sending user data in THIS format
    const token = jwt.sign(
      { id: user._id, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // ✅ CORRECT RESPONSE FORMAT
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || "",
        phone: user.phone || "",
        companyId: user.companyId
      }
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};