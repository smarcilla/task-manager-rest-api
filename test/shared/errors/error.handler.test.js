import {
  AppError,
  normalizeError,
  errorHandler,
} from '../../../src/shared/errors/error.handler.js';

describe('AppError', () => {
  it('should create an AppError with message and statusCode', () => {
    const error = new AppError('Not found', 404);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.details).toBeNull();
  });

  it('should create an AppError with details', () => {
    const details = [{ field: 'email', message: 'invalid' }];
    const error = new AppError('Validation failed', 400, details);

    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual(details);
  });
});

describe('normalizeError', () => {
  describe('AppError handling', () => {
    it('should normalize AppError without details', () => {
      const appError = new AppError('Resource not found', 404);

      const result = normalizeError(appError);

      expect(result).toEqual({
        statusCode: 404,
        message: 'Resource not found',
        details: null,
      });
    });

    it('should normalize AppError with details', () => {
      const details = [{ field: 'email', message: 'required' }];
      const appError = new AppError('Validation error', 400, details);

      const result = normalizeError(appError);

      expect(result).toEqual({
        statusCode: 400,
        message: 'Validation error',
        details: details,
      });
    });
  });

  describe('Mongoose ValidationError handling', () => {
    it('should normalize Mongoose ValidationError', () => {
      const mongooseError = {
        name: 'ValidationError',
        errors: {
          email: {
            path: 'email',
            message: 'email is required',
          },
          password: {
            path: 'password',
            message: 'password is required',
          },
        },
      };

      const result = normalizeError(mongooseError);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Validation error');
      expect(result.details).toEqual([
        { path: 'email', message: 'email is required' },
        { path: 'password', message: 'password is required' },
      ]);
    });

    it('should normalize Mongoose ValidationError with properties.message', () => {
      const mongooseError = {
        name: 'ValidationError',
        errors: {
          email: {
            path: 'email',
            properties: {
              message: 'email validation failed',
            },
          },
        },
      };

      const result = normalizeError(mongooseError);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Validation error');
      expect(result.details).toEqual([
        { path: 'email', message: 'email validation failed' },
      ]);
    });
  });

  describe('MongoServerError - Duplicate key handling', () => {
    it('should normalize duplicate key error with code 11000', () => {
      const duplicateError = {
        code: 11000,
        keyValue: { email: 'test@example.com' },
        message: 'E11000 duplicate key error',
      };

      const result = normalizeError(duplicateError);

      expect(result.statusCode).toBe(409);
      expect(result.message).toBe('Duplicate key error');
      expect(result.details).toEqual([
        { field: 'email', message: 'email already exists' },
      ]);
    });

    it('should normalize duplicate key error with multiple keys', () => {
      const duplicateError = {
        code: 11000,
        keyValue: { email: 'test@example.com', username: 'testuser' },
        message: 'E11000 duplicate key error',
      };

      const result = normalizeError(duplicateError);

      expect(result.statusCode).toBe(409);
      expect(result.message).toBe('Duplicate key error');
      expect(result.details).toHaveLength(2);
      expect(result.details).toContainEqual({
        field: 'email',
        message: 'email already exists',
      });
      expect(result.details).toContainEqual({
        field: 'username',
        message: 'username already exists',
      });
    });

    it('should normalize MongoServerError by name', () => {
      const mongoError = {
        name: 'MongoServerError',
        keyValue: { email: 'test@example.com' },
        message: 'Duplicate key error',
      };

      const result = normalizeError(mongoError);

      expect(result.statusCode).toBe(409);
      expect(result.message).toBe('Duplicate key error');
      expect(result.details).toEqual([
        { field: 'email', message: 'email already exists' },
      ]);
    });

    it('should handle duplicate key error without keyValue', () => {
      const duplicateError = {
        code: 11000,
        message: 'E11000 duplicate key error collection',
      };

      const result = normalizeError(duplicateError);

      expect(result.statusCode).toBe(409);
      expect(result.message).toBe('Duplicate key error');
      expect(result.details).toEqual([
        { message: 'E11000 duplicate key error collection' },
      ]);
    });

    it('should handle MongoServerError with empty keyValue', () => {
      const mongoError = {
        name: 'MongoServerError',
        keyValue: {},
        message: 'Some mongo error',
      };

      const result = normalizeError(mongoError);

      expect(result.statusCode).toBe(409);
      expect(result.message).toBe('Duplicate key error');
      expect(result.details).toEqual([{ message: 'Some mongo error' }]);
    });
  });

  describe('CastError handling', () => {
    it('should normalize Mongoose CastError', () => {
      const castError = {
        name: 'CastError',
        message: 'Cast to ObjectId failed for value "invalid-id"',
      };

      const result = normalizeError(castError);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Invalid identifier');
      expect(result.details).toEqual([
        { message: 'Cast to ObjectId failed for value "invalid-id"' },
      ]);
    });
  });

  describe('Fallback error handling', () => {
    it('should normalize generic error with statusCode', () => {
      const genericError = {
        statusCode: 403,
        message: 'Forbidden',
      };

      const result = normalizeError(genericError);

      expect(result.statusCode).toBe(403);
      expect(result.message).toBe('Forbidden');
      expect(result.details).toBeNull();
    });

    it('should normalize generic error with details', () => {
      const genericError = {
        statusCode: 422,
        message: 'Unprocessable Entity',
        details: [{ field: 'custom', message: 'error' }],
      };

      const result = normalizeError(genericError);

      expect(result.statusCode).toBe(422);
      expect(result.message).toBe('Unprocessable Entity');
      expect(result.details).toEqual([{ field: 'custom', message: 'error' }]);
    });

    it('should use default statusCode 500 if not provided', () => {
      const genericError = {
        message: 'Something went wrong',
      };

      const result = normalizeError(genericError);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Something went wrong');
      expect(result.details).toBeNull();
    });

    it('should use default message if not provided', () => {
      const genericError = {};

      const result = normalizeError(genericError);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Internal Server Error');
      expect(result.details).toBeNull();
    });

    it('should handle Error instance', () => {
      const error = new Error('Standard error');

      const result = normalizeError(error);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Standard error');
      expect(result.details).toBeNull();
    });
  });
});

