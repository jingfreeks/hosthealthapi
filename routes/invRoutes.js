const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/inventory/categoryController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT)
router
  .route("/category")
  .get(categoryController.getAllCategories)
  .post(categoryController.createNewCategory)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
