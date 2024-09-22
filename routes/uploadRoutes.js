const express = require("express");
const fileUpload = require("express-fileupload");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const filesPayloadExist = require("../middleware/filePayloadexist");
const fileExtLimit = require("../middleware/fileExtLimit");
const fileSizeLimit = require("../middleware/fileSizeLimit");

const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
router
  .route("/")
  .post(
    fileUpload({ createParentPath: true }),
    filesPayloadExist,
    fileExtLimit([".png", ".jpg", ".jpeg"]),
    fileSizeLimit,
    uploadController.getUpload
  );

module.exports = router;