describe('errorHandler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should handle AppError and send correct response', () => {
    const error = new AppError('Not found', 404);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Not found',
      errors: null,
    });
  });

  it('should handle AppError with details', () => {
    const details = [{ field: 'email', message: 'invalid' }];
    const error = new AppError('Validation error', 400, details);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      message: 'Validation error',
      errors: details,
    });
  });

  it('should handle Mongoose ValidationError', () => {
    const mongooseError = {
      name: 'ValidationError',
      errors: {
        email: {
          path: 'email',
          message: 'email is required',
        },
      },
    };

    errorHandler(mongooseError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      message: 'Validation error',
      errors: [{ path: 'email', message: 'email is required' }],
    });
  });

  it('should handle duplicate key error', () => {
    const duplicateError = {
      code: 11000,
      keyValue: { email: 'test@example.com' },
      message: 'E11000 duplicate key error',
    };

    errorHandler(duplicateError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      status: 409,
      message: 'Duplicate key error',
      errors: [{ field: 'email', message: 'email already exists' }],
    });
  });

  it('should handle MongoServerError', () => {
    const mongoError = {
      name: 'MongoServerError',
      keyValue: { username: 'testuser' },
      message: 'Mongo error',
    };

    errorHandler(mongoError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      status: 409,
      message: 'Duplicate key error',
      errors: [{ field: 'username', message: 'username already exists' }],
    });
  });

  it('should handle CastError', () => {
    const castError = {
      name: 'CastError',
      message: 'Cast to ObjectId failed',
    };

    errorHandler(castError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      message: 'Invalid identifier',
      errors: [{ message: 'Cast to ObjectId failed' }],
    });
  });

  it('should handle generic error with 500 status', () => {
    const genericError = new Error('Unexpected error');

    errorHandler(genericError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      message: 'Unexpected error',
      errors: null,
    });
  });

  it('should handle error with custom statusCode', () => {
    const customError = {
      statusCode: 503,
      message: 'Service Unavailable',
    };

    errorHandler(customError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: 503,
      message: 'Service Unavailable',
      errors: null,
    });
  });

  it('should not call next (middleware signature requirement)', () => {
    const error = new AppError('Test', 400);

    errorHandler(error, req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});
