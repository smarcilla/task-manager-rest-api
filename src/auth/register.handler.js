import { registerUser } from './user.repository';

export const registerHandler = async (req, res) => {
  const { email } = req.body;

  const newUser = {
    email,
    password: Math.random().toString(36).slice(-8),
  };

  const savedUser = await registerUser(newUser);

  res
    .status(201)
    .json({ ...savedUser, password: newUser.password, id: savedUser._id });
};
