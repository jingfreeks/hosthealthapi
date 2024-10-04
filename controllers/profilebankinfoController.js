const PBankInfo = require("../models/Pbankinfo");

// @desc Get bank information
// @route GET /onboarding/bankinfo
// @access Private
const getBankInfo = async (req, res) => {
  // Get all notes from MongoDB

  const { userId } = req.params;

  const usrBankInfo = await PBankInfo.findOne({ userId }).lean();

  // If no notes
  if (!usrBankInfo) {
    return res.status(400).json({ message: "No Bank information found" });
  }

  //get the return profile info
  const bankInfo = {
    accountNo: usrBankInfo.accountNo,
    accountName: usrBankInfo.accountName,
    bank: usrBankInfo.bank,
  };

  res.json(bankInfo);
};

// @desc Update bank information
// @route Patch /notes
// @access Private
const updateBankInfo = async (req, res) => {
  const { accountNo, accountName, bank } = req.body;
  const { userId } = req.params;

  const user = await PBankInfo.findOne({ user: userId }).lean().exec();

  if (!user) {
    const userObject = {
      accountNo: accountNo,
      accountName: accountName,
      bank: bank,
      user: userId,
    };
    await PBankInfo.create(userObject);
  } else {
    const bankinfos = await PBankInfo.findById(user._id).exec();
    bankinfos.accountNo = accountNo;
    bankinfos.accountName = accountName;
    bankinfos.bank = bank;
    await bankinfos.save();
  }

  //check for duplicate
  res.json({ message: `profile bank information updated` });
};

module.exports = {
  getBankInfo,
  updateBankInfo,
};
