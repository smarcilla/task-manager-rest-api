import { mapUser } from './user.mapper.js';
import User from './user.model.js';

export const registerUser = async (userData) => {
  const user = new User(userData);

  const savedUser = await user.save();
  return mapUser(savedUser);
};

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};
