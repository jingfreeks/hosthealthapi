const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());
// Mock bankController.getAllBanks to return a dummy response
jest.mock('../../controllers/bankController', () => ({
  getAllBanks: (req, res) => res.status(200).json([{ name: 'Test Bank' }]),
  createNewBanks: jest.fn(),
  updateBank: jest.fn(),
  deleteBank: jest.fn(),
}));

describe('Bank Routes', () => {
  it('should respond to GET /bank with 200 and dummy data', async () => {
    const res = await request(app).get('/bank');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Test Bank');
  });
}); 