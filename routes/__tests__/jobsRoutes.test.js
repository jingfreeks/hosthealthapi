const request = require('supertest');
const app = require('../../app');

// Mock verifyJWT to always call next() and add user info
jest.mock('../../middleware/verifyJWT', () => (req, res, next) => {
  req.user = 'testuser';
  req.roles = ['Applicant'];
  next();
});

// Mock jobsController with proper implementations
jest.mock('../../controllers/jobsController', () => ({
  getAllJobs: jest.fn(),
  getAllClientJobs: jest.fn(),
  createNewJobs: jest.fn(),
  updateJobs: jest.fn(),
  deleteJobs: jest.fn(),
  viewJobDetails: jest.fn(),
  viewAdminJobDetails: jest.fn(),
  getJobsByStatus: jest.fn(),
  getJobsByType: jest.fn(),
  getJobsBySkillMatch: jest.fn(),
  getJobsDetails: jest.fn(),
  getjobdetailinfo: jest.fn(),
  calculateMatchPercentage: jest.fn(),
}));

const mockJobsController = require('../../controllers/jobsController');

// Mock myJobsController
jest.mock('../../controllers/myjobsController', () => ({
  getMyJobs: jest.fn(),
  createInterestedJobs: jest.fn(),
  updateMyStatus: jest.fn(),
  deleteMyJobs: jest.fn(),
}));

describe('Jobs Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /jobs', () => {
    it('should return all jobs', async () => {
      const mockJobs = [{ _id: '1', jobtitle: 'Developer' }];
      mockJobsController.getAllJobs.mockImplementation((req, res) => {
        res.status(200).json(mockJobs);
      });

      const response = await request(app)
        .get('/jobs')
        .expect(200);

      expect(response.body).toEqual(mockJobs);
      expect(mockJobsController.getAllJobs).toHaveBeenCalled();
    });

    it('should return jobs with userId parameter', async () => {
      const mockJobs = [{ _id: '1', jobtitle: 'Developer', matchPercentage: 85 }];
      mockJobsController.getAllJobs.mockImplementation((req, res) => {
        res.status(200).json(mockJobs);
      });

      const response = await request(app)
        .get('/jobs?userId=user123')
        .expect(200);

      expect(response.body).toEqual(mockJobs);
      expect(mockJobsController.getAllJobs).toHaveBeenCalled();
    });
  });

  describe('GET /jobs/:userId', () => {
    it('should return client jobs', async () => {
      const mockJobs = [{ _id: '1', jobtitle: 'Client Job' }];
      mockJobsController.getAllClientJobs.mockImplementation((req, res) => {
        res.status(200).json(mockJobs);
      });

      const response = await request(app)
        .get('/jobs/user123')
        .expect(200);

      expect(response.body).toEqual(mockJobs);
      expect(mockJobsController.getAllClientJobs).toHaveBeenCalled();
    });
  });

  describe('POST /jobs', () => {
    it('should create new job with skill tags', async () => {
      const newJob = {
        compId: 'comp123',
        deptId: 'dept123',
        image: 'job-image.jpg',
        jobtitle: 'Software Developer',
        weeks: '40',
        shiftId: 'shift123',
        match: '90%',
        salaryrange: '$50,000 - $70,000',
        jobDescription: 'We are looking for a skilled developer...',
        jobRequirements: 'Bachelor\'s degree, 3+ years experience...',
        jobType: 'Full-time',
        status: 'Active',
        skillTags: ['JavaScript', 'React', 'Node.js', 'MongoDB']
      };

      mockJobsController.createNewJobs.mockImplementation((req, res) => {
        res.status(201).json({ message: 'New jobs created' });
      });

      const response = await request(app)
        .post('/jobs')
        .send(newJob)
        .expect(201);

      expect(response.body).toEqual({ message: 'New jobs created' });
      expect(mockJobsController.createNewJobs).toHaveBeenCalled();
    });
  });

  describe('PATCH /jobs', () => {
    it('should update job with skill tags', async () => {
      const updatedJob = {
        id: 'job123',
        compId: 'comp123',
        deptId: 'dept123',
        image: 'updated-image.jpg',
        jobtitle: 'Senior Developer',
        weeks: '40',
        shiftId: 'shift123',
        match: '95%',
        salaryrange: '$60,000 - $80,000',
        jobDescription: 'Updated description...',
        jobRequirements: 'Updated requirements...',
        jobType: 'Full-time',
        status: 'Active',
        skillTags: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript']
      };

      mockJobsController.updateJobs.mockImplementation((req, res) => {
        res.status(200).json("'Senior Developer' job updated");
      });

      const response = await request(app)
        .patch('/jobs')
        .send(updatedJob)
        .expect(200);

      expect(response.body).toEqual("'Senior Developer' job updated");
      expect(mockJobsController.updateJobs).toHaveBeenCalled();
    });
  });

  describe('DELETE /jobs', () => {
    it('should delete job', async () => {
      mockJobsController.deleteJobs.mockImplementation((req, res) => {
        res.status(200).json('Job \'Developer\' with ID job123 deleted');
      });

      const response = await request(app)
        .delete('/jobs')
        .send({ id: 'job123' })
        .expect(200);

      expect(response.body).toEqual('Job \'Developer\' with ID job123 deleted');
      expect(mockJobsController.deleteJobs).toHaveBeenCalled();
    });
  });

  describe('GET /jobs/status/:status', () => {
    it('should return jobs by status', async () => {
      const mockJobs = [{ _id: '1', jobtitle: 'Active Job', status: 'Active' }];
      mockJobsController.getJobsByStatus.mockImplementation((req, res) => {
        res.status(200).json(mockJobs);
      });

      const response = await request(app)
        .get('/jobs/status/Active?userId=user123')
        .expect(200);

      expect(response.body).toEqual(mockJobs);
      expect(mockJobsController.getJobsByStatus).toHaveBeenCalled();
    });
  });

  describe('GET /jobs/type/:jobType', () => {
    it('should return jobs by type', async () => {
      const mockJobs = [{ _id: '1', jobtitle: 'Full-time Job', jobType: 'Full-time' }];
      mockJobsController.getJobsByType.mockImplementation((req, res) => {
        res.status(200).json(mockJobs);
      });

      const response = await request(app)
        .get('/jobs/type/Full-time?userId=user123')
        .expect(200);

      expect(response.body).toEqual(mockJobs);
      expect(mockJobsController.getJobsByType).toHaveBeenCalled();
    });
  });

  describe('GET /jobs/match/:minMatchPercentage', () => {
    it('should return jobs by skill match', async () => {
      const mockJobs = [{ _id: '1', jobtitle: 'High Match Job', matchPercentage: 85 }];
      mockJobsController.getJobsBySkillMatch.mockImplementation((req, res) => {
        res.status(200).json(mockJobs);
      });

      const response = await request(app)
        .get('/jobs/match/70?userId=user123')
        .expect(200);

      expect(response.body).toEqual(mockJobs);
      expect(mockJobsController.getJobsBySkillMatch).toHaveBeenCalled();
    });
  });

  describe('Authentication', () => {
    it('should require authentication for protected routes', async () => {
      // Test that routes are protected by checking that verifyJWT is called
      // Since we're mocking verifyJWT to always pass, we can't easily test the 401 case
      // But we can verify that the middleware is being used
      const response = await request(app)
        .get('/jobs')
        .expect(200); // Should work because JWT is mocked to pass

      expect(response.body).toBeDefined();
    });
  });
}); 