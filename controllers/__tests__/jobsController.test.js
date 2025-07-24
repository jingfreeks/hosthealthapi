const jobsController = require('../jobsController');
jest.mock('../../models/Jobs');
jest.mock('../../models/Cities');
jest.mock('../../models/States');
jest.mock('../../models/Department');
jest.mock('../../models/Company');
jest.mock('../../models/Shift');
jest.mock('../../models/Myjobs');
const Jobs = require('../../models/Jobs');
const Dept = require('../../models/Department');
const Comp = require('../../models/Company');
const Shift = require('../../models/Shift');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('jobsController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllJobs', () => {
    it('should return 400 if no jobs found', async () => {
      Jobs.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([]) }) });
      const req = {};
      const res = mockRes();
      await jobsController.getAllJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No jobs found' });
    });
  });

  describe('createNewJobs', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await jobsController.createNewJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 409 if duplicate job', async () => {
      Jobs.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ jobtitle: 'Test', company: 'c1' }) }) })
      });
      const req = { body: { image: 'img', jobtitle: 'Test', compId: 'c1', deptId: 'd1', weeks: 1, shiftId: 's1', match: 1, salaryrange: '1000' } };
      const res = mockRes();
      await jobsController.createNewJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate Job information' });
    });
    it('should return 400 if company not found', async () => {
      Jobs.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      Comp.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { image: 'img', jobtitle: 'Test', compId: 'c1', deptId: 'd1', weeks: 1, shiftId: 's1', match: 1, salaryrange: '1000' } };
      const res = mockRes();
      await jobsController.createNewJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Company not found in our list' });
    });
    it('should return 400 if department not found', async () => {
      Jobs.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      Comp.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
      Dept.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { image: 'img', jobtitle: 'Test', compId: 'c1', deptId: 'd1', weeks: 1, shiftId: 's1', match: 1, salaryrange: '1000' } };
      const res = mockRes();
      await jobsController.createNewJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Department not found in our list' });
    });
    it('should return 400 if shift not found', async () => {
      Jobs.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      Comp.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
      Dept.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
      Shift.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { image: 'img', jobtitle: 'Test', compId: 'c1', deptId: 'd1', weeks: 1, shiftId: 's1', match: 1, salaryrange: '1000' } };
      const res = mockRes();
      await jobsController.createNewJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Shift  not found in our list' });
    });
  });

  describe('updateJobs', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await jobsController.updateJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 400 if department not found', async () => {
      Dept.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1', image: 'img', jobtitle: 'Test', compId: 'c1', deptId: 'd1', weeks: 1, shiftId: 's1', match: 1, salaryrange: '1000' } };
      const res = mockRes();
      await jobsController.updateJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Department not found in our list' });
    });
    it('should return 400 if shift not found', async () => {
      Dept.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
      Shift.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1', image: 'img', jobtitle: 'Test', compId: 'c1', deptId: 'd1', weeks: 1, shiftId: 's1', match: 1, salaryrange: '1000' } };
      const res = mockRes();
      await jobsController.updateJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Shift  not found in our list' });
    });
    it('should return 409 if duplicate job', async () => {
      Dept.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
      Shift.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
      Jobs.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ _id: '2', jobtitle: 'Test' }) }) })
      });
      const req = { body: { id: '1', image: 'img', jobtitle: 'Test', compId: 'c1', deptId: 'd1', weeks: 1, shiftId: 's1', match: 1, salaryrange: '1000' } };
      const res = mockRes();
      await jobsController.updateJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate Jobs in the company' });
    });
    it('should return 400 if job not found', async () => {
      Dept.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
      Shift.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
      Jobs.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      Jobs.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1', image: 'img', jobtitle: 'Test', compId: 'c1', deptId: 'd1', weeks: 1, shiftId: 's1', match: 1, salaryrange: '1000' } };
      const res = mockRes();
      await jobsController.updateJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });
  });

  describe('deleteJobs', () => {
    it('should return 400 if id is missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await jobsController.deleteJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job ID required' });
    });
    it('should return 400 if job not found', async () => {
      Jobs.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await jobsController.deleteJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });
  });
}); 