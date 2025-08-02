const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());
// Mock jobsController.getAllJobs to return a dummy response
jest.mock('../../controllers/jobsController', () => ({
  getAllJobs: (req, res) => res.status(200).json([{ title: 'Test Job' }]),
  createNewJobs: jest.fn(),
  updateJobs: jest.fn(),
  deleteJobs: jest.fn(),
  viewJobDetails: jest.fn(),
}));
// Mock myJobsController for completeness
jest.mock('../../controllers/myjobsController', () => ({
  getMyJobs: jest.fn(),
  createInterestedJobs: jest.fn(),
  updateMyStatus: jest.fn(),
  deleteMyJobs: jest.fn(),
}));

describe('Jobs Routes', () => {
  it('should respond to GET /jobs with 200 and dummy data', async () => {
    const res = await request(app).get('/jobs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('title', 'Test Job');
  });
}); 