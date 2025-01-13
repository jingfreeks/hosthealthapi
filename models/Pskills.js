const mongoose = require("mongoose");

const pSkillSchema = new mongoose.Schema({
  skill:{
    type:String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});

module.exports = mongoose.model("ProfileBankInfos", pSkillSchema);
