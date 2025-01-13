const Pskill = require("../models/Pskills");

// @desc Get all profile skill
// @route GET /profile/skill
// @access Private
const getProfileSkill = async (req, res) => {
  // Get all notes from MongoDB

  const { userId } = req.params;

  const usrProfileSkill = await Pskill.findOne({ user: userId }).lean();
  // If no notes
  if (!usrProfileSkill) {
    return res.status(400).json({ message: "No skill found" });
  }

  res.json(usrProfileSkill);
};

// @desc Create new note
// @route POST /profile/skill
// @access Private
const createProfileSkill = async (req, res) => {
  const { userId, skillId } = req.body;

  const pSkills = await Pskill.findOne({ userId, skillId }).lean().exec();
  if (pSkills) {
    return res.status(409).json({ message: "Duplicate Skill" });
  }
  const pskill = await Pskill.create({ name });
  if (pskill) {
    // Created
    return res.status(201).json({ message: "New profile skill created" });
  } else {
    return res.status(400).json({ message: "Invalid profile skill data received" });
  }
};

const deleteProfileSkill = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Profile Skill ID required" });
  }

  //check if this exist to jobs before deleting

  // Confirm city exists to delete
  const pskill = await Pskill.findById(id).exec();

  if (!pskill) {
    return res.status(400).json({ message: "Profile Skill not found" });
  }

  const result = await pskill.deleteOne();
 
  const reply = `Profile '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};
module.exports = {
  getProfileSkill,
  createProfileSkill,
  deleteProfileSkill
};
