/**
 * Controller for Onboarding operations
 * @module controllers/onboardingController
 */
const Onboarding = require("../models/Onboarding");
const User = require("../models/Users");
const Profile = require("../models/Profile");

/**
 * Get all onboarding records
 * @route GET /onboarding
 * @access Private
 */
const getAllOnboarding = async (req, res) => {
  try {
    const { status, step, limit = 10, page = 1 } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by step if provided
    if (step) {
      query.step = parseInt(step);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const onboardingRecords = await Onboarding.find(query)
      .populate('userId', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()
      .exec();
      
    const total = await Onboarding.countDocuments(query);
    
    if (!onboardingRecords?.length) {
      return res.status(400).json({ message: "No onboarding records found" });
    }
    
    return res.status(200).json({
      records: onboardingRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        recordsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('getAllOnboarding error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get onboarding record by ID
 * @route GET /onboarding/:id
 * @access Private
 */
const getOnboardingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Onboarding ID required" });
    }
    
    const onboarding = await Onboarding.findById(id)
      .populate('userId', 'username email')
      .populate('assignedTo', 'username email')
      .lean()
      .exec();
      
    if (!onboarding) {
      return res.status(400).json({ message: "Onboarding record not found" });
    }
    
    return res.status(200).json(onboarding);
  } catch (error) {
    console.error('getOnboardingById error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get onboarding record by user ID
 * @route GET /onboarding/user/:userId
 * @access Private
 */
const getOnboardingByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }
    
    const onboarding = await Onboarding.findOne({ userId })
      .populate('userId', 'username email')
      .populate('assignedTo', 'username email')
      .lean()
      .exec();
      
    if (!onboarding) {
      return res.status(400).json({ message: "No onboarding record found for this user" });
    }
    
    return res.status(200).json(onboarding);
  } catch (error) {
    console.error('getOnboardingByUserId error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create new onboarding record
 * @route POST /onboarding
 * @access Private
 */
const createOnboarding = async (req, res) => {
  try {
    const {
      userId,
      personalInfo,
      employmentInfo,
      documents,
      bankInfo,
      preferences,
      notes
    } = req.body;
    
    if (!userId || !personalInfo) {
      return res.status(400).json({ message: "User ID and personal information are required" });
    }
    
    // Check if user exists
    const user = await User.findById(userId).lean().exec();
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    // Check if onboarding record already exists for this user
    const existingOnboarding = await Onboarding.findOne({ userId }).lean().exec();
    if (existingOnboarding) {
      return res.status(409).json({ message: "Onboarding record already exists for this user" });
    }
    
    const onboardingData = {
      userId,
      personalInfo,
      employmentInfo: employmentInfo || {},
      documents: documents || {},
      bankInfo: bankInfo || {},
      preferences: preferences || {},
      notes: notes || "",
      status: "pending",
      step: 1,
      completedSteps: []
    };
    
    const onboarding = await Onboarding.create(onboardingData);
    
    return res.status(201).json({ 
      message: "Onboarding record created successfully",
      onboarding: onboarding
    });
  } catch (error) {
    console.error('createOnboarding error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update onboarding record
 * @route PATCH /onboarding/:id
 * @access Private
 */
const updateOnboarding = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "Onboarding ID required" });
    }
    
    const onboarding = await Onboarding.findById(id).exec();
    if (!onboarding) {
      return res.status(400).json({ message: "Onboarding record not found" });
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'userId' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        onboarding[key] = updateData[key];
      }
    });
    
    const updatedOnboarding = await onboarding.save();
    
    return res.status(200).json({ 
      message: "Onboarding record updated successfully",
      onboarding: updatedOnboarding
    });
  } catch (error) {
    console.error('updateOnboarding error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update onboarding step
 * @route PATCH /onboarding/:id/step
 * @access Private
 */
const updateOnboardingStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { step, stepName } = req.body;
    
    if (!id || !step || !stepName) {
      return res.status(400).json({ message: "Onboarding ID, step number, and step name are required" });
    }
    
    const onboarding = await Onboarding.findById(id).exec();
    if (!onboarding) {
      return res.status(400).json({ message: "Onboarding record not found" });
    }
    
    // Update step
    onboarding.step = step;
    
    // Add to completed steps if not already there
    const stepExists = onboarding.completedSteps.find(s => s.stepNumber === step);
    if (!stepExists) {
      onboarding.completedSteps.push({
        stepNumber: step,
        stepName: stepName,
        completedAt: new Date()
      });
    }
    
    // Update status based on step
    if (step >= 10) {
      onboarding.status = "completed";
    } else if (step > 1) {
      onboarding.status = "in_progress";
    }
    
    const updatedOnboarding = await onboarding.save();
    
    return res.status(200).json({ 
      message: "Onboarding step updated successfully",
      onboarding: updatedOnboarding
    });
  } catch (error) {
    console.error('updateOnboardingStep error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update onboarding status
 * @route PATCH /onboarding/:id/status
 * @access Private
 */
const updateOnboardingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, assignedTo } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ message: "Onboarding ID and status are required" });
    }
    
    const validStatuses = ["pending", "in_progress", "completed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be one of: pending, in_progress, completed, rejected" });
    }
    
    const onboarding = await Onboarding.findById(id).exec();
    if (!onboarding) {
      return res.status(400).json({ message: "Onboarding record not found" });
    }
    
    onboarding.status = status;
    if (adminNotes) onboarding.adminNotes = adminNotes;
    if (assignedTo) onboarding.assignedTo = assignedTo;
    
    // SYNC TO PROFILE IF COMPLETED
    if (status === "completed" && onboarding.personalInfo) {
      let profile = await Profile.findOne({ user: onboarding.userId });
      if (!profile) {
        profile = new Profile({ user: onboarding.userId });
      }
      profile.firstname = onboarding.personalInfo.firstName || "";
      profile.lastname = onboarding.personalInfo.lastName || "";
      profile.middlename = onboarding.personalInfo.middleName || "";
      profile.picture = onboarding.personalInfo.profilePicture || "";
      // Optionally sync address as a string
      if (onboarding.personalInfo.address) {
        const addr = onboarding.personalInfo.address;
        profile.address = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(", ");
      }
      await profile.save();
    }
    
    const updatedOnboarding = await onboarding.save();
    
    return res.status(200).json({ 
      message: "Onboarding status updated successfully",
      onboarding: updatedOnboarding
    });
  } catch (error) {
    console.error('updateOnboardingStatus error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete onboarding record
 * @route DELETE /onboarding/:id
 * @access Private
 */
const deleteOnboarding = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Onboarding ID required" });
    }
    
    const onboarding = await Onboarding.findById(id).exec();
    if (!onboarding) {
      return res.status(400).json({ message: "Onboarding record not found" });
    }
    
    await Onboarding.findByIdAndDelete(id);
    
    return res.status(200).json({ message: `Onboarding record for user ${onboarding.userId} deleted successfully` });
  } catch (error) {
    console.error('deleteOnboarding error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get onboarding statistics
 * @route GET /onboarding/stats
 * @access Private
 */
const getOnboardingStats = async (req, res) => {
  try {
    const stats = await Onboarding.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const stepStats = await Onboarding.aggregate([
      {
        $group: {
          _id: "$step",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const totalRecords = await Onboarding.countDocuments();
    const completedRecords = await Onboarding.countDocuments({ status: "completed" });
    const inProgressRecords = await Onboarding.countDocuments({ status: "in_progress" });
    const pendingRecords = await Onboarding.countDocuments({ status: "pending" });
    
    return res.status(200).json({
      totalRecords,
      statusBreakdown: {
        completed: completedRecords,
        inProgress: inProgressRecords,
        pending: pendingRecords
      },
      stepBreakdown: stepStats,
      completionRate: totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0
    });
  } catch (error) {
    console.error('getOnboardingStats error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Search onboarding records
 * @route GET /onboarding/search
 * @access Private
 */
const searchOnboarding = async (req, res) => {
  try {
    const { q, status, step, limit = 10, page = 1 } = req.query;
    
    let query = {};
    
    // Text search
    if (q) {
      query.$or = [
        { "personalInfo.firstName": { $regex: q, $options: "i" } },
        { "personalInfo.lastName": { $regex: q, $options: "i" } },
        { "personalInfo.email": { $regex: q, $options: "i" } },
        { "employmentInfo.jobTitle": { $regex: q, $options: "i" } },
        { "employmentInfo.currentEmployer": { $regex: q, $options: "i" } }
      ];
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by step
    if (step) {
      query.step = parseInt(step);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const results = await Onboarding.find(query)
      .populate('userId', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()
      .exec();
      
    const total = await Onboarding.countDocuments(query);
    
    return res.status(200).json({
      results,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        recordsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('searchOnboarding error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllOnboarding,
  getOnboardingById,
  getOnboardingByUserId,
  createOnboarding,
  updateOnboarding,
  updateOnboardingStep,
  updateOnboardingStatus,
  deleteOnboarding,
  getOnboardingStats,
  searchOnboarding,
  // Keep legacy functions for backward compatibility
  getProfile: async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      const onboarding = await Onboarding.findOne({ userId }).lean().exec();
      if (!onboarding) {
        return res.status(400).json({ message: "No onboarding record found" });
      }
      return res.status(200).json(onboarding.personalInfo);
    } catch (error) {
      console.error('getProfile error:', error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  },
  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, middleName, image } = req.body;
      const { userId } = req.params;
      if (!userId || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      let onboarding = await Onboarding.findOne({ userId }).exec();
      if (!onboarding) {
        // Create new onboarding record
        const onboardingData = {
          userId,
          personalInfo: {
            firstName,
            lastName,
            middleName: middleName || "",
            profilePicture: image || "",
            // Add required fields with defaults
            dateOfBirth: new Date(),
            gender: "prefer_not_to_say",
            phoneNumber: "",
            email: "",
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "USA"
            }
          },
          status: "pending",
          step: 1
        };
        onboarding = await Onboarding.create(onboardingData);
      } else {
        // Update existing record
        onboarding.personalInfo.firstName = firstName;
        onboarding.personalInfo.lastName = lastName;
        onboarding.personalInfo.middleName = middleName || "";
        onboarding.personalInfo.profilePicture = image || "";
        await onboarding.save();
      }
      
      return res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error('updateProfile error:', error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};
