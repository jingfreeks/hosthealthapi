const cityController = require('../cityController');

jest.mock('../../models/Cities');
jest.mock('../../models/States');
jest.mock('../../models/Company');
jest.mock('../../models/Jobs');
const City = require('../../models/Cities');
const State = require('../../models/States');
const Company = require('../../models/Company');
const Jobs = require('../../models/Jobs');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('cityController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllCities', () => {
    it('should return 400 if no cities found', async () => {
      City.find.mockReturnValueOnce({ lean: jest.fn().mockResolvedValueOnce([]) });
      const req = {};
      const res = mockRes();
      await cityController.getAllCities(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No city found' });
    });
    it('should return cities with state and matches', async () => {
      City.find.mockReturnValueOnce({ lean: jest.fn().mockResolvedValueOnce([{ _id: '1', name: 'City1', state: 's1' }]) });
      State.findById.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ name: 'State1' }) }) });
      Company.find.mockReturnValueOnce({ lean: jest.fn().mockResolvedValueOnce([]) });
      const req = {};
      const res = mockRes();
      await cityController.getAllCities(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'City1', statename: 'State1', matches: 0, salary: '$2,659' })
      ]);
    });
  });

  describe('createNewCities', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: { name: 'City1' } };
      const res = mockRes();
      await cityController.createNewCities(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 409 if duplicate city name', async () => {
      City.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ name: 'City1' }) }) })
      });
      const req = { body: { name: 'City1', stateId: 's1', image: 'img.png' } };
      const res = mockRes();
      await cityController.createNewCities(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate city name' });
    });
  });
}); 