const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobsController");
const myJobsController = require("../controllers/myjobsController");
const jobsBookmarkController = require("../controllers/bookmarksController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
router.route("/jobbookmark").post(jobsBookmarkController.addRemoveBookMarks);
router
  .route("/")
  .get(jobsController.getAllJobs)
  .post(jobsController.createNewJobs)
  .patch(jobsController.updateJobs)
  .delete(jobsController.deleteJobs);
router
  .route("/:userId")
  .get(jobsController.getAllJobs)
  .post(jobsController.createNewJobs)
  .patch(jobsController.updateJobs)
  .delete(jobsController.deleteJobs);

router
  .route("/details/:jobId/:userId")
  .get(jobsController.viewJobDetails)
  .post(myJobsController.createInterestedJobs);

router
  .route("/myjobs")
  .post(myJobsController.createInterestedJobs)
  .patch(myJobsController.updateMyStatus)
  .delete(myJobsController.deleteMyJobs);

router.route("/myjobs/:userId").get(myJobsController.getMyJobs);

module.exports = router;
