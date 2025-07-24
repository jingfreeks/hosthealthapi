// User model
const mongoose = require("mongoose");

// Define the schema for a user
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    // required: true, // Uncomment if username should be required
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  roles: {
    type: [String],
    default: ["Applicant"],
  },
  firstname: {
    type: String,
    trim: true,
  },
  lastname: {
    type: String,
    trim: true,
  },
  middlename: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("User", userSchema);
