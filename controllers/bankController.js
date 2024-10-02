const Bank = require("../models/Bank");

// @desc Get all banks
// @route GET /banks
// @access Private
const getAllBanks = async (req, res) => {
  // Get all notes from MongoDB
  const banks = await Bank.find().lean();

  // If no city
  if (!banks?.length) {
    return res.status(400).json({ message: "No banks found" });
  }
  res.json(banks);
};

// @desc Create new bank
// @route POST /bank
// @access Private
const createNewBanks = async (req, res) => {
  try {
    const { name,address } = req.body;

    // Confirm data
    if (!name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate title
    const duplicate = await Bank.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate bank name" });
    }

    // Create and store the new city
    const banks = await Bank.create({ name,address });
    if (banks) {
      // Created
      return res.status(201).json({ message: "New bank created" });
    } else {
      return res.status(400).json({ message: "Invalid bank data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a bank
// @route PATCH /bank
// @access Private
const updateBank = async (req, res) => {
  const { id, name,address} = req.body;

  // Confirm data
  if (!id || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const bank = await Bank.findById(id).exec();

  if (!bank) {
    return res.status(400).json({ message: "Bank not found" });
  }

  // Check for duplicate title
  const duplicate = await Bank.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Bank name" });
  }

  bank.name = name;
  bank.address=address;

  const updatedBank = await bank.save();

  res.json(`'${updatedBank.name}' bank  updated`);
};

// @desc Delete a bank
// @route DELETE /bank
// @access Private
const deleteBank = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Bank ID required" });
  }

  //check if this exist to jobs before deleting
  
  // Confirm bank exists to delete
  const bank = await Bank.findById(id).exec();

  if (!bank) {
    return res.status(400).json({ message: "Bank not found" });
  }

  const result = await bank.deleteOne();

  const reply = `Bank '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
    getAllBanks,
    createNewBanks,
    updateBank,
    deleteBank,
};
