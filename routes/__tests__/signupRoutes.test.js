const request = require('supertest');
const app = require('../../app');

// Mock usersController with all required methods for userRoutes.js and firebaseSignupRoutes.js
jest.mock('../../controllers/usersController', () => ({
  createNewUser: (req, res) => res.status(201).json({ message: 'User signed up' }),
  createFNewUser: jest.fn(),
  getAllUsers: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

describe('Signup Routes', () => {
  it('should respond to POST /signup with 201 and dummy data', async () => {
    const res = await request(app).post('/signup').send({ email: 'test@example.com', password: 'testpass' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User signed up');
  });
}); 