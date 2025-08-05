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
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    jobRequirements: {
      type: String,
      required: true,
      trim: true,
    },
    jobType: {
      type: String,
      required: true,
      enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Inactive', 'Closed', 'Draft'],
      default: 'Active',
      trim: true,
    },
    skillTags: {
      type: [String],
      required: true,
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: 'At least one skill tag is required'
      },
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
