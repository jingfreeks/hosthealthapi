/**
 * Controller for State operations
 * @module controllers/stateController
 */
const State = require("../models/States");
const City = require("../models/Cities");

/**
 * Get all states
 * @route GET /states
 * @access Private
 */
const getAllStates = async (req, res) => {
  try {
    const states = await State.find().lean().exec();
    if (!states?.length) {
      return res.status(400).json({ message: "No states found" });
    }
    return res.json(states);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create new state
 * @route POST /states
 * @access Private
 */
const createNewStates = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await State.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate state name" });
    }
    const state = await State.create({ name });
    if (state) {
      return res.status(201).json({ message: "New state created" });
    } else {
      return res.status(400).json({ message: "Invalid state data received" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a state
 * @route PATCH /states
 * @access Private
 */
const updateState = async (req, res) => {
  try {
    const { _id, name } = req.body;
    if (!_id || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const state = await State.findById(_id).exec();
    if (!state) {
      return res.status(400).json({ message: "State not found" });
    }
    const duplicate = await State.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate && duplicate?._id.toString() !== _id) {
      return res.status(409).json({ message: "Duplicate state name" });
    }
    state.name = name;
    const updatedState = await state.save();
    return res.json(`'${updatedState.name}' updated`);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a state
 * @route DELETE /states
 * @access Private
 */
const deleteState = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "State ID required" });
    }
    const state = await State.findById(_id).exec();
    if (!state) {
      return res.status(400).json({ message: "State not found" });
    }
    const city = await City.findOne({ state: _id })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (city) {
      return res.status(400).json({ message: "Cannot delete state because its already existed on the other transaction" });
    }
    const result = await state.deleteOne();
    const reply = `City '${result.name}' with ID ${result._id} deleted`;
    return res.json(reply);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllStates,
  createNewStates,
  updateState,
  deleteState,
};
