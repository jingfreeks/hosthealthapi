const request = require('supertest');
const app = require('../../app');

describe('Auth Routes', () => {
  it('should return 401 for GET /auth/refresh without cookie', async () => {
    const res = await request(app).get('/auth/refresh');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/unauthorized/i);
  });

  it('should return 204 or 200 for POST /auth/logout without cookie', async () => {
    const res = await request(app).post('/auth/logout');
    expect([200, 204]).toContain(res.statusCode);
  });
}); 