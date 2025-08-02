const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());
// Mock profileController.getProfile to return a dummy response
jest.mock('../../controllers/profileController', () => ({
  getProfile: (req, res) => res.status(200).json({ firstname: 'Test', lastname: 'User' }),
  updateProfile: jest.fn(),
}));
// Mock profileBankInfoController for completeness
jest.mock('../../controllers/profilebankinfoController', () => ({
  getBankInfo: jest.fn(),
  updateBankInfo: jest.fn(),
}));

describe('OnBoarding Routes', () => {
  it('should respond to GET /onboarding/profile/:userId with 200 and dummy data', async () => {
    const res = await request(app).get('/onboarding/profile/123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('firstname', 'Test');
    expect(res.body).toHaveProperty('lastname', 'User');
  });
}); 