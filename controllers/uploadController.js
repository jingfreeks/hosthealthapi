
const path = require("path");
const util=require("util")
const hostName=require('os').hostname();
// @desc Get all banks
// @route GET /banks
// @access Private
const getUpload = async (req, res) => {
  const files = req.files;
  const md5=files.avatar.md5;

  const extension=path.extname(files.avatar.name)
  const url="uploads/" + md5 + extension


   await util.promisify(files.avatar.mv)("./public/"+url)

  return res.json({
    status: "success",
    url,
    message: "Upload Success",
  });
};

module.exports = {
  getUpload,
};
