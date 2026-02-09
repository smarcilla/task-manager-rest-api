import jwt from 'jsonwebtoken';

import { generateToken } from '../../../src/shared/auth/token.generator';

export const EXPIRED_TOKEN = jwt.sign(
  { id: 'test-id', email: 'test@example.com' },
  process.env.JWT_SECRET,
  { expiresIn: -60 } // 60 segundos en el pasado
);
export const VALID_TOKEN = generateToken({
  id: 'test-id',
  email: 'test@example.com',
});

export const INVALID_TOKEN = 'invalid_token';
