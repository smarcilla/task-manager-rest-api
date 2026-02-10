import jwt from 'jsonwebtoken';

import { AppError } from '../errors/error.handler.js';

const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('token expired', 401, [{ message: 'token expired' }]);
    }

    if (err.name === 'JsonWebTokenError') {
      throw new AppError('invalid token', 401, [{ message: 'invalid token' }]);
    }

    throw new AppError('unknown token validation error', 500, [
      { message: 'unknown token validation error' },
    ]);
  }
};

export { validateToken };
