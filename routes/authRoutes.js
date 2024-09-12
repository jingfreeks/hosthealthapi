const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const loginLimitter = require("../middleware/loginLimiter");

router.route("/").post(loginLimitter, authController.login);

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);
router.route("/flogin").post(authController.fLogin);

module.exports = router;
