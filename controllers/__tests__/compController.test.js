const compController = require('../compController');

jest.mock('../../models/Company');
jest.mock('../../models/Cities');
jest.mock('../../models/States');
const Company = require('../../models/Company');
const City = require('../../models/Cities');
const State = require('../../models/States');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('compController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllCompanies', () => {
    it('should return 400 if no companies found', async () => {
      Company.find.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce([]) }) });
      const req = {};
      const res = mockRes();
      await compController.getAllCompanies(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No company found' });
    });
    it('should return companies', async () => {
      Company.find.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce([{ _id: '1', name: 'Company1', city: 'c1' }]) }) });
      City.findById.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ name: 'CityName', state: 's1' }) }) });
      State.findById.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ name: 'StateName' }) }) });
      const req = {};
      const res = mockRes();
      await compController.getAllCompanies(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'Company1', cityname: 'CityName', state: 'ST' })
      ]);
    });
  });

  describe('createNewCompany', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: { name: 'Company1' } };
      const res = mockRes();
      await compController.createNewCompany(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 409 if duplicate company name', async () => {
      Company.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ name: 'Company1' }) }) })
      });
      const req = { body: { name: 'Company1', address: '123 St', cityId: 'c1' } };
      const res = mockRes();
      await compController.createNewCompany(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate company name' });
    });
  });
}); 