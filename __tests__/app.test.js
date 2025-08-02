const request = require('supertest');
const app = require('../app');

describe('Express App', () => {
  it('should respond to GET / with 200 or 404', async () => {
    const res = await request(app).get('/');
    expect([200, 404]).toContain(res.statusCode);
  });

  it('should respond with 404 for unknown routes', async () => {
    const res = await request(app).get('/some-nonexistent-route');
    expect(res.statusCode).toBe(404);
    expect(
      res.text.includes('The resource you have requested does not exist')
    ).toBeTruthy();
  });
}); 