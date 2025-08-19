const request = require('supertest');
const app = require('../../app');

describe('Product Routes', () => {
  it('should return 404 since product routes are not implemented', async () => {
    const res = await request(app).get('/product');
    expect(res.statusCode).toBe(404);
    // The 404 response might be HTML or JSON depending on Accept header
    expect(res.body).toBeDefined();
  });

  it('should return 404 for any product endpoint', async () => {
    const res = await request(app).get('/product/123');
    expect(res.statusCode).toBe(404);
    // The 404 response might be HTML or JSON depending on Accept header
    expect(res.body).toBeDefined();
  });
}); 