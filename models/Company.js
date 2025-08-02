// Company model
const mongoose = require("mongoose");

// Define the schema for a company
const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Cities",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Company", companySchema);
