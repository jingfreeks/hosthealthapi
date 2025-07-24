const express = require("express");
const router = express.Router();
const deptController = require("../controllers/deptController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /dept routes
router.use(verifyJWT);

// @route GET /dept - Get all departments
// @route POST /dept - Create new department
// @route PATCH /dept - Update a department
// @route DELETE /dept - Delete a department
router
  .route("/")
  .get(deptController.getAllDept)
  .post(deptController.createNewDept)
  .patch(deptController.updateDept)
  .delete(deptController.deleteDept);

module.exports = router;
