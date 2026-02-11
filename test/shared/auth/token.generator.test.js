import jwt from 'jsonwebtoken';

import { generateToken } from '../../../src/shared/auth/token.generator.js';

jest.mock('jsonwebtoken');

describe('generateToken', () => {
  const mockToken = 'generated.jwt.token';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '24h';
    jwt.sign.mockReturnValue(mockToken);
  });

  afterEach(() => {
    delete process.env.JWT_EXPIRES_IN;
  });

  it('should generate a token with valid user data', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
    };

    const token = generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '123', email: 'test@example.com' },
      'test-secret',
      { expiresIn: '24h' }
    );
    expect(token).toBe(mockToken);
  });

  it('should use user.exp when provided', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      exp: '2h',
    };

    const token = generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '123', email: 'test@example.com' },
      'test-secret',
      { expiresIn: '2h' }
    );
    expect(token).toBe(mockToken);
  });

  it('should use JWT_EXPIRES_IN from environment when user.exp is not provided', () => {
    const user = {
      id: '456',
      email: 'user@example.com',
    };

    const token = generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '456', email: 'user@example.com' },
      'test-secret',
      { expiresIn: '24h' }
    );
    expect(token).toBe(mockToken);
  });

  it('should default to 1h when neither user.exp nor JWT_EXPIRES_IN are provided', () => {
    delete process.env.JWT_EXPIRES_IN;

    const user = {
      id: '789',
      email: 'default@example.com',
    };

    const token = generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '789', email: 'default@example.com' },
      'test-secret',
      { expiresIn: '1h' }
    );
    expect(token).toBe(mockToken);
  });

  it('should prioritize user.exp over JWT_EXPIRES_IN', () => {
    process.env.JWT_EXPIRES_IN = '7d';

    const user = {
      id: '123',
      email: 'test@example.com',
      exp: '30m',
    };

    generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '123', email: 'test@example.com' },
      'test-secret',
      { expiresIn: '30m' }
    );
  });

  it('should use correct JWT_SECRET from environment', () => {
    process.env.JWT_SECRET = 'custom-secret-key';

    const user = {
      id: '123',
      email: 'test@example.com',
    };

    generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.any(Object),
      'custom-secret-key',
      expect.any(Object)
    );
  });

  it('should handle user with only required fields', () => {
    const user = {
      id: 'user-id',
      email: 'minimal@example.com',
    };

    const token = generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user-id', email: 'minimal@example.com' },
      'test-secret',
      { expiresIn: '24h' }
    );
    expect(token).toBe(mockToken);
  });

  it('should not include extra user properties in payload', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      role: 'admin',
    };

    generateToken(user);

    const payload = jwt.sign.mock.calls[0][0];
    expect(payload).toEqual({
      id: '123',
      email: 'test@example.com',
    });
    expect(payload).not.toHaveProperty('password');
    expect(payload).not.toHaveProperty('createdAt');
    expect(payload).not.toHaveProperty('role');
  });

  it('should handle numeric expiration time from user', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      exp: 3600,
    };

    const token = generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '123', email: 'test@example.com' },
      'test-secret',
      { expiresIn: 3600 }
    );
    expect(token).toBe(mockToken);
  });

  it('should handle long expiration periods', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      exp: '30d',
    };

    generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '123', email: 'test@example.com' },
      'test-secret',
      { expiresIn: '30d' }
    );
  });

  it('should handle short expiration periods', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      exp: '15m',
    };

    generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '123', email: 'test@example.com' },
      'test-secret',
      { expiresIn: '15m' }
    );
  });

  it('should handle user.exp as falsy value (empty string)', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      exp: '',
    };

    generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '123', email: 'test@example.com' },
      'test-secret',
      { expiresIn: '24h' }
    );
  });

  it('should handle user.exp as null', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      exp: null,
    };

    generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '123', email: 'test@example.com' },
      'test-secret',
      { expiresIn: '24h' }
    );
  });

  it('should handle user.exp as undefined', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      exp: undefined,
    };

    generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '123', email: 'test@example.com' },
      'test-secret',
      { expiresIn: '24h' }
    );
  });

  it('should handle user.exp as 0 (falsy but valid)', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      exp: 0,
    };

    generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '123', email: 'test@example.com' },
      'test-secret',
      { expiresIn: '24h' }
    );
  });

  it('should return the token generated by jwt.sign', () => {
    const customToken = 'custom.token.value';
    jwt.sign.mockReturnValue(customToken);

    const user = {
      id: '123',
      email: 'test@example.com',
    };

    const token = generateToken(user);

    expect(token).toBe(customToken);
  });
});
