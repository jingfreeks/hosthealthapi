const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "rejected"],
      default: "pending",
      required: true,
    },
    step: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    personalInfo: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      middleName: {
        type: String,
        trim: true,
      },
      dateOfBirth: {
        type: Date,
        required: true,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer_not_to_say"],
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      address: {
        street: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        zipCode: {
          type: String,
          required: true,
          trim: true,
        },
        country: {
          type: String,
          default: "USA",
          trim: true,
        },
      },
      profilePicture: {
        type: String,
        trim: true,
      },
    },
    employmentInfo: {
      currentEmployer: {
        type: String,
        trim: true,
      },
      jobTitle: {
        type: String,
        trim: true,
      },
      yearsOfExperience: {
        type: Number,
        min: 0,
      },
      expectedSalary: {
        type: Number,
        min: 0,
      },
      preferredWorkType: {
        type: String,
        enum: ["full_time", "part_time", "contract", "temporary", "internship"],
      },
      availability: {
        type: String,
        enum: ["immediate", "two_weeks", "one_month", "three_months", "flexible"],
      },
      skills: [{
        type: String,
        trim: true,
      }],
      certifications: [{
        name: {
          type: String,
          trim: true,
        },
        issuer: {
          type: String,
          trim: true,
        },
        dateObtained: {
          type: Date,
        },
        expiryDate: {
          type: Date,
        },
      }],
    },
    documents: {
      resume: {
        type: String,
        trim: true,
      },
      coverLetter: {
        type: String,
        trim: true,
      },
      identification: {
        type: String,
        trim: true,
      },
      backgroundCheck: {
        type: String,
        trim: true,
      },
      references: [{
        name: {
          type: String,
          trim: true,
        },
        title: {
          type: String,
          trim: true,
        },
        company: {
          type: String,
          trim: true,
        },
        email: {
          type: String,
          trim: true,
        },
        phone: {
          type: String,
          trim: true,
        },
        relationship: {
          type: String,
          trim: true,
        },
      }],
    },
    bankInfo: {
      accountHolderName: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      routingNumber: {
        type: String,
        trim: true,
      },
      bankName: {
        type: String,
        trim: true,
      },
      accountType: {
        type: String,
        enum: ["checking", "savings"],
      },
    },
    preferences: {
      preferredLocations: [{
        type: String,
        trim: true,
      }],
      commuteDistance: {
        type: Number,
        min: 0,
      },
      workSchedule: {
        type: String,
        enum: ["day_shift", "night_shift", "rotating", "flexible"],
      },
      benefits: [{
        type: String,
        enum: ["health_insurance", "dental_insurance", "vision_insurance", "retirement", "paid_time_off", "flexible_hours", "remote_work"],
      }],
    },
    notes: {
      type: String,
      trim: true,
    },
    completedSteps: [{
      stepNumber: {
        type: Number,
        required: true,
      },
      stepName: {
        type: String,
        required: true,
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    adminNotes: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for better query performance
onboardingSchema.index({ userId: 1 });
onboardingSchema.index({ status: 1 });
onboardingSchema.index({ step: 1 });
onboardingSchema.index({ "personalInfo.email": 1 });

module.exports = mongoose.model("Onboarding", onboardingSchema); 