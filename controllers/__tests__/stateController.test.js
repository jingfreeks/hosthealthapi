const stateController = require('../stateController');
jest.mock('../../models/States');
jest.mock('../../models/Cities');
const State = require('../../models/States');
const City = require('../../models/Cities');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('stateController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllStates', () => {
    it('should return 400 if no states found', async () => {
      State.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([]) }) });
      const req = {};
      const res = mockRes();
      await stateController.getAllStates(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No states found' });
    });
    it('should return states', async () => {
      State.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([{ name: 'State1' }]) }) });
      const req = {};
      const res = mockRes();
      await stateController.getAllStates(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'State1' })
      ]);
    });
  });

  describe('createNewStates', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await stateController.createNewStates(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 409 if duplicate state name', async () => {
      State.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ name: 'State1' }) }) })
      });
      const req = { body: { name: 'State1' } };
      const res = mockRes();
      await stateController.createNewStates(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate state name' });
    });
    it('should create a new state', async () => {
      State.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      State.create.mockResolvedValueOnce({ name: 'State1' });
      const req = { body: { name: 'State1' } };
      const res = mockRes();
      await stateController.createNewStates(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'New state created' });
    });
  });

  describe('updateState', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await stateController.updateState(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 400 if state not found', async () => {
      State.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1', name: 'State1' } };
      const res = mockRes();
      await stateController.updateState(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'State not found' });
    });
    it('should return 409 if duplicate state name', async () => {
      State.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', name: 'State1', save: jest.fn().mockResolvedValue({ name: 'State1' }) }) });
      State.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ _id: '2', name: 'State1' }) }) })
      });
      const req = { body: { id: '1', name: 'State1' } };
      const res = mockRes();
      await stateController.updateState(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate state name' });
    });
    it('should update state', async () => {
      State.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', name: 'State1', save: jest.fn().mockResolvedValue({ name: 'State1' }) }) });
      State.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      const req = { body: { id: '1', name: 'State1' } };
      const res = mockRes();
      await stateController.updateState(req, res);
      expect(res.json).toHaveBeenCalledWith(`'State1' updated`);
    });
  });

  describe('deleteState', () => {
    it('should return 400 if id is missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await stateController.deleteState(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'State ID required' });
    });
    it('should return 400 if state not found', async () => {
      State.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await stateController.deleteState(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'State not found' });
    });
    it('should return 400 if state is in use by city', async () => {
      State.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', name: 'State1', deleteOne: jest.fn().mockResolvedValue({ name: 'State1', _id: '1' }) }) });
      City.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ state: '1' }) }) })
      });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await stateController.deleteState(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cannot delete state because its already existed on the other transaction' });
    });
    it('should delete state', async () => {
      State.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', name: 'State1', deleteOne: jest.fn().mockResolvedValue({ name: 'State1', _id: '1' }) }) });
      City.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await stateController.deleteState(req, res);
      expect(res.json).toHaveBeenCalledWith(`City 'State1' with ID 1 deleted`);
    });
  });
}); 