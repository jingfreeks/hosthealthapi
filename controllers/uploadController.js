/**
 * Controller for Upload operations
 * @module controllers/uploadController
 */
const path = require("path");
const util = require("util");
const hostName = require('os').hostname();

/**
 * Handle file upload
 * @route POST /upload
 * @access Private
 */
const getUpload = async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }
    const files = req.files;
    const md5 = files.avatar.md5;
    const extension = path.extname(files.avatar.name);
    const url = "uploads/" + md5 + extension;
    await util.promisify(files.avatar.mv)("./public/" + url);
    return res.json({
      status: "success",
      url,
      message: "Upload Success",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  getUpload,
};
