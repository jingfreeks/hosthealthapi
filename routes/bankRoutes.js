const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bankController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT)
router
  .route("/")
  .get(bankController.getAllBanks)
  .post(bankController.createNewBanks)
  .patch(bankController.updateBank)
  .delete(bankController.deleteBank);

module.exports = router;
