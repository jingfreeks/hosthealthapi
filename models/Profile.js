// Profile model
const mongoose = require("mongoose");

// Define the schema for a user profile
const profileSchema = new mongoose.Schema(
  {
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
    picture: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Profile", profileSchema);
