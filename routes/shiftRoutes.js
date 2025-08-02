const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shiftController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /shift routes
router.use(verifyJWT);

// @route GET /shift - Get all shifts
// @route POST /shift - Create new shift
// @route PATCH /shift - Update a shift
// @route DELETE /shift - Delete a shift
router
  .route("/")
  .get(shiftController.getAllShift)
  .post(shiftController.createNewShift)
  .patch(shiftController.updateShift)
  .delete(shiftController.deleteShift);

module.exports = router;
