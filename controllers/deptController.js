const Dept = require("../models/Department");

// @desc Get all Department
// @route GET /dept
// @access Private
const getAllDept= async (req, res) => {
  // Get all notes from MongoDB
  const dept = await Dept.find().lean();

  // If no department
  if (!dept?.length) {
    return res.status(400).json({ message: "No department found" });
  }

  res.json(dept);
};

// @desc Create new Department
// @route POST /dept
// @access Private
const createNewDept = async (req, res) => {
  try {
    const { name } = req.body;

    // Confirm data
    if (!name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate department name
    const duplicate = await Dept.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate city name" });
    }

    // Create and store the new user
    const state = await Dept.create({ name });
    if (state) {
      // Created
      return res.status(201).json({ message: "New Department created" });
    } else {
      return res.status(400).json({ message: "Invalid Department data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a Department
// @route PATCH /dept
// @access Private
const updateDept = async (req, res) => {
  const { id, name } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const dept = await Dept.findById(id).exec();

  if (!dept) {
    return res.status(400).json({ message: "Department not found" });
  }

  // Check for duplicate title
  const duplicate = await Dept.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Department name" });
  }

  dept.name = name;

  const updatedState = await dept.save();

  res.json(`'${updatedState.name}' city  updated`);
};

// @desc Delete a Department
// @route DELETE /dept
// @access Private
const deleteDept = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Department ID required" });
  }

  //check if this exist to jobs before deleting
  
  // Confirm city exists to delete
  const dept = await Dept.findById(id).exec();

  if (!dept) {
    return res.status(400).json({ message: "Department not found" });
  }

  const result = await dept.deleteOne();

  const reply = `Department '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
    getAllDept,
    createNewDept,
    updateDept,
    deleteDept,
};
