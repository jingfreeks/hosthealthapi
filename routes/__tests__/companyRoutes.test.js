const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());
// Mock companyController.getAllCompanies to return a dummy response
jest.mock('../../controllers/compController', () => ({
  getAllCompanies: (req, res) => res.status(200).json([{ name: 'Test Company' }]),
  createNewCompany: jest.fn(),
  updateCompany: jest.fn(),
  deleteCompany: jest.fn(),
}));

describe('Company Routes', () => {
  it('should respond to GET /company with 200 and dummy data', async () => {
    const res = await request(app).get('/company');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Test Company');
  });
}); 