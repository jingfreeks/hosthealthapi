const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());
// Mock profileController.getProfile to return a dummy response
jest.mock('../../controllers/profileController', () => ({
  getProfile: (req, res) => res.status(200).json({ firstname: 'Test', lastname: 'User' }),
  updateProfile: jest.fn(),
}));

describe('Profile Routes', () => {
  it('should respond to GET /profile/:userId with 200 and dummy data', async () => {
    const res = await request(app).get('/profile/123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('firstname', 'Test');
    expect(res.body).toHaveProperty('lastname', 'User');
  });
}); 