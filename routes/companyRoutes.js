const express = require("express");
const router = express.Router();
const companyController = require("../controllers/compController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /company routes
router.use(verifyJWT);

// @route GET /company - Get all companies
// @route POST /company - Create new company
// @route PATCH /company - Update a company
// @route DELETE /company - Delete a company
router
  .route("/")
  .get(companyController.getAllCompanies)
  .post(companyController.createNewCompany)
  .patch(companyController.updateCompany)
  .delete(companyController.deleteCompany);

module.exports = router;
