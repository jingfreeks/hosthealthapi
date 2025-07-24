// Notes model
const mongoose = require("mongoose");

// Define the schema for notes
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      default: null,
    },
    long: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Notes", noteSchema);
