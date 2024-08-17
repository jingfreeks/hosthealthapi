const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    middlename: {
      type: String,
    },
    address: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profiles", profileSchema);
