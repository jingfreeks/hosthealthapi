const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bankController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /bank routes
router.use(verifyJWT);

// @route GET /bank - Get all banks
// @route POST /bank - Create new bank
// @route PATCH /bank - Update a bank
// @route DELETE /bank - Delete a bank
router
  .route("/")
  .get(bankController.getAllBanks)
  .post(bankController.createNewBanks)
  .patch(bankController.updateBank)
  .delete(bankController.deleteBank);

module.exports = router;
