const mongoose = require("mongoose");

const jobsSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  weeks: {
    type: String,
    required: true,
  },
  shift:{
    type: String,
    required: true,
  },
  match:{
    type: String,
    required: true,
  },
  salaryrange:{
    type: String,
    required: true,
  },
  address:{
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
