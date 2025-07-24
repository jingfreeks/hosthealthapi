const myjobsController = require('../myjobsController');
jest.mock('../../models/Jobs');
jest.mock('../../models/Myjobs');
jest.mock('../../models/Cities');
jest.mock('../../models/States');
jest.mock('../../models/Department');
jest.mock('../../models/Company');
jest.mock('../../models/Shift');
jest.mock('../../models/Users');
const Jobs = require('../../models/Jobs');
const Myjobs = require('../../models/Myjobs');
const Comp = require('../../models/Company');
const City = require('../../models/Cities');
const State = require('../../models/States');
const Dept = require('../../models/Department');
const Shift = require('../../models/Shift');
const User = require('../../models/Users');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('myjobsController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getMyJobs', () => {
    it('should return 400 if userId is missing', async () => {
      const req = { params: {} };
      const res = mockRes();
      await myjobsController.getMyJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User Id should be required' });
    });
    it('should return 400 if no jobs found', async () => {
      Myjobs.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([]) }) });
      const req = { params: { userId: 'u1' } };
      const res = mockRes();
      await myjobsController.getMyJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No jobs found' });
    });
    it('should return jobs with details', async () => {
      Myjobs.find.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([{ jobId: 'j1', user: 'u1', _id: 'm1' }]) }) });
      Jobs.findById.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ company: 'c1', department: 'd1', shift: 's1', city: 'city1', salaryrange: '1000', image: 'img', jobtitle: 'jt', match: 1 }) }) });
      Comp.findById.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ city: 'city1', name: 'Comp', address: 'Addr' }) }) });
      City.findById.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ state: 'state1', name: 'City' }) }) });
      State.findById.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ name: 'ST' }) }) });
      Dept.findById.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ name: 'Dept' }) }) });
      Shift.findById.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ title: 'Shift' }) }) });
      const req = { params: { userId: 'u1' } };
      const res = mockRes();
      await myjobsController.getMyJobs(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ user: 'u1', jobtitle: 'jt', compname: 'Comp', cityname: 'City', statename: 'ST', deptname: 'Dept', shiftname: 'Shift' })
      ]);
    });
  });

  describe('createInterestedJobs', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await myjobsController.createInterestedJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 409 if duplicate job', async () => {
      Myjobs.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ jobId: 'j1', user: 'u1' }) }) })
      });
      const req = { body: { jobId: 'j1', userId: 'u1' } };
      const res = mockRes();
      await myjobsController.createInterestedJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate Jobs selected' });
    });
    it('should return 400 if user not found', async () => {
      Myjobs.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      User.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { jobId: 'j1', userId: 'u1' } };
      const res = mockRes();
      await myjobsController.createInterestedJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('updateMyStatus', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await myjobsController.updateMyStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 400 if job not found', async () => {
      Jobs.findById.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) }) });
      const req = { body: { id: 'm1', jobId: 'j1', userId: 'u1', status: 'Interested' } };
      const res = mockRes();
      await myjobsController.updateMyStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job id not found' });
    });
    it('should return 400 if user not found', async () => {
      Jobs.findById.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) }) });
      User.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: 'm1', jobId: 'j1', userId: 'u1', status: 'Interested' } };
      const res = mockRes();
      await myjobsController.updateMyStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
    it('should return 400 if myjob not found', async () => {
      Jobs.findById.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) }) });
      User.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
      Myjobs.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: 'm1', jobId: 'j1', userId: 'u1', status: 'Interested' } };
      const res = mockRes();
      await myjobsController.updateMyStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'MyJob not found' });
    });
    it('should update myjob status', async () => {
      Jobs.findById.mockReturnValueOnce({ lean: jest.fn().mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) }) });
      User.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
      Myjobs.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ save: jest.fn().mockResolvedValue({ _id: 'm1', status: 'Accepted' }) }) });
      const req = { body: { id: 'm1', jobId: 'j1', userId: 'u1', status: 'Accepted' } };
      const res = mockRes();
      await myjobsController.updateMyStatus(req, res);
      expect(res.json).toHaveBeenCalledWith(`'m1' job status updated`);
    });
  });

  describe('deleteMyJobs', () => {
    it('should return 400 if id is missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await myjobsController.deleteMyJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'My Job ID required' });
    });
    it('should return 400 if myjob not found', async () => {
      Myjobs.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: 'm1' } };
      const res = mockRes();
      await myjobsController.deleteMyJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Jobs not found' });
    });
    it('should delete myjob', async () => {
      Myjobs.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ deleteOne: jest.fn().mockResolvedValue({ _id: 'm1' }) }) });
      const req = { body: { id: 'm1' } };
      const res = mockRes();
      await myjobsController.deleteMyJobs(req, res);
      expect(res.json).toHaveBeenCalledWith(`Job 'm1' deleted`);
    });
  });
}); 