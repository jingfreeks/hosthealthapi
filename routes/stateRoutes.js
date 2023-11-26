const express = require("express");
const router = express.Router();
const statesController = require("../controllers/stateController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT)
router
  .route("/")
  .get(statesController.getAllStates)
  .post(statesController.createNewStates)
  .patch(statesController.updateState)
  .delete(statesController.deleteState);

module.exports = router;
