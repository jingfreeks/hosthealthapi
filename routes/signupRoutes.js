const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");

// @route POST /signup - Create new user
router.route("/").post(userController.createNewUser);

module.exports = router;
