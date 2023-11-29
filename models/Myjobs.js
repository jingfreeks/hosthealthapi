const mongoose = require("mongoose");

const myJobsSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Jobs",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  }, 
  status: {
    type: String,
    required: true,
  },    
});

module.exports = mongoose.model("Myjobs", myJobsSchema);
