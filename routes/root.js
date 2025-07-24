const express = require("express");
const router = express.Router();
const path = require("path");

// @route GET / or /index(.html)? - Serve the index.html file
router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

module.exports = router;
