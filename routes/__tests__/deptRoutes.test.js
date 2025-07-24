const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());
// Mock deptController.getAllDept to return a dummy response
jest.mock('../../controllers/deptController', () => ({
  getAllDept: (req, res) => res.status(200).json([{ name: 'Test Dept' }]),
  createNewDept: jest.fn(),
  updateDept: jest.fn(),
  deleteDept: jest.fn(),
}));

describe('Dept Routes', () => {
  it('should respond to GET /dept with 200 and dummy data', async () => {
    const res = await request(app).get('/dept');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Test Dept');
  });
}); 