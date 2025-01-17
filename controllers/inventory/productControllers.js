const Product = require("../../models/Products");

// @desc Get all products
// @route GET /inv/products
// @access Private
const getAllProducts = async (req, res) => {
  // Get all products from MongoDB
  const product = await Product.find().lean();

  // If no city
  if (!product?.length) {
    return res.status(400).json({ message: "No Inventory Product found" });
  }
  res.json(product);
};

// @desc Create new products
// @route POST /inv/products
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
      return res.status(409).json({ message: "Duplicate Inventory Product name" });
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
      return res.status(201).json({ message: "New Inventory Product created" });
    } else {
      return res.status(400).json({ message: "Invalid Product data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a products
// @route PATCH /inv/products
// @access Private
const updateProducts = async (req, res) => {
  const { id, title, decription, category, image, price } = req.body;

  // Confirm data
  if (!id || !title || !decription || !category || !image || !price) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const product = await Product.findById(id).exec();

  if (!product) {
    return res.status(400).json({ message: "Inventory Product not found" });
  }

  // Check for duplicate title
  const duplicate = await Product.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Inventory Product name" });
  }

  product.title = title;
  product.decription = decription;
  product.category = category;
  product.image = image;
  product.price = price;

  const updatedProduct = await bank.save();

  res.json(`'${updatedProduct.name}' Inventory Product  updated`);
};

// @desc Delete a products
// @route DELETE /inv/products
// @access Private
const deleteProducts = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Inventory Product ID required" });
  }

  //check if this exist to jobs before deleting

  // Confirm bank exists to delete
  const product = await Product.findById(id).exec();

  if (!product) {
    return res.status(400).json({ message: "Inventory Product not found" });
  }

  const result = await product.deleteOne();

  const reply = `Product '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};

// @desc View product details
// @route view  /inv/products/{prodId}
// @access Private

const viewProductDetails=async(req, res)=>{
    const { prodId } = req.params;

    const product = await Product.findById(prodId).exec();
  
    if (!product) {
      return res.status(400).json({ message: "Inventory Product is not found in our list" });
    }

    res.json(product);
}
module.exports = {
  getAllProducts,
  createNewProducts,
  updateProducts,
  deleteProducts,
  viewProductDetails
};
