/**
 * Controller for Onboarding operations
 * @module controllers/onboardingController
 */
const Profile = require("../models/Profile");

/**
 * Get profile info for a user
 * @route GET /onboarding/profile/:userId
 * @access Private
 */
const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }
    const usrProfile = await Profile.findOne({ user: userId }).lean().exec();
    if (!usrProfile) {
      return res.status(400).json({ message: "No user found" });
    }
    const profileInfo = {
      firstName: usrProfile.firstname,
      lastName: usrProfile.lastname,
      middlename: usrProfile.middlename,
      picture: usrProfile.picture,
    };
    return res.json(profileInfo);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create or update a user profile
 * @route PATCH /onboarding/profile/:userId
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, middleName, image } = req.body;
    const { userId } = req.params;
    if (!userId || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let user = await Profile.findOne({ user: userId }).lean().exec();
    if (!user) {
      const userObject = {
        firstname: firstName,
        lastname: lastName,
        middlename: middleName,
        user: userId,
        picture: image,
      };
      await Profile.create(userObject);
    } else {
      const users = await Profile.findById(user._id).exec();
      users.firstname = firstName;
      users.lastname = lastName;
      users.middlename = middleName;
      users.picture = image;
      await users.save();
    }
    return res.json({ message: `profile updated` });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
