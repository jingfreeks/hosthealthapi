const express = require("express");
const router = express.Router();
const statesController = require("../controllers/stateController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /states routes
router.use(verifyJWT);

// @route GET /states - Get all states
// @route POST /states - Create new state
// @route PATCH /states - Update a state
// @route DELETE /states - Delete a state
router
  .route("/")
  .get(statesController.getAllStates)
  .post(statesController.createNewStates)
  .patch(statesController.updateState)
  .delete(statesController.deleteState);

module.exports = router;
