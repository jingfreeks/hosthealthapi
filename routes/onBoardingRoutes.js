const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboardingController");
const profileBankInfoController = require("../controllers/profilebankinfoController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /onboarding routes
router.use(verifyJWT);

// Main onboarding CRUD routes
// @route GET /onboarding - Get all onboarding records with pagination and filtering
router.get("/", onboardingController.getAllOnboarding);

// @route GET /onboarding/stats - Get onboarding statistics
router.get("/stats", onboardingController.getOnboardingStats);

// @route GET /onboarding/search - Search onboarding records
router.get("/search", onboardingController.searchOnboarding);

// @route POST /onboarding - Create new onboarding record 
router.post("/", onboardingController.createOnboarding);

// @route GET /onboarding/:id - Get onboarding record by ID
router.get("/:id", onboardingController.getOnboardingById);

// @route PATCH /onboarding/:id - Update onboarding record
router.patch("/:id", onboardingController.updateOnboarding);

// @route DELETE /onboarding/:id - Delete onboarding record
router.delete("/:id", onboardingController.deleteOnboarding);

// @route PATCH /onboarding/:id/step - Update onboarding step
router.patch("/:id/step", onboardingController.updateOnboardingStep);

// @route PATCH /onboarding/:id/status - Update onboarding status
router.patch("/:id/status", onboardingController.updateOnboardingStatus);

// @route GET /onboarding/user/:userId - Get onboarding record by user ID
router.get("/user/:userId", onboardingController.getOnboardingByUserId);

// Legacy routes for backward compatibility
// @route GET/PATCH /onboarding/profile/:userId - Get or update user profile
router
  .route("/profile/:userId")
  .get(onboardingController.getProfile)
  .patch(onboardingController.updateProfile);

// @route GET/PATCH /onboarding/bankInfo/:userId - Get or update user bank info
router
  .route("/bankInfo/:userId")
  .get(profileBankInfoController.getBankInfo)
  .patch(profileBankInfoController.updateBankInfo);

module.exports = router; 