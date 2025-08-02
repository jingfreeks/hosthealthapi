/**
 * Controller for Department operations
 * @module controllers/deptController
 */
const Dept = require("../models/Department");

/**
 * Get all departments
 * @route GET /dept
 * @access Private
 */
const getAllDept = async (req, res) => {
  try {
    const dept = await Dept.find().lean().exec();
    if (!dept?.length) {
      return res.status(400).json({ message: "No department found" });
    }
    return res.json(dept);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a new department
 * @route POST /dept
 * @access Private
 */
const createNewDept = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await Dept.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate department name" });
    }
    const department = await Dept.create({ name });
    if (department) {
      return res.status(201).json({ message: "New Department created" });
    } else {
      return res.status(400).json({ message: "Invalid Department data received" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a department
 * @route PATCH /dept
 * @access Private
 */
const updateDept = async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const dept = await Dept.findById(id).exec();
    if (!dept) {
      return res.status(400).json({ message: "Department not found" });
    }
    const duplicate = await Dept.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate && duplicate?._id.toString() !== id) {
      return res.status(409).json({ message: "Duplicate Department name" });
    }
    dept.name = name;
    const updatedDept = await dept.save();
    return res.json(`'${updatedDept.name}' department updated`);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a department
 * @route DELETE /dept
 * @access Private
 */
const deleteDept = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Department ID required" });
    }
    const dept = await Dept.findById(id).exec();
    if (!dept) {
      return res.status(400).json({ message: "Department not found" });
    }
    const result = await dept.deleteOne();
    const reply = `Department '${result.name}' with ID ${result._id} deleted`;
    return res.json(reply);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllDept,
  createNewDept,
  updateDept,
  deleteDept,
};
