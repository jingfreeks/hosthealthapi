const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Shift", shiftSchema);
