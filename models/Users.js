const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    // required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    default: ["Applicant"],
  },
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
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Users", userSchema);
