// Shift model
const mongoose = require("mongoose");

// Define the schema for a shift
const shiftSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("Shift", shiftSchema);
