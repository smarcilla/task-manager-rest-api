import { z } from 'zod';

const loginBodySchema = z.object({
  email: z.string('email is required'),
  password: z.string('password is required'),
});

export const loginSchema = z.object({
  body: loginBodySchema,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export default loginSchema;
