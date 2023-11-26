const Shift = require("../models/Shift");

// @desc Get all shift
// @route GET /shift
// @access Private
const getAllShift = async (req, res) => {
  // Get all notes from MongoDB
  const shift = await Shift.find().lean();

  // If no city
  if (!shift?.length) {
    return res.status(400).json({ message: "No shift found" });
  }

  res.json(shift);
};

// @desc Create new shift
// @route POST /shift
// @access Private
const createNewShift = async (req, res) => {
  try {
    const { title } = req.body;

    // Confirm data
    if (!title) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate title
    const duplicate = await Shift.findOne({ title })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate shift title" });
    }

    // Create and store the new city
    const city = await Shift.create({ title });
    if (city) {
      // Created
      return res.status(201).json({ message: "New shift created" });
    } else {
      return res.status(400).json({ message: "Invalid shift data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a shift
// @route PATCH /shift
// @access Private
const updateShift = async (req, res) => {
  const { id, title } = req.body;

  // Confirm data
  if (!id || !title) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm city exists to update
  const shift = await Shift.findById(id).exec();
  if (!shift) {
    return res.status(400).json({ message: "Shift not found" });
  }

  // Check for duplicate title
  const duplicate = await Shift.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate City name" });
  }

  shift.title = title;

  const updatedShift = await shift.save();

  res.json(`'${updatedShift.title}' shift  updated`);
};

// @desc Delete a shift
// @route DELETE /shift
// @access Private
const deleteCity = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Shift ID required" });
  }

  //check if this exist to jobs before deleting

  // Confirm city exists to delete
  const shift = await Shift.findById(id).exec();

  if (!shift) {
    return res.status(400).json({ message: "Shift not found" });
  }

  const result = await shift.deleteOne();
 
  const reply = `Shift '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = { getAllShift, createNewShift, updateShift, deleteCity };
