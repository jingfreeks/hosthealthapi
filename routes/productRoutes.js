const express = require("express");
const router = express.Router();
const productController = require("../controllers/productControllers");

// @route GET /product/:prodId - View product details
router.route("/:prodId").get(productController.viewProductDetails);

// @route GET /product - Get all products
// @route POST /product - Create new product
// @route PATCH /product - Update a product
// @route DELETE /product - Delete a product
router
  .route("/")
  .get(productController.getAllProducts)
  .post(productController.createNewProducts)
  .patch(productController.updateProducts)
  .delete(productController.deleteProducts);

module.exports = router;
