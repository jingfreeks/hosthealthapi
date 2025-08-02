const notesController = require('../notesController');
jest.mock('../../models/Notes');
const Note = require('../../models/Notes');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('notesController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllNotes', () => {
    it('should return 400 if no notes found', async () => {
      Note.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([]) }) });
      const req = {};
      const res = mockRes();
      await notesController.getAllNotes(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No notes found' });
    });
    it('should return notes', async () => {
      Note.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([{ title: 'Note1', createdAt: new Date() }]) }) });
      const req = {};
      const res = mockRes();
      await notesController.getAllNotes(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ title: 'Note1' })
      ]);
    });
  });

  describe('createNewNote', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await notesController.createNewNote(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 409 if duplicate note title', async () => {
      Note.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ title: 'Note1' }) }) })
      });
      const req = { body: { title: 'Note1', body: 'b', lat: 1, long: 2 } };
      const res = mockRes();
      await notesController.createNewNote(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate note title' });
    });
    it('should create a new note', async () => {
      Note.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      Note.create.mockResolvedValueOnce({ title: 'Note1' });
      const req = { body: { title: 'Note1', body: 'b', lat: 1, long: 2 } };
      const res = mockRes();
      await notesController.createNewNote(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'New note created' });
    });
  });

  describe('updateNote', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await notesController.updateNote(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 400 if note not found', async () => {
      Note.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1', title: 'Note1', body: 'b', lat: 1, long: 2 } };
      const res = mockRes();
      await notesController.updateNote(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Note not found' });
    });
    it('should return 409 if duplicate note title', async () => {
      Note.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', title: 'Note1', save: jest.fn().mockResolvedValue({ title: 'Note1' }) }) });
      Note.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ _id: '2', title: 'Note1' }) }) })
      });
      const req = { body: { id: '1', title: 'Note1', body: 'b', lat: 1, long: 2 } };
      const res = mockRes();
      await notesController.updateNote(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate note title' });
    });
    it('should update note', async () => {
      Note.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', title: 'Note1', save: jest.fn().mockResolvedValue({ title: 'Note1' }) }) });
      Note.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      const req = { body: { id: '1', title: 'Note1', body: 'b', lat: 1, long: 2 } };
      const res = mockRes();
      await notesController.updateNote(req, res);
      expect(res.json).toHaveBeenCalledWith(`'Note1' updated`);
    });
  });

  describe('deleteNote', () => {
    it('should return 400 if id is missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await notesController.deleteNote(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Note ID required' });
    });
    it('should return 400 if note not found', async () => {
      Note.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await notesController.deleteNote(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Note not found' });
    });
    it('should delete note', async () => {
      Note.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ title: 'Note1', _id: '1', deleteOne: jest.fn().mockResolvedValue({ title: 'Note1', _id: '1' }) }) });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await notesController.deleteNote(req, res);
      expect(res.json).toHaveBeenCalledWith(`Note 'Note1' with ID 1 deleted`);
    });
  });
}); 