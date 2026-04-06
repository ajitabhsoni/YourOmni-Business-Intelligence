const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const ctrl = require("../controllers/datasetController");
const forecaster = require("../services/forecaster");

// router.post("/upload", auth, upload.single("file"), ctrl.uploadDataset);
router.post("/upload", auth, (req, res, next) => {
  upload.single("file")(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, ctrl.uploadDataset);
router.get("/", auth, ctrl.getDatasets);
router.delete("/:id", auth, ctrl.deleteDataset);
router.get("/stats/:id", auth, ctrl.datasetStats);
router.post("/ask/:id", auth, ctrl.askDataset);
router.post("/ask-ai/:id", auth, ctrl.askAI);
// router.get("/forecast/:id", auth, ctrl.forecast);
router.get("/forecast/:id", auth, forecaster.forecast);

router.get("/strategy/:id", auth, ctrl.strategy);
router.get("/report/:id", auth, ctrl.downloadReport);

module.exports = router;