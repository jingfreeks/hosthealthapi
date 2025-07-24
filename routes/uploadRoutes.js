const express = require("express");
const fileUpload = require("express-fileupload");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const filesPayloadExist = require("../middleware/filePayloadexist");
const fileExtLimit = require("../middleware/fileExtLimit");
const fileSizeLimit = require("../middleware/fileSizeLimit");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /upload routes
router.use(verifyJWT);

// @route POST /upload - Upload a file (accepts .png, .jpg, .jpeg)
// Uses express-fileupload, checks payload, extension, and size, then calls controller
router
  .route("/")
  .post(
    fileUpload({ createParentPath: true }), // Handle file upload
    filesPayloadExist,                     // Ensure file payload exists
    fileExtLimit([".png", ".jpg", ".jpeg"]), // Limit file extensions
    fileSizeLimit,                         // Limit file size
    uploadController.getUpload             // Handle upload logic
  );

module.exports = router;
