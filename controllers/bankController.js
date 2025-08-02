const Bank = require("../models/Bank");

// @desc Get all banks
// @route GET /banks
// @access Private
const getAllBanks = async (req, res) => {
  const banks = await Bank.find().lean();
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
    const { name, address } = req.body;
    if (!name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await Bank.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate bank name" });
    }
    const banks = await Bank.create({ name, address });
    if (banks) {
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
  const { _id, name, address } = req.body;
  console.log("updateBank", req.body);
  if (!_id || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const bank = await Bank.findById(_id).exec();
  if (!bank) {
    return res.status(400).json({ message: "Bank not found" });
  }
  const duplicate = await Bank.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate && duplicate?._id.toString() !== _id) {
    return res.status(409).json({ message: "Duplicate Bank name" });
  }
  bank.name = name;
  bank.address = address;
  const updatedBank = await bank.save();
  res.json(`'${updatedBank.name}' bank updated`);
};

// @desc Delete a bank
// @route DELETE /bank
// @access Private
const deleteBank = async (req, res) => {
  const { _id } = req.body;
  if (!_id) {
    return res.status(400).json({ message: "Bank ID required" });
  }
  const bank = await Bank.findById(_id).exec();
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
