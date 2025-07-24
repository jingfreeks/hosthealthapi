const productControllers = require('../productControllers');
jest.mock('../../models/Products');
const Product = require('../../models/Products');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('productControllers', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllProducts', () => {
    it('should return 400 if no products found', async () => {
      Product.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([]) }) });
      const req = {};
      const res = mockRes();
      await productControllers.getAllProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No Product found' });
    });
    it('should return products', async () => {
      Product.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([{ title: 'Product1' }]) }) });
      const req = {};
      const res = mockRes();
      await productControllers.getAllProducts(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ title: 'Product1' })
      ]);
    });
  });

  describe('createNewProducts', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await productControllers.createNewProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 409 if duplicate product', async () => {
      Product.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ title: 'Product1' }) }) })
      });
      const req = { body: { title: 'Product1', description: 'desc', category: 'cat', image: 'img', price: '10' } };
      const res = mockRes();
      await productControllers.createNewProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate Product name' });
    });
    it('should create a new product', async () => {
      Product.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      Product.create.mockResolvedValueOnce({ title: 'Product1' });
      const req = { body: { title: 'Product1', description: 'desc', category: 'cat', image: 'img', price: '10' } };
      const res = mockRes();
      await productControllers.createNewProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'New Product created' });
    });
  });

  describe('updateProducts', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await productControllers.updateProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 400 if product not found', async () => {
      Product.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1', title: 'Product1', description: 'desc', category: 'cat', image: 'img', price: '10' } };
      const res = mockRes();
      await productControllers.updateProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
    it('should return 409 if duplicate product', async () => {
      Product.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', title: 'Product1', save: jest.fn().mockResolvedValue({ title: 'Product1' }) }) });
      Product.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ _id: '2', title: 'Product1' }) }) })
      });
      const req = { body: { id: '1', title: 'Product1', description: 'desc', category: 'cat', image: 'img', price: '10' } };
      const res = mockRes();
      await productControllers.updateProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate Product name' });
    });
    it('should update product', async () => {
      Product.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', title: 'Product1', save: jest.fn().mockResolvedValue({ title: 'Product1' }) }) });
      Product.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      const req = { body: { id: '1', title: 'Product1', description: 'desc', category: 'cat', image: 'img', price: '10' } };
      const res = mockRes();
      await productControllers.updateProducts(req, res);
      expect(res.json).toHaveBeenCalledWith(`'Product1' Product updated`);
    });
  });

  describe('deleteProducts', () => {
    it('should return 400 if id is missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await productControllers.deleteProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product ID required' });
    });
    it('should return 400 if product not found', async () => {
      Product.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await productControllers.deleteProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
    it('should delete product', async () => {
      Product.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ title: 'Product1', _id: '1', deleteOne: jest.fn().mockResolvedValue({ title: 'Product1', _id: '1' }) }) });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await productControllers.deleteProducts(req, res);
      expect(res.json).toHaveBeenCalledWith(`Product 'Product1' with ID 1 deleted`);
    });
  });

  describe('viewProductDetails', () => {
    it('should return 400 if product not found', async () => {
      Product.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { params: { prodId: '1' } };
      const res = mockRes();
      await productControllers.viewProductDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product is not found in our list' });
    });
    it('should return product details', async () => {
      Product.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ title: 'Product1', _id: '1' }) });
      const req = { params: { prodId: '1' } };
      const res = mockRes();
      await productControllers.viewProductDetails(req, res);
      expect(res.json).toHaveBeenCalledWith({ title: 'Product1', _id: '1' });
    });
  });
}); 