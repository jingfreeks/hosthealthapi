const request = require('supertest');
const app = require('../../app');

// Mock productController.getAllProducts to return a dummy response
jest.mock('../../controllers/productControllers', () => ({
  getAllProducts: (req, res) => res.status(200).json([{ title: 'Test Product' }]),
  createNewProducts: jest.fn(),
  updateProducts: jest.fn(),
  deleteProducts: jest.fn(),
  viewProductDetails: jest.fn(),
}));

describe('Product Routes', () => {
  it('should respond to GET /product with 200 and dummy data', async () => {
    const res = await request(app).get('/product');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('title', 'Test Product');
  });
}); 