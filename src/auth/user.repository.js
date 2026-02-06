import User from './user.model';

export const registerUser = async (userData) => {
  const user = new User(userData);

  const savedUser = await user.save();
  return savedUser.toJSON();
};
