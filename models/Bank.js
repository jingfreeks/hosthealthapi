const mongoose = require("mongoose");

const banksSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address:{
    type:String,
  }
});

module.exports = mongoose.model("Banks", banksSchema);
