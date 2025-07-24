const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next()
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => next());
// Mock file upload middlewares to always call next()
jest.mock('express-fileupload', () => () => (req, res, next) => next());
jest.mock('../../middleware/filePayloadexist', () => (req, res, next) => next());
jest.mock('../../middleware/fileExtLimit', () => () => (req, res, next) => next());
jest.mock('../../middleware/fileSizeLimit', () => (req, res, next) => next());
// Mock uploadController.getUpload to return a dummy response
jest.mock('../../controllers/uploadController', () => ({
  getUpload: (req, res) => res.status(201).json({ message: 'File uploaded' }),
}));

describe('Upload Routes', () => {
  it('should respond to POST /upload with 201 and dummy data', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('dummy'), 'test.png');
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'File uploaded');
  });
}); 