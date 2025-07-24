const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /users routes
router.use(verifyJWT);

// @route GET /users - Get all users
// @route POST /users - Create new user
// @route PATCH /users - Update a user
// @route DELETE /users - Delete a user
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createNewUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
