const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstname:{
    type:String,
  },
  roles: {
    type: [String],
    default: ["Applicant"],
  },

  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Users", userSchema);
