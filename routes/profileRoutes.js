const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /profile routes
router.use(verifyJWT);

// @route GET/PATCH /profile/:userId - Get or update user profile
router
  .route("/:userId")
  .get(profileController.getProfile)
  .patch(profileController.updateProfile);

module.exports = router;
