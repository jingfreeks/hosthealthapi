const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");

router.route("/").post(userController.createFNewUser);

module.exports = router;
