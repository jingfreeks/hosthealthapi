const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");

// @route POST /fsignup - Create new user via Firebase
router.route("/").post(userController.createFNewUser);

module.exports = router;
