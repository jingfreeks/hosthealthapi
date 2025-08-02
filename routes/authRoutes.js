const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const loginLimiter = require("../middleware/loginLimiter");

// @route POST /auth - User login
router.route("/").post(loginLimiter, authController.login);

// @route GET /auth/refresh - Refresh access token
router.route("/refresh").get(authController.refresh);

// @route POST /auth/logout - User logout
router.route("/logout").post(authController.logout);

// @route POST /auth/flogin - Firebase login
router.route("/flogin").post(authController.fLogin);

module.exports = router;
