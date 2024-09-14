const mongoose = require("mongoose");

const banksSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("Banks", banksSchema);
