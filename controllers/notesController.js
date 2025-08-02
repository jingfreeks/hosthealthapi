/**
 * Controller for Notes operations
 * @module controllers/notesController
 */
const Note = require("../models/Notes");
const User = require("../models/Users");

/**
 * Get all notes
 * @route GET /notes
 * @access Private
 */
const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().lean().exec();
    if (!notes?.length) {
      return res.status(400).json({ message: "No notes found" });
    }
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(notes);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create new note
 * @route POST /notes
 * @access Private
 */
const createNewNote = async (req, res) => {
  try {
    const { title, body, lat, long } = req.body;
    if (!body || !title || !lat || !long) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await Note.findOne({ title })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate note title" });
    }
    const note = await Note.create({ title, body, lat, long });
    if (note) {
      return res.status(201).json({ message: "New note created" });
    } else {
      return res.status(400).json({ message: "Invalid note data received" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a note
 * @route PATCH /notes
 * @access Private
 */
const updateNote = async (req, res) => {
  try {
    const { id, title, body, lat, long } = req.body;
    if (!id || !body || !title || !lat || !long) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const note = await Note.findById(id).exec();
    if (!note) {
      return res.status(400).json({ message: "Note not found" });
    }
    const duplicate = await Note.findOne({ title })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate && duplicate?._id.toString() !== id) {
      return res.status(409).json({ message: "Duplicate note title" });
    }
    note.body = body;
    note.title = title;
    note.lat = lat;
    note.long = long;
    const updatedNote = await note.save();
    return res.json(`'${updatedNote.title}' updated`);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a note
 * @route DELETE /notes
 * @access Private
 */
const deleteNote = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Note ID required" });
    }
    const note = await Note.findById(id).exec();
    if (!note) {
      return res.status(400).json({ message: "Note not found" });
    }
    const result = await note.deleteOne();
    const reply = `Note '${result.title}' with ID ${result._id} deleted`;
    return res.json(reply);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
