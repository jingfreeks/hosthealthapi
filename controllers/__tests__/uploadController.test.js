const uploadController = require('../uploadController');
const util = require('util');
const path = require('path');

jest.mock('util');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('uploadController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getUpload', () => {
    it('should return 400 if no files uploaded', async () => {
      const req = { files: undefined };
      const res = mockRes();
      await uploadController.getUpload(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'No file uploaded' });
    });
    it('should return 400 if avatar file is missing', async () => {
      const req = { files: {} };
      const res = mockRes();
      await uploadController.getUpload(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'No file uploaded' });
    });
    it('should upload file and return success', async () => {
      const mvMock = jest.fn().mockResolvedValue();
      const avatar = { md5: 'abc123', name: 'file.png', mv: mvMock };
      const req = { files: { avatar } };
      const res = mockRes();
      util.promisify.mockReturnValue(() => Promise.resolve());
      await uploadController.getUpload(req, res);
      expect(util.promisify).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        url: 'uploads/abc123.png',
        message: 'Upload Success',
      });
    });
  });
}); 