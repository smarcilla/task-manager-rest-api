import { z } from 'zod';

const registerBodySchema = z.object({
  email: z.email('email is not valid'),
});

export const registerSchema = z.object({
  body: registerBodySchema,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export default registerSchema;
