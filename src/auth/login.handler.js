import { AppError } from '../shared/errors/error.handler';

import { findUserByEmail } from './user.repository';

import { generateToken } from '../shared/auth/token.generator';

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

  const token = generateToken({ id: user.id, email });

  res.status(200).json({ token });
};
