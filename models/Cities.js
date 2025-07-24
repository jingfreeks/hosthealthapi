// City model
const mongoose = require("mongoose");

// Define the schema for a city
const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "States",
  },
  image: {
    type: String,
    required: true,
    trim: true,
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("City", citySchema);
