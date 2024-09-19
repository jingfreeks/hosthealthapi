const express = require("express");
const router = express.Router();
const productController = require("../controllers/productControllers");
router.route("/:prodId").get(productController.viewProductDetails)
router
  .route("/")
  .get(productController.getAllProducts)
  .post(productController.createNewProducts)
  .patch(productController.updateProducts)
  .delete(productController.deleteProducts);

module.exports = router;
