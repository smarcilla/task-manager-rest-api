import jwt from 'jsonwebtoken';
import { AppError } from '../shared/errors/error.handler';

import { findUserByEmail } from './user.repository';

export const loginHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError('AuthError', 401, [{ message: 'invalid credentials' }]);
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    throw new AppError('AuthError', 401, [{ message: 'invalid credentials' }]);
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

  res.status(200).json({ token });
};
