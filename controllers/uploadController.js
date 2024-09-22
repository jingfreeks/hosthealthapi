
const path = require("path");
const util=require("util")
// @desc Get all banks
// @route GET /banks
// @access Private
const getUpload = async (req, res) => {
  const files = req.files;
  const md5=files.avatar.md5;

  const extension=path.extname(files.avatar.name)
  const url="/uploads/" + md5 + extension


   await util.promisify(files.avatar.mv)("./public"+url)
  // Object.keys(files).forEach((key) => {
  //   const filepath = path.resolve('./', "files", files[key].name);
  //   console.log('filepath',filepath)

  // });

  return res.json({
    status: "success",
    message: url,
  });
};

module.exports = {
  getUpload,
};
