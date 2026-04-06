const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/chatController");
const upload = require("../middleware/upload");


router.post("/file", auth, upload.single("file"), ctrl.sendFile);
router.post("/send", auth, ctrl.sendMessage);
router.get("/:userId", auth, ctrl.getMessages);
router.put("/seen/:userId", auth, ctrl.markSeen);


module.exports = router;
