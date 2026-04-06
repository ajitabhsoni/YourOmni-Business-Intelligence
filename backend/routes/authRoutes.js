const router = require("express").Router();
const ctrl = require("../controllers/authController");

router.post("/owner-register", ctrl.ownerRegister);
router.post("/employee-register", ctrl.employeeRegister);
router.post("/login", ctrl.login);

module.exports = router;
