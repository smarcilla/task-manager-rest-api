import jwt from 'jsonwebtoken';

const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error('Token validation error:', err);
    return null;
  }
};

export { validateToken };
