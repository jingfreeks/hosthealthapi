const express = require("express");
const router = express.Router();
const deptController = require("../controllers/deptController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT)
router
  .route("/")
  .get(deptController.getAllDept)
  .post(deptController.createNewDept)
  .patch(deptController.updateDept)
  .delete(deptController.deleteDept);

module.exports = router;
