const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const profileBankInfoController = require("../controllers/profilebankinfoController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /onboarding routes
router.use(verifyJWT);

// @route GET/PATCH /onboarding/profile/:userId - Get or update user profile
router
  .route("/profile/:userId")
  .get(profileController.getProfile)
  .patch(profileController.updateProfile);

// @route GET/PATCH /onboarding/bankInfo/:userId - Get or update user bank info
router
  .route("/bankInfo/:userId")
  .get(profileBankInfoController.getBankInfo)
  .patch(profileBankInfoController.updateBankInfo);

module.exports = router;
