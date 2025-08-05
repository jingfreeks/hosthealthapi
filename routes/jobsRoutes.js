const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobsController");
const myJobsController = require("../controllers/myjobsController");
const jobsBookmarkController = require("../controllers/bookmarksController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /jobs routes
router.use(verifyJWT);

// @route GET /jobs - Get all jobs
// @route POST /jobs - Create new job
// @route PATCH /jobs - Update a job
// @route DELETE /jobs - Delete a job
router
  .route("/")
  .get(jobsController.getAllJobs)
  .post(jobsController.createNewJobs)
  .patch(jobsController.updateJobs)
  .delete(jobsController.deleteJobs);
router
  .route("/:userId")
  .get(jobsController.getAllClientJobs)
  .post(jobsController.createNewJobs)
  .patch(jobsController.updateJobs)
  .delete(jobsController.deleteJobs);

// @route GET /jobs/status/:status - Get jobs by status
router.route("/status/:status").get(jobsController.getJobsByStatus);

// @route GET /jobs/type/:jobType - Get jobs by type
router.route("/type/:jobType").get(jobsController.getJobsByType);

// @route GET /jobs/match/:minMatchPercentage - Get jobs by skill match
router.route("/match/:minMatchPercentage").get(jobsController.getJobsBySkillMatch);

// @route GET /jobs/:jobId - View job details
router.route("/:jobId").get(jobsController.viewJobDetails);

// @route GET /jobs/myjobs/:userId - Get jobs for a user
router.route("/myjobs/:userId").get(myJobsController.getMyJobs);

// @route POST /jobs/myjobs - Create interested job
// @route PATCH /jobs/myjobs - Update job status
// @route DELETE /jobs/myjobs - Delete job
router
  .route("/myjobs")
  .post(myJobsController.createInterestedJobs)
  .patch(myJobsController.updateMyStatus)
  .delete(myJobsController.deleteMyJobs);

module.exports = router;
