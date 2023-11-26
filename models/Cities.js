const mongoose = require("mongoose");

const citiesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "States",
  },
  image:{
    type:String,
    required: true,
  }
});

module.exports = mongoose.model("Cities", citiesSchema);
