// Department model
const mongoose = require("mongoose");

// Define the schema for a department
const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("Department", departmentSchema);
