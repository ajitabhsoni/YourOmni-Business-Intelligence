const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/companyController");

router.get("/pending", auth, ctrl.pendingEmployees);
router.put("/approve/:id", auth, ctrl.approveEmployee);
router.get("/team", auth, ctrl.teamMembers);
router.delete("/remove/:id", auth, ctrl.removeEmployee);


module.exports = router;
