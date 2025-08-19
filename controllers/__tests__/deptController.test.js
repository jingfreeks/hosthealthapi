const deptController = require('../deptController');
jest.mock('../../models/Department');
const Dept = require('../../models/Department');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('deptController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllDept', () => {
    it('should return 400 if no departments found', async () => {
      Dept.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([]) }) });
      const req = {};
      const res = mockRes();
      await deptController.getAllDept(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No department found' });
    });
    it('should return departments', async () => {
      Dept.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([{ name: 'Dept1' }]) }) });
      const req = {};
      const res = mockRes();
      await deptController.getAllDept(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'Dept1' })
      ]);
    });
  });

  describe('createNewDept', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await deptController.createNewDept(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 409 if duplicate department name', async () => {
      Dept.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ name: 'Dept1' }) }) })
      });
      const req = { body: { name: 'Dept1' } };
      const res = mockRes();
      await deptController.createNewDept(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate department name' });
    });
  });

  describe('updateDept', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await deptController.updateDept(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 400 if department not found', async () => {
      Dept.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { _id: '1', name: 'Dept1' } };
      const res = mockRes();
      await deptController.updateDept(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Department not found' });
    });
    it('should return 409 if duplicate department name', async () => {
      Dept.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', name: 'Dept1', save: jest.fn().mockResolvedValue({ name: 'Dept1' }) }) });
      Dept.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ _id: '2', name: 'Dept1' }) }) })
      });
      const req = { body: { _id: '1', name: 'Dept1' } };
      const res = mockRes();
      await deptController.updateDept(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate Department name' });
    });
  });

  describe('deleteDept', () => {
    it('should return 400 if id is missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await deptController.deleteDept(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Department ID required' });
    });
    it('should return 400 if department not found', async () => {
      Dept.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { _id: '1' } };
      const res = mockRes();
      await deptController.deleteDept(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Department not found' });
    });
  });
}); 