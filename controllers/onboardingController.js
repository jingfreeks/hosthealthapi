const Profile = require("../models/Profile");

// @desc Get all bankInfo
// @route GET /notes
// @access Private
const getBankInfo = async (req, res) => {
  // Get all notes from MongoDB

  const { userId } = req.params;

  const usrProfile = await Profile.findOne({userId}).lean();

  // If no notes
  if (!usrProfile) {
    return res.status(400).json({ message: "No user found" });
  }

  //get the return profile info
  const profileInfo = {
    firstName: usrProfile.firstname,
    lastName: usrProfile.lastname,
    middlename: usrProfile.middlename,
  };

  res.json(profileInfo);
};

// @desc Create new note
// @route POST /notes
// @access Private
const updateProfile = async (req, res) => {
  const { id, firstName, lastName, middleName,image } = req.body;
  const { userId } = req.params;

  const user = await Profile.findOne({user:userId}).lean().exec();

  if (!user) {
    const userObject={
      firstname:firstName,
      lastname:lastName,
      middlename:middleName,
      user:userId,
      picture:image
    }
    await Profile.create(userObject);
  }else{
    const users = await Profile.findById(user._id).exec();
    users.firstname = firstName;
    users.lastname = lastName;
    users.middlename = middleName;
    users.picture=image;
    await users.save();
  }

  //check for duplicate
  res.json({ message: `profile updated` });
};

module.exports = {
  getProfile,
  updateProfile,
};
