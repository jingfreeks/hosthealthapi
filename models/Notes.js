//
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

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
      type: String,
      default: false,
    },
    long: {
      type: String,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);
