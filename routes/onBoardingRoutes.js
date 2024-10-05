const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const profileBankInfoController = require("../controllers/profilebankinfoController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
router
  .route("/profile/:userId")
  .get(profileController.getProfile)
  .patch(profileController.updateProfile);

router
  .route("/bankInfo/:userId")
  .get(profileBankInfoController.getBankInfo)
  .patch(profileBankInfoController.updateBankInfo);
module.exports = router;
