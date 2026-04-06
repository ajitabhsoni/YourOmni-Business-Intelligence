const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const ctrl = require("../controllers/userController");

router.get("/me", auth, ctrl.myProfile);
router.post("/avatar", auth, upload.single("image"), ctrl.updateProfileImage);

// module.exports = router;
// const router = require("express").Router();

const User = require("../models/User");

// get user by id
router.get("/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    name: user.name,
    profileImage: user.profileImage,
    lastActive: user.lastActive,
    online: user.online
  });
});


module.exports = router;
