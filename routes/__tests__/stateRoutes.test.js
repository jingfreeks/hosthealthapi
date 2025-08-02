const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());
// Mock statesController.getAllStates to return a dummy response
jest.mock('../../controllers/stateController', () => ({
  getAllStates: (req, res) => res.status(200).json([{ name: 'Test State' }]),
  createNewStates: jest.fn(),
  updateState: jest.fn(),
  deleteState: jest.fn(),
}));

describe('State Routes', () => {
  it('should respond to GET /states with 200 and dummy data', async () => {
    const res = await request(app).get('/states');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Test State');
  });
}); 