const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/customerController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/upload", auth, upload.single("file"), ctrl.uploadCustomers);


router.get("/", auth, ctrl.getCustomers);
router.post("/", auth, ctrl.addCustomer);
router.delete("/:id", auth, ctrl.deleteCustomer);

module.exports = router;
