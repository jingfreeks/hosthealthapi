const shiftController = require('../shiftController');
jest.mock('../../models/Shift');
const Shift = require('../../models/Shift');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('shiftController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllShift', () => {
    it('should return 400 if no shifts found', async () => {
      Shift.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([]) }) });
      const req = {};
      const res = mockRes();
      await shiftController.getAllShift(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No shift found' });
    });
    it('should return shifts', async () => {
      Shift.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([{ title: 'Shift1' }]) }) });
      const req = {};
      const res = mockRes();
      await shiftController.getAllShift(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ title: 'Shift1' })
      ]);
    });
  });

  describe('createNewShift', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await shiftController.createNewShift(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 409 if duplicate shift', async () => {
      Shift.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ title: 'Shift1' }) }) })
      });
      const req = { body: { title: 'Shift1' } };
      const res = mockRes();
      await shiftController.createNewShift(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate shift title' });
    });
    it('should create a new shift', async () => {
      Shift.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      Shift.create.mockResolvedValueOnce({ title: 'Shift1' });
      const req = { body: { title: 'Shift1' } };
      const res = mockRes();
      await shiftController.createNewShift(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'New shift created' });
    });
  });

  describe('updateShift', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await shiftController.updateShift(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 400 if shift not found', async () => {
      Shift.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1', title: 'Shift1' } };
      const res = mockRes();
      await shiftController.updateShift(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Shift not found' });
    });
    it('should return 409 if duplicate shift', async () => {
      Shift.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', title: 'Shift1', save: jest.fn().mockResolvedValue({ title: 'Shift1' }) }) });
      Shift.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ _id: '2', title: 'Shift1' }) }) })
      });
      const req = { body: { id: '1', title: 'Shift1' } };
      const res = mockRes();
      await shiftController.updateShift(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate shift title' });
    });
    it('should update shift', async () => {
      Shift.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', title: 'Shift1', save: jest.fn().mockResolvedValue({ title: 'Shift1' }) }) });
      Shift.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      const req = { body: { id: '1', title: 'Shift1' } };
      const res = mockRes();
      await shiftController.updateShift(req, res);
      expect(res.json).toHaveBeenCalledWith(`'Shift1' shift updated`);
    });
  });

  describe('deleteShift', () => {
    it('should return 400 if id is missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await shiftController.deleteShift(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Shift ID required' });
    });
    it('should return 400 if shift not found', async () => {
      Shift.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await shiftController.deleteShift(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Shift not found' });
    });
    it('should delete shift', async () => {
      Shift.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ title: 'Shift1', _id: '1', deleteOne: jest.fn().mockResolvedValue({ title: 'Shift1', _id: '1' }) }) });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await shiftController.deleteShift(req, res);
      expect(res.json).toHaveBeenCalledWith(`Shift 'Shift1' with ID 1 deleted`);
    });
  });
}); 