import jwt from 'jsonwebtoken';

import { validateToken } from './token.validator.js';
import { AppError } from '../errors/error.handler.js';

jest.mock('jsonwebtoken');

describe('validateToken', () => {
  const mockToken = 'valid.jwt.token';
  const mockDecoded = { userId: '123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should return decoded token when token is valid', () => {
    jwt.verify.mockReturnValue(mockDecoded);

    const result = validateToken(mockToken);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
    expect(result).toEqual(mockDecoded);
  });

  it('should throw AppError with 401 when token is expired', () => {
    const expiredError = new Error('jwt expired');
    expiredError.name = 'TokenExpiredError';
    jwt.verify.mockImplementation(() => {
      throw expiredError;
    });

    try {
      validateToken(mockToken);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('token expired');
      expect(error.statusCode).toBe(401);
      expect(error.details).toEqual([{ message: 'token expired' }]);
    }
  });

  it('should throw AppError with 401 when token is invalid', () => {
    const invalidError = new Error('invalid token');
    invalidError.name = 'JsonWebTokenError';
    jwt.verify.mockImplementation(() => {
      throw invalidError;
    });

    try {
      validateToken(mockToken);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
      expect(error.details).toEqual([{ message: 'invalid token' }]);
    }
  });

  it('should throw AppError with 401 when token is malformed', () => {
    const malformedError = new Error('jwt malformed');
    malformedError.name = 'JsonWebTokenError';
    jwt.verify.mockImplementation(() => {
      throw malformedError;
    });

    try {
      validateToken('invalid-token');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
      expect(error.details).toEqual([{ message: 'invalid token' }]);
    }
  });

  it('should throw AppError with 401 when token signature is invalid', () => {
    const signatureError = new Error('invalid signature');
    signatureError.name = 'JsonWebTokenError';
    jwt.verify.mockImplementation(() => {
      throw signatureError;
    });

    try {
      validateToken(mockToken);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should throw AppError with 500 for unknown JWT errors', () => {
    const unknownError = new Error('Unknown error');
    unknownError.name = 'UnknownError';
    jwt.verify.mockImplementation(() => {
      throw unknownError;
    });

    try {
      validateToken(mockToken);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('unknown token validation error');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual([
        { message: 'unknown token validation error' },
      ]);
    }
  });

  it('should throw AppError with 500 for generic errors without name property', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Generic error');
    });

    try {
      validateToken(mockToken);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('unknown token validation error');
      expect(error.statusCode).toBe(500);
    }
  });

  it('should call jwt.verify with correct JWT_SECRET from environment', () => {
    process.env.JWT_SECRET = 'custom-secret-key';
    jwt.verify.mockReturnValue(mockDecoded);

    validateToken(mockToken);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'custom-secret-key');
  });

  it('should handle empty token string', () => {
    const emptyTokenError = new Error('jwt must be provided');
    emptyTokenError.name = 'JsonWebTokenError';
    jwt.verify.mockImplementation(() => {
      throw emptyTokenError;
    });

    try {
      validateToken('');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should handle null token', () => {
    const nullTokenError = new Error('jwt must be provided');
    nullTokenError.name = 'JsonWebTokenError';
    jwt.verify.mockImplementation(() => {
      throw nullTokenError;
    });

    try {
      validateToken(null);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should handle undefined token', () => {
    const undefinedTokenError = new Error('jwt must be provided');
    undefinedTokenError.name = 'JsonWebTokenError';
    jwt.verify.mockImplementation(() => {
      throw undefinedTokenError;
    });

    try {
      validateToken(undefined);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('invalid token');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should return decoded token with all expected properties', () => {
    const fullDecodedToken = {
      userId: '123',
      email: 'test@example.com',
      iat: 1234567890,
      exp: 1234567899,
    };
    jwt.verify.mockReturnValue(fullDecodedToken);

    const result = validateToken(mockToken);

    expect(result).toEqual(fullDecodedToken);
    expect(result.userId).toBe('123');
    expect(result.email).toBe('test@example.com');
    expect(result.iat).toBe(1234567890);
    expect(result.exp).toBe(1234567899);
  });
});
