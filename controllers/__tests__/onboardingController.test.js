const onboardingController = require('../onboardingController');
jest.mock('../../models/Profile');
const Profile = require('../../models/Profile');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('onboardingController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getProfile', () => {
    it('should return 400 if userId is missing', async () => {
      const req = { params: {} };
      const res = mockRes();
      await onboardingController.getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID required' });
    });
    it('should return 400 if user not found', async () => {
      Profile.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) });
      const req = { params: { userId: 'u1' } };
      const res = mockRes();
      await onboardingController.getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No user found' });
    });
    it('should return profile info', async () => {
      Profile.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ firstname: 'John', lastname: 'Doe', middlename: 'M', picture: 'img' }) }) });
      const req = { params: { userId: 'u1' } };
      const res = mockRes();
      await onboardingController.getProfile(req, res);
      expect(res.json).toHaveBeenCalledWith({ firstName: 'John', lastName: 'Doe', middlename: 'M', picture: 'img' });
    });
  });

  describe('updateProfile', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { params: {}, body: {} };
      const res = mockRes();
      await onboardingController.updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should create new profile if not found', async () => {
      Profile.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) });
      Profile.create.mockResolvedValueOnce({});
      const req = { params: { userId: 'u1' }, body: { firstName: 'John', lastName: 'Doe', middleName: 'M', image: 'img' } };
      const res = mockRes();
      await onboardingController.updateProfile(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'profile updated' });
    });
    it('should update existing profile', async () => {
      Profile.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ _id: 'p1' }) }) });
      Profile.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ save: jest.fn().mockResolvedValue({}) }) });
      const req = { params: { userId: 'u1' }, body: { firstName: 'John', lastName: 'Doe', middleName: 'M', image: 'img' } };
      const res = mockRes();
      await onboardingController.updateProfile(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'profile updated' });
    });
  });
}); 