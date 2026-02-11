import { z } from 'zod';

const createTaskBodySchema = z.object({
  title: z
    .string('title is required')
    .min(1, { message: 'title is not empty' }),
  description: z.string().optional(),
  assignee: z
    .string('assignee is required')
    .min(1, { message: 'assignee is not empty' }),
});

export const createTaskSchema = z.object({
  body: createTaskBodySchema,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export default createTaskSchema;
