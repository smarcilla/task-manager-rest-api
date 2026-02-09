import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: user.exp || process.env.JWT_EXPIRES_IN || '1h',
  });
  return token;
};

export { generateToken };
