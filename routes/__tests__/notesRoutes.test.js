const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());
// Mock notesController.getAllNotes to return a dummy response
jest.mock('../../controllers/notesController', () => ({
  getAllNotes: (req, res) => res.status(200).json([{ title: 'Test Note' }]),
  createNewNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
}));

describe('Notes Routes', () => {
  it('should respond to GET /notes with 200 and dummy data', async () => {
    const res = await request(app).get('/notes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('title', 'Test Note');
  });
}); 