const express = require("express");
const router = express.Router();
const companyController = require("../controllers/compController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT)
router
  .route("/")
  .get(companyController.getAllCompanies)
  .post(companyController.createNewCompany)
  .patch(companyController.updateCompany)
  .delete(companyController.deleteCompany);

module.exports = router;
