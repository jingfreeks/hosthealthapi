const request = require('supertest');
const app = require('../../app');

// Mock usersController with all required methods for userRoutes.js
jest.mock('../../controllers/usersController', () => ({
  createFNewUser: (req, res) => res.status(201).json({ message: 'User created' }),
  getAllUsers: jest.fn(),
  createNewUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

describe('Firebase Signup Routes', () => {
  it('should respond to POST /fsignup with 201 and dummy data', async () => {
    const res = await request(app).post('/fsignup').send({ email: 'test@example.com', password: 'testpass' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User created');
  });
}); 