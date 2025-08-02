const authController = require('../authController');

// Mock req, res objects
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController', () => {
  describe('refresh', () => {
    it('should return 401 if no jwt cookie', () => {
      const req = { cookies: {} };
      const res = mockRes();
      authController.refresh(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should send 204 if no jwt cookie', () => {
      const req = { cookies: {} };
      const res = mockRes();
      authController.logout(req, res);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
    it('should clear cookie and return message if jwt cookie exists', () => {
      const req = { cookies: { jwt: 'token' } };
      const res = mockRes();
      authController.logout(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith('jwt', { httpOnly: true, sameSite: 'None', secure: true });
      expect(res.json).toHaveBeenCalledWith({ message: 'Cookie cleared' });
    });
  });
}); 