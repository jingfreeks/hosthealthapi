const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shiftController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT)
router
  .route("/")
  .get(shiftController.getAllShift)
  .post(shiftController.createNewShift)
  .patch(shiftController.updateShift)
  .delete(shiftController.deleteCity);

module.exports = router;
