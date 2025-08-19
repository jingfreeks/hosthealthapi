/**
 * Controller for Shift operations
 * @module controllers/shiftController
 */
const Shift = require("../models/Shift");

/**
 * Get all shifts
 * @route GET /shift
 * @access Private
 */
const getAllShift = async (req, res) => {
  try {
    const shift = await Shift.find().lean().exec();
    if (!shift?.length) {
      return res.status(400).json({ message: "No shift found" });
    }
    return res.json(shift);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create new shift
 * @route POST /shift
 * @access Private
 */
const createNewShift = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await Shift.findOne({ title })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate shift title" });
    }
    const shift = await Shift.create({ title });
    if (shift) {
      return res.status(201).json({ message: "New shift created" });
    } else {
      return res.status(400).json({ message: "Invalid shift data received" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a shift
 * @route PATCH /shift
 * @access Private
 */
const updateShift = async (req, res) => {
  try {
    const { _id, title } = req.body;
    console.log("Update shift request body:", req.body);
    if (!_id || !title) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const shift = await Shift.findById(_id).exec();
    if (!shift) {
      return res.status(400).json({ message: "Shift not found" });
    }
    const duplicate = await Shift.findOne({ title })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate && duplicate?._id.toString() !== _id) {
      return res.status(409).json({ message: "Duplicate shift title" });
    }
    shift.title = title;
    const updatedShift = await shift.save();
    return res.json(`'${updatedShift.title}' shift updated`);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a shift
 * @route DELETE /shift
 * @access Private
 */
const deleteShift = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "Shift ID required" });
    }
    const shift = await Shift.findById(_id).exec();
    if (!shift) {
      return res.status(400).json({ message: "Shift not found" });
    }
    const result = await shift.deleteOne();
    const reply = `Shift '${result.title}' with ID ${result._id} deleted`;
    return res.json(reply);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllShift,
  createNewShift,
  updateShift,
  deleteShift,
};
