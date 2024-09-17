const State = require("../models/States");
const City = require("../models/Cities");

// @desc Get all states
// @route GET /states
// @access Private
const getAllStates = async (req, res) => {
  // Get all notes from MongoDB
  const states = await State.find().lean();

  // If no notes
  if (!states?.length) {
    return res.status(400).json({ message: "No states found" });
  }

  res.json(states);
};

// @desc Create new state
// @route POST /states
// @access Private
const createNewStates = async (req, res) => {
  try {
    const { name } = req.body;

    // Confirm data
    if (!name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate title
    const duplicate = await State.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate state name" });
    }

    // Create and store the new user
    const state = await State.create({ name });
    if (state) {
      // Created
      return res.status(201).json({ message: "New state created" });
    } else {
      return res.status(400).json({ message: "Invalid state data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a state
// @route PATCH /states
// @access Private
const updateState = async (req, res) => {
  const { id, name } = req.body;

  // Confirm data
  if (!id || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm note exists to update
  const state = await State.findById(id).exec();

  if (!state) {
    return res.status(400).json({ message: "State not found" });
  }

  // Check for duplicate title
  const duplicate = await State.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate state name" });
  }

  state.name = name;

  const updatedState = await state.save();

  res.json(`'${updatedState.name}' updated`);
};

// @desc Delete a state
// @route DELETE /states
// @access Private
const deleteState = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "State ID required" });
  }

  // Confirm state exists to delete
  const state = await State.findById(id).exec();

  if (!state) {
    return res.status(400).json({ message: "State not found" });
  }
  // checking city if the state id is already used

  const city = await City.findOne({ state: id })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  console.log('city',city)
  if(city){
    return res.status(400).json({ message: "Cannot delete state because its already existed on the other transaction" });
  }
  const result = await state.deleteOne();

  const reply = `City '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllStates,
  createNewStates,
  updateState,
  deleteState,
};
