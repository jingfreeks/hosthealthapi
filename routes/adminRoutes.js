const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobsController");
const skillController = require("../controllers/skillController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
router
  .route("/skill")
  .get(skillController.getAllSkill)
  .post(skillController.createNewSkill)
  .patch(skillController.updateSkill)
  .delete(skillController.deleteSkill);
router.route("/jobDetails/:jobId").get(jobsController.viewAdminJobDetails);

module.exports = router;
