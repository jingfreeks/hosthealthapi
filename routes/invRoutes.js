const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/inventory/categoryController");
const productController = require("../controllers/inventory/productControllers");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT)
router
  .route("/category")
  .get(categoryController.getAllCategories)
  .post(categoryController.createNewCategory)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);



router
  .route("/product")
  .get(productController.getAllProducts)
  .post(productController.createNewProducts)
  .patch(productController.updateProducts)
  .delete(productController.deleteProducts);

router.route("/product/:prodId").get(productController.viewProductDetails)
module.exports = router;
