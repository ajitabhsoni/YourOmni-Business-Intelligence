const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token)
    return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    // ✅ update activity every request
    await User.findByIdAndUpdate(decoded.id, {
      lastActive: new Date(),
      online: true
    });

    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
