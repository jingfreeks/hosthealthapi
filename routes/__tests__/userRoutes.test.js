// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());

const request = require('supertest');
const app = require('../../app');

// Mock usersController with all required methods for userRoutes.js and firebaseSignupRoutes.js
jest.mock('../../controllers/usersController', () => ({
  getAllUsers: (req, res) => res.status(200).json([{ username: 'testuser' }]),
  createNewUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  createFNewUser: jest.fn(),
}));

describe('User Routes', () => {
  it('should respond to GET /users with 200 and dummy data', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('username', 'testuser');
  });
}); 