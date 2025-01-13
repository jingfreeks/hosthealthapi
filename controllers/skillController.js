const Skill = require("../models/Skill");

// @desc Get all skill
// @route GET /skill
// @access Private
const getAllSkill = async (req, res) => {
  // Get all notes from MongoDB
  const skill = await Skill.find().lean();

  // If no city
  if (!skill?.length) {
    return res.status(400).json({ message: "No skill found" });
  }

  res.json(skill);
};

// @desc Create new skill
// @route POST /skill
// @access Private
const createNewSkill = async (req, res) => {
  try {
    const { name } = req.body;

    // Confirm data
    if (!name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate title
    const duplicate = await Skill.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate skill title" });
    }

    // Create and store the new city
    const skill = await Skill.create({ name });
    if (skill) {
      // Created
      return res.status(201).json({ message: "New skill created" });
    } else {
      return res.status(400).json({ message: "Invalid skill data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a skill
// @route PATCH /skill
// @access Private
const updateSkill = async (req, res) => {
  const { id, name } = req.body;

  // Confirm data
  if (!id || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm city exists to update
  const skill = await Skill.findById(id).exec();
  if (!skill) {
    return res.status(400).json({ message: "Skill not found" });
  }

  // Check for duplicate title
  const duplicate = await Skill.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Skill name" });
  }

  skill.name = name;

  const updatedShift = await skill.save();

  res.json(`'${updatedShift.name}' Skill  updated`);
};

// @desc Delete a skill
// @route DELETE /skill
// @access Private
const deleteSkill = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Shift ID required" });
  }

  //check if this exist to jobs before deleting

  // Confirm city exists to delete
  const skill = await Skill.findById(id).exec();

  if (!skill) {
    return res.status(400).json({ message: "Shift not found" });
  }

  const result = await skill.deleteOne();
 
  const reply = `Skill '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = { getAllSkill, createNewSkill, updateSkill, deleteSkill };
