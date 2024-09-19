const Product = require("../models/Products");

// @desc Get all banks
// @route GET /banks
// @access Private
const getAllProducts = async (req, res) => {
  // Get all notes from MongoDB
  const product = await Product.find().lean();

  // If no city
  if (!product?.length) {
    return res.status(400).json({ message: "No Product found" });
  }
  res.json(product);
};

// @desc Create new bank
// @route POST /bank
// @access Private
const createNewProducts = async (req, res) => {
  try {
    const { title, decription, category, image, price } = req.body;

    // Confirm data
    if (!title || !decription || !category || !image || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate title
    const duplicate = await Product.findOne({ title })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Product name" });
    }

    // Create and store the new city
    const product = await Product.create({
      title,
      decription,
      category,
      image,
      price,
    });
    if (product) {
      // Created
      return res.status(201).json({ message: "New Product created" });
    } else {
      return res.status(400).json({ message: "Invalid Product data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a bank
// @route PATCH /bank
// @access Private
const updateProducts = async (req, res) => {
  const { id, title, decription, category, image, price } = req.body;

  // Confirm data
  if (!id || !title || !decription || !category || !image || !price) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const product = await Product.findById(id).exec();

  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  // Check for duplicate title
  const duplicate = await Product.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Bank name" });
  }

  product.title = title;
  product.decription = decription;
  product.category = category;
  product.image = image;
  product.price = price;

  const updatedProduct = await bank.save();

  res.json(`'${updatedProduct.name}' Product  updated`);
};

// @desc Delete a bank
// @route DELETE /bank
// @access Private
const deleteProducts = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Product ID required" });
  }

  //check if this exist to jobs before deleting

  // Confirm bank exists to delete
  const product = await Product.findById(id).exec();

  if (!product) {
    return res.status(400).json({ message: "Bank not found" });
  }

  const result = await product.deleteOne();

  const reply = `Product '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllProducts,
  createNewProducts,
  updateProducts,
  deleteProducts,
};
