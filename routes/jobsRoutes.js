const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobsController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT)
router
  .route("/")
  .get(jobsController.getAllJobs)
  .post(jobsController.createNewJobs)
  .patch(jobsController.updateCity)
  .delete(jobsController.deleteJobs);

module.exports = router;
