import { formatMongooseValidation } from '../../../src/shared/errors/error.formatter';

describe('formatMongooseValidation', () => {
  it('should format Mongoose validation errors with message property', () => {
    const mongooseError = {
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

    const result = formatMongooseValidation(mongooseError);

    expect(result).toEqual([
      { path: 'email', message: 'email is required' },
      { path: 'password', message: 'password is required' },
    ]);
  });

  it('should format Mongoose validation errors with properties.message', () => {
    const mongooseError = {
      errors: {
        email: {
          path: 'email',
          message: undefined,
          properties: {
            message: 'email validation failed',
          },
        },
      },
    };

    const result = formatMongooseValidation(mongooseError);

    expect(result).toEqual([
      { path: 'email', message: 'email validation failed' },
    ]);
  });

  it('should prioritize message over properties.message', () => {
    const mongooseError = {
      errors: {
        email: {
          path: 'email',
          message: 'primary message',
          properties: {
            message: 'fallback message',
          },
        },
      },
    };

    const result = formatMongooseValidation(mongooseError);

    expect(result).toEqual([{ path: 'email', message: 'primary message' }]);
  });

  it('should handle errors being undefined or null', () => {
    const mongooseError1 = {
      errors: undefined,
    };

    const mongooseError2 = {
      errors: null,
    };

    const result1 = formatMongooseValidation(mongooseError1);
    const result2 = formatMongooseValidation(mongooseError2);

    expect(result1).toEqual([]);
    expect(result2).toEqual([]);
  });

  it('should handle empty errors object', () => {
    const mongooseError = {
      errors: {},
    };

    const result = formatMongooseValidation(mongooseError);

    expect(result).toEqual([]);
  });

  it('should handle error without message or properties', () => {
    const mongooseError = {
      errors: {
        email: {
          path: 'email',
        },
      },
    };

    const result = formatMongooseValidation(mongooseError);

    expect(result).toEqual([{ path: 'email', message: undefined }]);
  });

  it('should handle multiple errors with mixed message sources', () => {
    const mongooseError = {
      errors: {
        email: {
          path: 'email',
          message: 'direct message',
        },
        password: {
          path: 'password',
          properties: {
            message: 'properties message',
          },
        },
        username: {
          path: 'username',
          message: null,
          properties: {
            message: 'fallback message',
          },
        },
      },
    };

    const result = formatMongooseValidation(mongooseError);

    expect(result).toEqual([
      { path: 'email', message: 'direct message' },
      { path: 'password', message: 'properties message' },
      { path: 'username', message: 'fallback message' },
    ]);
  });
});
