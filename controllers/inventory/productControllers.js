/**
 * Controller for Product operations
 * @module controllers/productControllers
 */
const Product = require("../../models/Products");

/**
 * Get all products
 * @route GET /product
 * @access Private
 */
const getAllProducts = async (req, res) => {
  try {
    const product = await Product.find().lean().exec();
    if (!product?.length) {
      return res.status(400).json({ message: "No Product found" });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create new product
 * @route POST /product
 * @access Private
 */
const createNewProducts = async (req, res) => {
  try {
    const { title, description, category, image, price } = req.body;
    if (!title || !description || !category || !image || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await Product.findOne({ title })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Inventory Product name" });
    }
    const product = await Product.create({ title, description, category, image, price });
    if (product) {
      return res.status(201).json({ message: "New Product created" });
    } else {
      return res.status(400).json({ message: "Invalid Product data received" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a product
 * @route PATCH /product
 * @access Private
 */
const updateProducts = async (req, res) => {
  try {
    const { id, title, description, category, image, price } = req.body;
    if (!id || !title || !description || !category || !image || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const product = await Product.findById(id).exec();
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }
    const duplicate = await Product.findOne({ title })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate && duplicate?._id.toString() !== id) {
      return res.status(409).json({ message: "Duplicate Product name" });
    }
    product.title = title;
    product.description = description;
    product.category = category;
    product.image = image;
    product.price = price;
    const updatedProduct = await product.save();
    return res.json(`'${updatedProduct.title}' Product updated`);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a product
 * @route DELETE /product
 * @access Private
 */
const deleteProducts = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Product ID required" });
    }
    const product = await Product.findById(id).exec();
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }
    const result = await product.deleteOne();
    const reply = `Product '${result.title}' with ID ${result._id} deleted`;
    return res.json(reply);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * View product details
 * @route GET /product/:prodId
 * @access Private
 */
const viewProductDetails = async (req, res) => {
  try {
    const { prodId } = req.params;
    const product = await Product.findById(prodId).exec();
    if (!product) {
      return res.status(400).json({ message: "Inventory Product is not found in our list" });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllProducts,
  createNewProducts,
  updateProducts,
  deleteProducts,
  viewProductDetails,
};
