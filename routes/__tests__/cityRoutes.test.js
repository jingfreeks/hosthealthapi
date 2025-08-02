const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());
// Mock citiesController.getAllCities to return a dummy response
jest.mock('../../controllers/cityController', () => ({
  getAllCities: (req, res) => res.status(200).json([{ name: 'Test City' }]),
  createNewCities: jest.fn(),
  updateCity: jest.fn(),
  deleteCity: jest.fn(),
  getCitiesByJobs: jest.fn(),
}));

describe('City Routes', () => {
  it('should respond to GET /city with 200 and dummy data', async () => {
    const res = await request(app).get('/city');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Test City');
  });
}); 