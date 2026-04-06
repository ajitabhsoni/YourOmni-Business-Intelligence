const User = require("../models/User");

exports.myProfile = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("name email phone role profileImage");

  res.json(user);
};

exports.updateProfileImage = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    profileImage: req.file.filename
  });

  res.json({ message: "Updated" });
};
