const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT)
router
  .route("/:userId")
  .get(profileController.getProfile)
  .patch(profileController.updateProfile)

module.exports = router;
