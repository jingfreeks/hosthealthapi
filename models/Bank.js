// Bank model
const mongoose = require("mongoose");

// Define the schema for a bank
const bankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("Bank", bankSchema);
