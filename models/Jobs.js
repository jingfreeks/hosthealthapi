const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose)

const jobsSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  jobtitle: {
    type: String,
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Company",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Department",
  },
  weeks: {
    type: String,
    required: true,
  },
  shift:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Shift",
  },
  match:{
    type: String,
    required: true,
  },
  salaryrange:{
    type: String,
    required: true,
  },
});
jobsSchema.plugin(AutoIncrement, {
  inc_field: 'jobOrder',
  id: 'jobOrderNums',
  start_seq: 500
})
// joborderno
module.exports = mongoose.model("Jobs", jobsSchema);
