const express = require("express");
const router = express.Router();
const dynamic_path = express();
const jobsController = require("../controllers/jobsController");
const myJobsController = require("../controllers/myjobsController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
router
  .route("/")
  .get(jobsController.getAllJobs)
  .post(jobsController.createNewJobs)
  .patch(jobsController.updateJobs)
  .delete(jobsController.deleteJobs);

router.route("/:jobId").get(jobsController.viewJobDetails)
router.route("/myjobs/:userId").get(myJobsController.getMyJobs)

router
  .route("/myjobs")
  // .get(myJobsController.getMyJobs)
  .post(myJobsController.createInterestedJobs)
  .patch(myJobsController.updateMyStatus)
  .delete(myJobsController.deleteMyJobs);
module.exports = router;
