const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobsController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT)
router
  .route("/jobDetails/:jobId")
  .get(jobsController.viewAdminJobDetails)

module.exports = router;
