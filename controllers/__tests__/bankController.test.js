const bankController = require('../bankController');

jest.mock('../../models/Bank');
const Bank = require('../../models/Bank');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('bankController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllBanks', () => {
    it('should return 400 if no banks found', async () => {
      Bank.find.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([])
      });
      const req = {};
      const res = mockRes();
      await bankController.getAllBanks(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No banks found' });
    });
    it('should return banks if found', async () => {
      Bank.find.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([{ name: 'Bank1' }])
      });
      const req = {};
      const res = mockRes();
      await bankController.getAllBanks(req, res);
      expect(res.json).toHaveBeenCalledWith([{ name: 'Bank1' }]);
    });
  });

  describe('createNewBanks', () => {
    it('should return 400 if name is missing', async () => {
      const req = { body: { address: 'Addr' } };
      const res = mockRes();
      await bankController.createNewBanks(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 409 if duplicate bank name', async () => {
      Bank.findOne.mockReturnValueOnce({
        collation: () => ({
          lean: () => ({
            exec: jest.fn().mockResolvedValueOnce({ name: 'Bank1' })
          })
        })
      });
      const req = { body: { name: 'Bank1', address: 'Addr' } };
      const res = mockRes();
      await bankController.createNewBanks(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate bank name' });
    });
  });
}); 