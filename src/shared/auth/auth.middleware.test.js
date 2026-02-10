import authMiddleware from './auth.middleware.js';
import { AppError } from '../errors/error.handler.js';
import { validateToken } from './token.validator.js';

jest.mock('./token.validator.js');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      get: jest.fn(),
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should authenticate successfully with valid Bearer token', () => {
    const mockDecoded = { id: '123', email: 'test@example.com' };
    req.get.mockReturnValue('Bearer valid.token.here');
    validateToken.mockReturnValue(mockDecoded);

    authMiddleware(req, res, next);

    expect(req.get).toHaveBeenCalledWith('Authorization');
    expect(validateToken).toHaveBeenCalledWith('valid.token.here');
    expect(req.user).toEqual({ id: '123', email: 'test@example.com' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should set req.user with only id and email from decoded token', () => {
    const mockDecoded = {
      id: '456',
      email: 'user@example.com',
      iat: 1234567890,
      exp: 1234567899,
    };
    req.get.mockReturnValue('Bearer some.token');
    validateToken.mockReturnValue(mockDecoded);

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ id: '456', email: 'user@example.com' });
    expect(req.user).not.toHaveProperty('iat');
    expect(req.user).not.toHaveProperty('exp');
  });

  it('should throw AppError when Authorization header is missing', () => {
    req.get.mockReturnValue(undefined);

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('authentication required');
      expect(error.statusCode).toBe(401);
    }

    expect(next).not.toHaveBeenCalled();
  });

  it('should throw AppError when Authorization header is null', () => {
    req.get.mockReturnValue(null);

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('authentication required');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should throw AppError when Authorization header is empty string', () => {
    req.get.mockReturnValue('');

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('authentication required');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should throw AppError when Authorization header does not start with Bearer', () => {
    req.get.mockReturnValue('Basic some-credentials');

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
    }

    expect(next).not.toHaveBeenCalled();
  });

  it('should throw AppError when Authorization header has only one part', () => {
    req.get.mockReturnValue('BearerTokenWithoutSpace');

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should throw AppError when Authorization header has more than two parts', () => {
    req.get.mockReturnValue('Bearer token extra-part');

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should throw AppError when first part is not Bearer', () => {
    req.get.mockReturnValue('Token some.token.here');

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should throw AppError when Bearer is lowercase', () => {
    req.get.mockReturnValue('bearer some.token.here');

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should pass empty token to validateToken when Authorization is "Bearer "', () => {
    const tokenError = new AppError('invalid token', 401);
    req.get.mockReturnValue('Bearer ');
    validateToken.mockImplementation(() => {
      throw tokenError;
    });

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
    }

    expect(validateToken).toHaveBeenCalledWith('');
    expect(next).not.toHaveBeenCalled();
  });

  it('should propagate error from validateToken when token is invalid', () => {
    const tokenError = new AppError('invalid token', 401);
    req.get.mockReturnValue('Bearer invalid.token');
    validateToken.mockImplementation(() => {
      throw tokenError;
    });

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBe(tokenError);
    }

    expect(next).not.toHaveBeenCalled();
  });

  it('should propagate error from validateToken when token is expired', () => {
    const expiredError = new AppError('token expired', 401);
    req.get.mockReturnValue('Bearer expired.token');
    validateToken.mockImplementation(() => {
      throw expiredError;
    });

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBe(expiredError);
    }

    expect(next).not.toHaveBeenCalled();
  });

  it('should handle Authorization header with extra whitespace', () => {
    req.get.mockReturnValue('Bearer  token.with.extra.space');

    try {
      authMiddleware(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should extract token correctly from valid Bearer format', () => {
    const mockDecoded = { id: '789', email: 'extract@example.com' };
    req.get.mockReturnValue('Bearer my.jwt.token');
    validateToken.mockReturnValue(mockDecoded);

    authMiddleware(req, res, next);

    expect(validateToken).toHaveBeenCalledWith('my.jwt.token');
  });

  it('should call next() only once on success', () => {
    const mockDecoded = { id: '123', email: 'test@example.com' };
    req.get.mockReturnValue('Bearer valid.token');
    validateToken.mockReturnValue(mockDecoded);

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should return the result of next()', () => {
    const mockDecoded = { id: '123', email: 'test@example.com' };
    const nextReturnValue = 'next-result';
    req.get.mockReturnValue('Bearer valid.token');
    validateToken.mockReturnValue(mockDecoded);
    next.mockReturnValue(nextReturnValue);

    const result = authMiddleware(req, res, next);

    expect(result).toBe(nextReturnValue);
  });

  it('should handle long token strings', () => {
    const longToken = 'a'.repeat(500);
    const mockDecoded = { id: '123', email: 'test@example.com' };
    req.get.mockReturnValue(`Bearer ${longToken}`);
    validateToken.mockReturnValue(mockDecoded);

    authMiddleware(req, res, next);

    expect(validateToken).toHaveBeenCalledWith(longToken);
    expect(next).toHaveBeenCalled();
  });

  it('should handle decoded token with minimal properties', () => {
    const mockDecoded = { id: '1', email: 'a@b.c' };
    req.get.mockReturnValue('Bearer token');
    validateToken.mockReturnValue(mockDecoded);

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ id: '1', email: 'a@b.c' });
  });
});
