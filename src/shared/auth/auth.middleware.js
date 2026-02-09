import { AppError } from '../errors/error.handler.js';
import { validateToken } from './token.validator.js';

const authMiddleware = (req, res, next) => {
  const auth = req.get('Authorization');
  if (!auth) throw new AppError('authentication required', 401);

  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer')
    throw new AppError('invalid token', 401);

  const token = parts[1];

  const decoded = validateToken(token);
  req.user = { id: decoded.id, email: decoded.email };
  return next();
};

export default authMiddleware;
