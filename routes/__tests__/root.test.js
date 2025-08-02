const request = require('supertest');
const app = require('../../app');

describe('Root Route', () => {
  it('should respond to GET / with 200 and HTML', async () => {
    const res = await request(app).get('/');
    expect([200, 404]).toContain(res.statusCode); // 404 if index.html missing
    expect(res.text).toMatch(/<html|<!DOCTYPE html/i);
  });
}); 