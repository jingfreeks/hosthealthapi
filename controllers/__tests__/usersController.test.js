const usersController = require('../usersController');
jest.mock('../../models/Users');
jest.mock('../../models/Notes');
jest.mock('bcrypt');
const User = require('../../models/Users');
const Note = require('../../models/Notes');
const bcrypt = require('bcrypt');

jest.mock('../../config/firebase', () => ({
  getAuth: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));
const { createUserWithEmailAndPassword } = require('../../config/firebase');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('usersController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllUsers', () => {
    it('should return 400 if no users found', async () => {
      User.find.mockReturnValueOnce({ select: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce([]) }) }) });
      const req = {};
      const res = mockRes();
      await usersController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No users Found', error: true });
    });
    it('should return users', async () => {
      User.find.mockReturnValueOnce({ select: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce([{ username: 'user1' }]) }) }) });
      const req = {};
      const res = mockRes();
      await usersController.getAllUsers(req, res);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ username: 'user1' })
      ]);
    });
  });

  describe('createFNewUser', () => {
    it('should return 409 if duplicate email', async () => {
      User.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ email: 'test@example.com' }) }) });
      const req = { body: { email: 'test@example.com', password: 'pass' } };
      const res = mockRes();
      await usersController.createFNewUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate Email address' });
    });
    it('should create new firebase user', async () => {
      User.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) });
      bcrypt.hash.mockResolvedValueOnce('hashed');
      User.create.mockResolvedValueOnce({});
      const req = { body: { email: 'test@example.com', password: 'pass' } };
      const res = mockRes();
      await usersController.createFNewUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'New email test@example.com created' });
    });
  });

  describe('createNewUser', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await usersController.createNewUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required', error: true });
    });
    it('should return 409 if duplicate username', async () => {
      User.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ username: 'user1' }) }) });
      const req = { body: { username: 'user1', password: 'pass' } };
      const res = mockRes();
      await usersController.createNewUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate Username' });
    });
    it('should create new user', async () => {
      User.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) });
      bcrypt.hash.mockResolvedValueOnce('hashed');
      User.create.mockResolvedValueOnce({});
      const req = { body: { username: 'user1', password: 'pass' } };
      const res = mockRes();
      await usersController.createNewUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'New user user1 created' });
    });
  });

  describe('updateUser', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await usersController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 400 if user not found', async () => {
      User.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1', username: 'user1', roles: ['Admin'], active: true } };
      const res = mockRes();
      await usersController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
    it('should return 409 if duplicate username', async () => {
      User.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', username: 'user1', save: jest.fn().mockResolvedValue({ username: 'user1' }) }) });
      User.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ _id: '2', username: 'user1' }) }) })
      });
      const req = { body: { id: '1', username: 'user1', roles: ['Admin'], active: true } };
      const res = mockRes();
      await usersController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate Username' });
    });
    it('should update user', async () => {
      User.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', username: 'user1', save: jest.fn().mockResolvedValue({ username: 'user1' }) }) });
      User.findOne.mockReturnValueOnce({
        collation: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) })
      });
      const req = { body: { id: '1', username: 'user1', roles: ['Admin'], active: true } };
      const res = mockRes();
      await usersController.updateUser(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'user1 updated' });
    });
  });

  describe('deleteUser', () => {
    it('should return 400 if id is missing', async () => {
      const req = { body: {} };
      const res = mockRes();
      await usersController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User Id required' });
    });
    it('should return 400 if user has notes', async () => {
      Note.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce({ user: '1' }) }) });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await usersController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User has assign notes' });
    });
    it('should return 400 if user not found', async () => {
      Note.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) });
      User.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await usersController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User Not found' });
    });
    it('should delete user', async () => {
      Note.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValueOnce(null) }) });
      User.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ username: 'user1', _id: '1', deleteOne: jest.fn().mockResolvedValue({}) }) });
      const req = { body: { id: '1' } };
      const res = mockRes();
      await usersController.deleteUser(req, res);
      expect(res.json).toHaveBeenCalledWith('Username user1 with ID 1 deleted');
    });
  });
}); 