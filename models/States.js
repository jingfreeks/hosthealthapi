// State model
const mongoose = require("mongoose");

// Define the schema for a state
const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("State", stateSchema);
