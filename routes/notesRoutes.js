const express = require("express");
const router = express.Router();
const notesController = require("../controllers/notesController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /notes routes
router.use(verifyJWT);

// @route GET /notes - Get all notes
// @route POST /notes - Create new note
// @route PATCH /notes - Update a note
// @route DELETE /notes - Delete a note
router
  .route("/")
  .get(notesController.getAllNotes)
  .post(notesController.createNewNote)
  .patch(notesController.updateNote)
  .delete(notesController.deleteNote);

module.exports = router;
