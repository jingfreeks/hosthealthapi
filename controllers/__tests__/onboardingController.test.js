const onboardingController = require('../onboardingController');
const Onboarding = require('../../models/Onboarding');
const User = require('../../models/Users');

jest.mock('../../models/Onboarding');
jest.mock('../../models/Users');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Helper to mock chained mongoose query
function mockMongooseChain(returnValue) {
  const chain = {};
  chain.exec = jest.fn().mockResolvedValue(returnValue);
  chain.lean = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.skip = jest.fn().mockReturnValue(chain);
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.populate = jest.fn().mockReturnValue(chain);
  return chain;
}

describe('Onboarding Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOnboarding', () => {
    it('should return all onboarding records with pagination', async () => {
      const mockRecords = [
        {
          _id: '1',
          userId: { _id: 'user1', username: 'testuser1', email: 'test1@test.com' },
          status: 'pending',
          step: 1
        }
      ];
      
      Onboarding.find.mockReturnValue(mockMongooseChain(mockRecords));
      
      Onboarding.countDocuments.mockResolvedValue(1);
      
      const req = { query: { limit: 10, page: 1 } };
      const res = mockRes();
      
      await onboardingController.getAllOnboarding(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        records: mockRecords,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 1,
          recordsPerPage: 10
        }
      });
    });

    it('should return 400 when no records found', async () => {
      Onboarding.find.mockReturnValue(mockMongooseChain([]));
      
      const req = { query: {} };
      const res = mockRes();
      
      await onboardingController.getAllOnboarding(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No onboarding records found" });
    });
  });

  describe('getOnboardingById', () => {
    it('should return onboarding record by ID', async () => {
      const mockRecord = {
        _id: '1',
        userId: { _id: 'user1', username: 'testuser1' },
        status: 'pending'
      };
      
      Onboarding.findById.mockReturnValue(mockMongooseChain(mockRecord));
      
      const req = { params: { id: '1' } };
      const res = mockRes();
      
      await onboardingController.getOnboardingById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecord);
    });

    it('should return 400 when ID not provided', async () => {
      const req = { params: {} };
      const res = mockRes();
      
      await onboardingController.getOnboardingById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Onboarding ID required" });
    });

    it('should return 400 when record not found', async () => {
      Onboarding.findById.mockReturnValue(mockMongooseChain(null));
      
      const req = { params: { id: '1' } };
      const res = mockRes();
      
      await onboardingController.getOnboardingById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Onboarding record not found" });
    });
  });

  describe('createOnboarding', () => {
    it('should create new onboarding record', async () => {
      const mockUser = { _id: 'user1', username: 'testuser' };
      const mockOnboarding = {
        _id: '1',
        userId: 'user1',
        status: 'pending',
        step: 1
      };
      
      User.findById.mockReturnValue(mockMongooseChain(mockUser));
      
      Onboarding.findOne.mockReturnValue(mockMongooseChain(null));
      
      Onboarding.create.mockResolvedValue(mockOnboarding);
      
      const req = {
        body: {
          userId: 'user1',
          personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: new Date(),
            gender: 'male',
            phoneNumber: '1234567890',
            email: 'john@test.com',
            address: {
              street: '123 Main St',
              city: 'Test City',
              state: 'Test State',
              zipCode: '12345'
            }
          }
        }
      };
      const res = mockRes();
      
      await onboardingController.createOnboarding(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Onboarding record created successfully",
        onboarding: mockOnboarding
      });
    });

    it('should return 400 when required fields missing', async () => {
      const req = { body: { userId: 'user1' } };
      const res = mockRes();
      
      await onboardingController.createOnboarding(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User ID and personal information are required" });
    });

    it('should return 400 when user not found', async () => {
      User.findById.mockReturnValue(mockMongooseChain(null));
      
      const req = {
        body: {
          userId: 'user1',
          personalInfo: { firstName: 'John', lastName: 'Doe' }
        }
      };
      const res = mockRes();
      
      await onboardingController.createOnboarding(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it('should return 409 when onboarding record already exists', async () => {
      const mockUser = { _id: 'user1' };
      const mockExisting = { _id: 'existing1' };
      
      User.findById.mockReturnValue(mockMongooseChain(mockUser));
      
      Onboarding.findOne.mockReturnValue(mockMongooseChain(mockExisting));
      
      const req = {
        body: {
          userId: 'user1',
          personalInfo: { firstName: 'John', lastName: 'Doe' }
        }
      };
      const res = mockRes();
      
      await onboardingController.createOnboarding(req, res);
      
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Onboarding record already exists for this user" });
    });
  });

  describe('updateOnboarding', () => {
    it('should update onboarding record', async () => {
      const mockOnboarding = {
        _id: '1',
        status: 'pending',
        save: jest.fn().mockResolvedValue({
          _id: '1',
          status: 'in_progress'
        })
      };
      
      Onboarding.findById.mockReturnValue(mockMongooseChain(mockOnboarding));
      
      const req = {
        params: { id: '1' },
        body: { status: 'in_progress' }
      };
      const res = mockRes();
      
      await onboardingController.updateOnboarding(req, res);
      
      expect(mockOnboarding.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Onboarding record updated successfully",
        onboarding: { _id: '1', status: 'in_progress' }
      });
    });

    it('should return 400 when ID not provided', async () => {
      const req = { params: {}, body: {} };
      const res = mockRes();
      
      await onboardingController.updateOnboarding(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Onboarding ID required" });
    });

    it('should return 400 when record not found', async () => {
      Onboarding.findById.mockReturnValue(mockMongooseChain(null));
      
      const req = { params: { id: '1' }, body: {} };
      const res = mockRes();
      
      await onboardingController.updateOnboarding(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Onboarding record not found" });
    });
  });

  describe('updateOnboardingStep', () => {
    it('should update onboarding step', async () => {
      const mockOnboarding = {
        _id: '1',
        step: 1,
        status: 'pending',
        completedSteps: [],
        save: jest.fn().mockResolvedValue({
          _id: '1',
          step: 2,
          status: 'in_progress',
          completedSteps: [{ stepNumber: 2, stepName: 'Personal Info' }]
        })
      };
      
      Onboarding.findById.mockReturnValue(mockMongooseChain(mockOnboarding));
      
      const req = {
        params: { id: '1' },
        body: { step: 2, stepName: 'Personal Info' }
      };
      const res = mockRes();
      
      await onboardingController.updateOnboardingStep(req, res);
      
      expect(mockOnboarding.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Onboarding step updated successfully",
        onboarding: {
          _id: '1',
          step: 2,
          status: 'in_progress',
          completedSteps: [{ stepNumber: 2, stepName: 'Personal Info' }]
        }
      });
    });

    it('should return 400 when required fields missing', async () => {
      const req = { params: { id: '1' }, body: { step: 2 } };
      const res = mockRes();
      
      await onboardingController.updateOnboardingStep(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Onboarding ID, step number, and step name are required" });
    });
  });

  describe('updateOnboardingStatus', () => {
    it('should update onboarding status', async () => {
      const mockOnboarding = {
        _id: '1',
        status: 'pending',
        save: jest.fn().mockResolvedValue({
          _id: '1',
          status: 'completed',
          adminNotes: 'Approved'
        })
      };
      
      Onboarding.findById.mockReturnValue(mockMongooseChain(mockOnboarding));
      
      const req = {
        params: { id: '1' },
        body: { status: 'completed', adminNotes: 'Approved' }
      };
      const res = mockRes();
      
      await onboardingController.updateOnboardingStatus(req, res);
      
      expect(mockOnboarding.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Onboarding status updated successfully",
        onboarding: {
          _id: '1',
          status: 'completed',
          adminNotes: 'Approved'
        }
      });
    });

    it('should return 400 when invalid status provided', async () => {
      const req = {
        params: { id: '1' },
        body: { status: 'invalid_status' }
      };
      const res = mockRes();
      
      await onboardingController.updateOnboardingStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid status. Must be one of: pending, in_progress, completed, rejected"
      });
    });
  });

  describe('deleteOnboarding', () => {
    it('should delete onboarding record', async () => {
      const mockOnboarding = {
        _id: '1',
        userId: 'user1'
      };
      
      Onboarding.findById.mockReturnValue(mockMongooseChain(mockOnboarding));
      
      Onboarding.findByIdAndDelete.mockResolvedValue(mockOnboarding);
      
      const req = { params: { id: '1' } };
      const res = mockRes();
      
      await onboardingController.deleteOnboarding(req, res);
      
      expect(Onboarding.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Onboarding record for user user1 deleted successfully"
      });
    });

    it('should return 400 when ID not provided', async () => {
      const req = { params: {} };
      const res = mockRes();
      
      await onboardingController.deleteOnboarding(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Onboarding ID required" });
    });

    it('should return 400 when record not found', async () => {
      Onboarding.findById.mockReturnValue(mockMongooseChain(null));
      
      const req = { params: { id: '1' } };
      const res = mockRes();
      
      await onboardingController.deleteOnboarding(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Onboarding record not found" });
    });
  });

  describe('getOnboardingStats', () => {
    it('should return onboarding statistics', async () => {
      const mockStats = [
        { _id: 'pending', count: 5 },
        { _id: 'in_progress', count: 3 },
        { _id: 'completed', count: 10 }
      ];
      
      const mockStepStats = [
        { _id: 1, count: 3 },
        { _id: 2, count: 2 },
        { _id: 3, count: 1 }
      ];
      
      Onboarding.aggregate.mockResolvedValueOnce(mockStats);
      Onboarding.aggregate.mockResolvedValueOnce(mockStepStats);
      Onboarding.countDocuments.mockResolvedValueOnce(18);
      Onboarding.countDocuments.mockResolvedValueOnce(10);
      Onboarding.countDocuments.mockResolvedValueOnce(3);
      Onboarding.countDocuments.mockResolvedValueOnce(5);
      
      const req = {};
      const res = mockRes();
      
      await onboardingController.getOnboardingStats(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        totalRecords: 18,
        statusBreakdown: {
          completed: 10,
          inProgress: 3,
          pending: 5
        },
        stepBreakdown: mockStepStats,
        completionRate: 56
      });
    });
  });

  describe('searchOnboarding', () => {
    it('should search onboarding records', async () => {
      const mockResults = [
        {
          _id: '1',
          personalInfo: { firstName: 'John', lastName: 'Doe' }
        }
      ];
      
      Onboarding.find.mockReturnValue(mockMongooseChain(mockResults));
      
      Onboarding.countDocuments.mockResolvedValue(1);
      
      const req = { query: { q: 'John', limit: 10, page: 1 } };
      const res = mockRes();
      
      await onboardingController.searchOnboarding(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        results: mockResults,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 1,
          recordsPerPage: 10
        }
      });
    });
  });

  describe('Legacy functions', () => {
    describe('getProfile', () => {
      it('should return profile info from onboarding record', async () => {
        const mockOnboarding = {
          personalInfo: {
            firstName: 'John',
            lastName: 'Doe'
          }
        };
        
        Onboarding.findOne.mockReturnValue(mockMongooseChain(mockOnboarding));
        
        const req = { params: { userId: 'user1' } };
        const res = mockRes();
        
        await onboardingController.getProfile(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockOnboarding.personalInfo);
      });
    });

    describe('updateProfile', () => {
      it('should create new onboarding record if none exists', async () => {
        Onboarding.findOne.mockReturnValue(mockMongooseChain(null));
        
        Onboarding.create.mockResolvedValue({
          _id: '1',
          userId: 'user1'
        });
        
        const req = {
          params: { userId: 'user1' },
          body: {
            firstName: 'John',
            lastName: 'Doe',
            middleName: 'M',
            image: 'profile.jpg'
          }
        };
        const res = mockRes();
        
        await onboardingController.updateProfile(req, res);
        
        expect(Onboarding.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Profile updated successfully" });
      });

      it('should update existing onboarding record', async () => {
        const mockOnboarding = {
          _id: '1',
          personalInfo: {},
          save: jest.fn().mockResolvedValue({ _id: '1' })
        };
        
        Onboarding.findOne.mockReturnValue(mockMongooseChain(mockOnboarding));
        
        const req = {
          params: { userId: 'user1' },
          body: {
            firstName: 'John',
            lastName: 'Doe',
            middleName: 'M',
            image: 'profile.jpg'
          }
        };
        const res = mockRes();
        
        await onboardingController.updateProfile(req, res);
        
        expect(mockOnboarding.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Profile updated successfully" });
      });
    });
  });
}); 