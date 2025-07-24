// Jobs model
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

// Define the schema for a job
const jobsSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    jobtitle: {
      type: String,
      required: true,
      trim: true,
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
      trim: true,
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Shift",
    },
    match: {
      type: String,
      required: true,
      trim: true,
    },
    salaryrange: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Auto-increment jobOrder field
jobsSchema.plugin(AutoIncrement, {
  inc_field: "jobOrder",
  id: "jobOrderNums",
  start_seq: 500,
});

module.exports = mongoose.model("Jobs", jobsSchema);
