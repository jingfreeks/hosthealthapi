const profilebankinfoController = require('../profilebankinfoController');
jest.mock('../../models/Pbankinfo');
const PBankInfo = require('../../models/Pbankinfo');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('profilebankinfoController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getBankInfo', () => {
    it('should return 400 if userId is missing', async () => {
      const req = { params: {} };
      const res = mockRes();
      await profilebankinfoController.getBankInfo(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID required' });
    });
    it('should return 400 if bank info not found', async () => {
      PBankInfo.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) });
      const req = { params: { userId: 'u1' } };
      const res = mockRes();
      await profilebankinfoController.getBankInfo(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No Bank information found' });
    });
    it('should return bank info', async () => {
      PBankInfo.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ accountNo: '123', accountName: 'John', bank: 'Bank' }) }) });
      const req = { params: { userId: 'u1' } };
      const res = mockRes();
      await profilebankinfoController.getBankInfo(req, res);
      expect(res.json).toHaveBeenCalledWith({ accountNo: '123', accountName: 'John', bank: 'Bank' });
    });
  });

  describe('updateBankInfo', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { params: {}, body: {} };
      const res = mockRes();
      await profilebankinfoController.updateBankInfo(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should create new bank info if not found', async () => {
      PBankInfo.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) });
      PBankInfo.create.mockResolvedValueOnce({});
      const req = { params: { userId: 'u1' }, body: { accountNo: '123', accountName: 'John', bank: 'Bank' } };
      const res = mockRes();
      await profilebankinfoController.updateBankInfo(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'profile bank information updated' });
    });
    it('should update existing bank info', async () => {
      PBankInfo.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ _id: 'b1' }) }) });
      PBankInfo.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ save: jest.fn().mockResolvedValue({}) }) });
      const req = { params: { userId: 'u1' }, body: { accountNo: '123', accountName: 'John', bank: 'Bank' } };
      const res = mockRes();
      await profilebankinfoController.updateBankInfo(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'profile bank information updated' });
    });
  });
}); 