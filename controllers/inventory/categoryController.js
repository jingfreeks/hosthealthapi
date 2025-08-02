const Category = require("../../models/inv/Category");

// @desc Get all Categories
// @route GET /inv/category
// @access Private
const getAllCategories = async (req, res) => {
  // Get all notes from MongoDB
  const categories = await Category.find().lean();

  // If no city
  if (!categories?.length) {
    return res.status(400).json({ message: "No Categories found" });
  }
  res.json(categories);
};

// @desc Create new Category
// @route POST /inv/category
// @access Private
const createNewCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Confirm data
    if (!name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate title
    const duplicate = await Category.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate category name" });
    }

    // Create and store the new city
    const category = await Category.create({ name });
    if (category) {
      // Created
      return res.status(201).json({ message: "New Inventory Category created" });
    } else {
      return res.status(400).json({ message: "Invalid Inventory Category data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a category
// @route PATCH /inv/category
// @access Private
const updateCategory = async (req, res) => {
  const { id, name} = req.body;

  // Confirm data
  if (!id || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const category = await Category.findById(id).exec();

  if (!category) {
    return res.status(400).json({ message: "Bank not found" });
  }

  // Check for duplicate name
  const duplicate = await Category.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Inventory Category name" });
  }

  category.name = name;

  const updatedCategory= await Category.save();

  res.json(`'${updatedCategory.name}' bank  updated`);
};

// @desc Delete a category
// @route DELETE /inv/category
// @access Private
const deleteCategory = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Bank ID required" });
  }

  //check if this exist to jobs before deleting
  
  // Confirm bank exists to delete
  const category = await Category.findById(id).exec();

  if (!category) {
    return res.status(400).json({ message: "Category not found" });
  }

  const result = await Category.deleteOne();

  const reply = `Category '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
    getAllCategories,
    createNewCategory,
    updateCategory,
    deleteCategory,
};
