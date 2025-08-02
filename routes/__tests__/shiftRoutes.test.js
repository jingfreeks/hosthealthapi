const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());
// Mock shiftController.getAllShift to return a dummy response
jest.mock('../../controllers/shiftController', () => ({
  getAllShift: (req, res) => res.status(200).json([{ title: 'Test Shift' }]),
  createNewShift: jest.fn(),
  updateShift: jest.fn(),
  deleteShift: jest.fn(),
}));

describe('Shift Routes', () => {
  it('should respond to GET /shift with 200 and dummy data', async () => {
    const res = await request(app).get('/shift');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('title', 'Test Shift');
  });
}); 