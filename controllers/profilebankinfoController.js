/**
 * Controller for Profile Bank Info operations
 * @module controllers/profilebankinfoController
 */
const PBankInfo = require("../models/Pbankinfo");

/**
 * Get bank information for a user
 * @route GET /onboarding/bankinfo/:userId
 * @access Private
 */
const getBankInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }
    const usrBankInfo = await PBankInfo.findOne({ user: userId }).lean().exec();
    if (!usrBankInfo) {
      return res.status(400).json({ message: "No Bank information found" });
    }
    const bankInfo = {
      accountNo: usrBankInfo.accountNo,
      accountName: usrBankInfo.accountName,
      bank: usrBankInfo.bank,
    };
    return res.json(bankInfo);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create or update bank information for a user
 * @route PATCH /onboarding/bankinfo/:userId
 * @access Private
 */
const updateBankInfo = async (req, res) => {
  try {
    const { accountNo, accountName, bank } = req.body;
    const { userId } = req.params;
    if (!userId || !accountNo || !accountName || !bank) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let user = await PBankInfo.findOne({ user: userId }).lean().exec();
    if (!user) {
      const userObject = {
        accountNo,
        accountName,
        bank,
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
    return res.json({ message: `profile bank information updated` });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getBankInfo,
  updateBankInfo,
};
