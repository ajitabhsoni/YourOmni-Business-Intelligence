const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/offerController");

// Your existing routes
router.post("/", auth, ctrl.create);
router.get("/", auth, ctrl.getAll);
router.put("/approve/:id", auth, ctrl.approve);
router.post("/resend/:id", auth, ctrl.resend);
router.post("/generate", auth, ctrl.generateText);
router.get("/failed/:id", auth, ctrl.failedList);

// ✅ NEW ROUTES
router.delete("/failed/:offerId/:customerId", auth, ctrl.deleteFailedCustomer);
router.put("/channels/:id", auth, ctrl.updateChannels);

module.exports = router;