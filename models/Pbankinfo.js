const mongoose = require("mongoose");

const pbankInfoSchema = new mongoose.Schema({
  accountNo: {
    type: Number,
    required: true,
  },
  accountName:{
    type:String,
    required: true,
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
});

module.exports = mongoose.model("ProfileBankInfos", pbankInfoSchema);
