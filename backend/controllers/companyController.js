const User = require("../models/User");

exports.pendingEmployees = async (req, res) => {
  const list = await User.find({
    companyId: req.user.companyId,
    role: "employee",
    approved: false
  });

  res.json(list);
};

exports.approveEmployee = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { approved: true });
  res.json({ message: "Approved" });
};
// team members
exports.teamMembers = async (req, res) => {
  const User = require("../models/User");

  const users = await User.find({
    companyId: req.user.companyId,
    approved: true
  }).select("name email role");

  res.json(users);
};
// owner only remove
exports.removeEmployee = async (req, res) => {
  if (req.user.role !== "owner")
    return res.status(403).json({ message: "Only owner can remove" });

  const User = require("../models/User");
  await User.findByIdAndDelete(req.params.id);

  res.json({ message: "Removed" });
};
