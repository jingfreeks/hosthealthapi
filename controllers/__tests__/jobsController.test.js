const jobsController = require('../jobsController');

jest.mock('../../models/Jobs');
jest.mock('../../models/Company');
jest.mock('../../models/Cities');
jest.mock('../../models/States');
jest.mock('../../models/Department');
jest.mock('../../models/Shift');
jest.mock('../../models/Myjobs');
jest.mock('../../models/Pskills');
jest.mock('../../models/Profile');

const Jobs = require('../../models/Jobs');
const Comp = require('../../models/Company');
const City = require('../../models/Cities');
const State = require('../../models/States');
const Dept = require('../../models/Department');
const Shift = require('../../models/Shift');
const Myjob = require('../../models/Myjobs');
const Pskill = require('../../models/Pskills');
const Profile = require('../../models/Profile');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('jobsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllJobs', () => {
    it('should return 400 if no jobs found', async () => {
      Jobs.find.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([])
        })
      });
      const req = { query: {} };
      const res = mockRes();
      await jobsController.getAllJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No jobs found' });
    });

    it('should return jobs with match percentage when userId provided', async () => {
      const mockJobs = [
        {
          _id: '1',
          jobtitle: 'Developer',
          company: 'comp1',
          department: 'dept1',
          shift: 'shift1',
          skillTags: ['JavaScript', 'React']
        }
      ];

      Jobs.find.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(mockJobs)
        })
      });

      // Mock the related models
      Comp.findById.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce({ name: 'Company1', city: 'city1' })
        })
      });

      City.findById.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce({ name: 'City1', state: 'state1' })
        })
      });

      State.findById.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce({ name: 'State1' })
        })
      });

      Dept.findById.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce({ name: 'Dept1' })
        })
      });

      Shift.findById.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce({ title: 'Shift1' })
        })
      });

      Myjob.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null)
      });

      Pskill.find.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([
            { skill: 'JavaScript' },
            { skill: 'React' }
          ])
        })
      });

      const req = { query: { userId: 'user1' } };
      const res = mockRes();
      await jobsController.getAllJobs(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          jobtitle: 'Developer',
          matchPercentage: 100
        })
      ]);
    });
  });

  describe('createNewJobs', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await jobsController.createNewJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required including at least one skill tag' });
    });

    it('should return 400 if skillTags is not an array', async () => {
      const req = {
        body: {
          image: 'img.jpg',
          jobtitle: 'Developer',
          compId: 'comp1',
          deptId: 'dept1',
          weeks: '40',
          shiftId: 'shift1',
          match: '90%',
          salaryrange: '$50k',
          jobDescription: 'Description',
          jobRequirements: 'Requirements',
          jobType: 'Full-time',
          skillTags: 'not-an-array'
        }
      };
      const res = mockRes();
      await jobsController.createNewJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required including at least one skill tag' });
    });

    it('should return 400 if skillTags array is empty', async () => {
      const req = {
        body: {
          image: 'img.jpg',
          jobtitle: 'Developer',
          compId: 'comp1',
          deptId: 'dept1',
          weeks: '40',
          shiftId: 'shift1',
          match: '90%',
          salaryrange: '$50k',
          jobDescription: 'Description',
          jobRequirements: 'Requirements',
          jobType: 'Full-time',
          skillTags: []
        }
      };
      const res = mockRes();
      await jobsController.createNewJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required including at least one skill tag' });
    });

    it('should return 409 if duplicate job', async () => {
      Jobs.findOne.mockReturnValueOnce({
        collation: jest.fn().mockReturnValueOnce({
          lean: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce({ jobtitle: 'Developer' })
          })
        })
      });

      const req = {
        body: {
          image: 'img.jpg',
          jobtitle: 'Developer',
          compId: 'comp1',
          deptId: 'dept1',
          weeks: '40',
          shiftId: 'shift1',
          match: '90%',
          salaryrange: '$50k',
          jobDescription: 'Description',
          jobRequirements: 'Requirements',
          jobType: 'Full-time',
          skillTags: ['JavaScript', 'React']
        }
      };
      const res = mockRes();
      await jobsController.createNewJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate Job information' });
    });

    it('should return 400 if company not found', async () => {
      Jobs.findOne.mockReturnValueOnce({
        collation: jest.fn().mockReturnValueOnce({
          lean: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce(null)
          })
        })
      });

      Comp.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null)
      });

      const req = {
        body: {
          image: 'img.jpg',
          jobtitle: 'Developer',
          compId: 'comp1',
          deptId: 'dept1',
          weeks: '40',
          shiftId: 'shift1',
          match: '90%',
          salaryrange: '$50k',
          jobDescription: 'Description',
          jobRequirements: 'Requirements',
          jobType: 'Full-time',
          skillTags: ['JavaScript', 'React']
        }
      };
      const res = mockRes();
      await jobsController.createNewJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Company not found in our list' });
    });

    it('should create new job successfully', async () => {
      Jobs.findOne.mockReturnValueOnce({
        collation: jest.fn().mockReturnValueOnce({
          lean: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce(null)
          })
        })
      });

      Comp.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ name: 'Company1' })
      });

      Dept.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ name: 'Dept1' })
      });

      Shift.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ title: 'Shift1' })
      });

      Jobs.create.mockResolvedValueOnce({
        jobtitle: 'Developer',
        skillTags: ['JavaScript', 'React']
      });

      const req = {
        body: {
          image: 'img.jpg',
          jobtitle: 'Developer',
          compId: 'comp1',
          deptId: 'dept1',
          weeks: '40',
          shiftId: 'shift1',
          match: '90%',
          salaryrange: '$50k',
          jobDescription: 'Description',
          jobRequirements: 'Requirements',
          jobType: 'Full-time',
          skillTags: ['JavaScript', 'React']
        }
      };
      const res = mockRes();
      await jobsController.createNewJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'New jobs created' });
    });
  });

  describe('updateJobs', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await jobsController.updateJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required including at least one skill tag' });
    });

    it('should return 400 if job not found', async () => {
      const req = {
        body: {
          id: 'job1',
          image: 'img.jpg',
          jobtitle: 'Developer',
          compId: 'comp1',
          deptId: 'dept1',
          weeks: '40',
          shiftId: 'shift1',
          match: '90%',
          salaryrange: '$50k',
          jobDescription: 'Description',
          jobRequirements: 'Requirements',
          jobType: 'Full-time',
          skillTags: ['JavaScript', 'React']
        }
      };

      Dept.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ name: 'Dept1' })
      });

      Shift.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ title: 'Shift1' })
      });

      Jobs.findOne.mockReturnValueOnce({
        collation: jest.fn().mockReturnValueOnce({
          lean: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce(null)
          })
        })
      });

      Jobs.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null)
      });

      const res = mockRes();
      await jobsController.updateJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });

    it('should update job successfully', async () => {
      const mockJob = {
        image: 'old-img.jpg',
        jobtitle: 'Old Title',
        company: 'old-comp',
        department: 'old-dept',
        weeks: '30',
        shift: 'old-shift',
        match: '80%',
        salaryrange: '$40k',
        jobDescription: 'Old Description',
        jobRequirements: 'Old Requirements',
        jobType: 'Part-time',
        status: 'Inactive',
        skillTags: ['Old Skill'],
        save: jest.fn().mockResolvedValueOnce({
          jobtitle: 'Developer',
          skillTags: ['JavaScript', 'React']
        })
      };

      const req = {
        body: {
          id: 'job1',
          image: 'img.jpg',
          jobtitle: 'Developer',
          compId: 'comp1',
          deptId: 'dept1',
          weeks: '40',
          shiftId: 'shift1',
          match: '90%',
          salaryrange: '$50k',
          jobDescription: 'Description',
          jobRequirements: 'Requirements',
          jobType: 'Full-time',
          skillTags: ['JavaScript', 'React']
        }
      };

      Dept.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ name: 'Dept1' })
      });

      Shift.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ title: 'Shift1' })
      });

      Jobs.findOne.mockReturnValueOnce({
        collation: jest.fn().mockReturnValueOnce({
          lean: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce(null)
          })
        })
      });

      Jobs.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockJob)
      });

      const res = mockRes();
      await jobsController.updateJobs(req, res);
      expect(res.json).toHaveBeenCalledWith("'Developer' job updated");
    });
  });

  describe('calculateMatchPercentage', () => {
    it('should return 0 if no userId provided', async () => {
      const result = await jobsController.calculateMatchPercentage(['JavaScript', 'React'], null);
      expect(result).toBe(0);
    });

    it('should return 0 if no user skills found', async () => {
      Pskill.find.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([])
        })
      });

      const result = await jobsController.calculateMatchPercentage(['JavaScript', 'React'], 'user1');
      expect(result).toBe(0);
    });

    it('should calculate 100% match for exact skills', async () => {
      Pskill.find.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([
            { skill: 'JavaScript' },
            { skill: 'React' }
          ])
        })
      });

      const result = await jobsController.calculateMatchPercentage(['JavaScript', 'React'], 'user1');
      expect(result).toBe(100);
    });

    it('should calculate 50% match for partial skills', async () => {
      Pskill.find.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([
            { skill: 'JavaScript' }
          ])
        })
      });

      const result = await jobsController.calculateMatchPercentage(['JavaScript', 'React'], 'user1');
      expect(result).toBe(50);
    });

    it('should handle case-insensitive matching', async () => {
      Pskill.find.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([
            { skill: 'javascript' },
            { skill: 'REACT' }
          ])
        })
      });

      const result = await jobsController.calculateMatchPercentage(['JavaScript', 'React'], 'user1');
      expect(result).toBe(100);
    });
  });

  describe('getJobsBySkillMatch', () => {
    it('should return 400 if userId not provided', async () => {
      const req = { params: { minMatchPercentage: '50' }, query: {} };
      const res = mockRes();
      await jobsController.getJobsBySkillMatch(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'userId is required for skill matching' });
    });

    it('should return 400 if invalid minMatchPercentage', async () => {
      const req = { params: { minMatchPercentage: 'invalid' }, query: { userId: 'user1' } };
      const res = mockRes();
      await jobsController.getJobsBySkillMatch(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'minMatchPercentage must be a number between 0 and 100' });
    });

    it('should return 400 if no jobs found', async () => {
      Jobs.find.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([])
        })
      });

      const req = { params: { minMatchPercentage: '50' }, query: { userId: 'user1' } };
      const res = mockRes();
      await jobsController.getJobsBySkillMatch(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No jobs found' });
    });

    it('should return jobs with match percentage >= minMatch', async () => {
      const mockJobs = [
        {
          _id: '1',
          jobtitle: 'Developer',
          skillTags: ['JavaScript', 'React']
        },
        {
          _id: '2',
          jobtitle: 'Designer',
          skillTags: ['CSS', 'HTML']
        }
      ];

      Jobs.find.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(mockJobs)
        })
      });

      // Mock the getjobdetailinfo function calls
      Comp.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'Company1', city: 'city1' })
        })
      });

      City.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'City1', state: 'state1' })
        })
      });

      State.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'State1' })
        })
      });

      Dept.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'Dept1' })
        })
      });

      Shift.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ title: 'Shift1' })
        })
      });

      Myjob.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      // Mock user skills for match calculation
      Pskill.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            { skill: 'JavaScript' },
            { skill: 'React' }
          ])
        })
      });

      const req = { params: { minMatchPercentage: '50' }, query: { userId: 'user1' } };
      const res = mockRes();
      await jobsController.getJobsBySkillMatch(req, res);
      
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          jobtitle: 'Developer',
          matchPercentage: 100
        })
      ]);
    });
  });

  describe('getJobsByStatus', () => {
    it('should return 400 if invalid status', async () => {
      const req = { params: { status: 'Invalid' }, query: {} };
      const res = mockRes();
      await jobsController.getJobsByStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid status. Must be one of: Active, Inactive, Closed, Draft' });
    });

    it('should return jobs by status', async () => {
      const mockJobs = [{ _id: '1', jobtitle: 'Developer', status: 'Active' }];

      Jobs.find.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(mockJobs)
        })
      });

      // Mock the related models
      Comp.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'Company1', city: 'city1' })
        })
      });

      City.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'City1', state: 'state1' })
        })
      });

      State.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'State1' })
        })
      });

      Dept.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'Dept1' })
        })
      });

      Shift.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ title: 'Shift1' })
        })
      });

      Myjob.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      const req = { params: { status: 'Active' }, query: { userId: 'user1' } };
      const res = mockRes();
      await jobsController.getJobsByStatus(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          jobtitle: 'Developer'
        })
      ]);
    });
  });

  describe('getJobsByType', () => {
    it('should return 400 if invalid job type', async () => {
      const req = { params: { jobType: 'Invalid' }, query: {} };
      const res = mockRes();
      await jobsController.getJobsByType(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid job type. Must be one of: Full-time, Part-time, Contract, Temporary, Internship' });
    });

    it('should return jobs by type', async () => {
      const mockJobs = [{ _id: '1', jobtitle: 'Developer', jobType: 'Full-time' }];

      Jobs.find.mockReturnValueOnce({
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(mockJobs)
        })
      });

      // Mock the related models
      Comp.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'Company1', city: 'city1' })
        })
      });

      City.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'City1', state: 'state1' })
        })
      });

      State.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'State1' })
        })
      });

      Dept.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'Dept1' })
        })
      });

      Shift.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ title: 'Shift1' })
        })
      });

      Myjob.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      const req = { params: { jobType: 'Full-time' }, query: { userId: 'user1' } };
      const res = mockRes();
      await jobsController.getJobsByType(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          jobtitle: 'Developer'
        })
      ]);
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
      Jobs.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null)
      });

      const req = { body: { id: 'job1' } };
      const res = mockRes();
      await jobsController.deleteJobs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });

    it('should delete job successfully', async () => {
      const mockJob = {
        deleteOne: jest.fn().mockResolvedValueOnce({
          name: 'Developer',
          _id: 'job1'
        })
      };

      Jobs.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockJob)
      });

      const req = { body: { id: 'job1' } };
      const res = mockRes();
      await jobsController.deleteJobs(req, res);
      expect(res.json).toHaveBeenCalledWith('Job \'Developer\' with ID job1 deleted');
    });
  });
}); 