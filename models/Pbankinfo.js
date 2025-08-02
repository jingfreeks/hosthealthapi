// ProfileBankInfo model
const mongoose = require("mongoose");

// Define the schema for a user's bank info
const profileBankInfoSchema = new mongoose.Schema({
  accountNo: {
    type: Number,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
    trim: true,
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Banks",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("ProfileBankInfo", profileBankInfoSchema);
