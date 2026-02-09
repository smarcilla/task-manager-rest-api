import { z } from 'zod';

import { ASSIGNED_STATUS, COMPLETED_STATUS } from '../../shared/constants';

export const listTaskQuerySchema = z.object({
  title: z
    .string()
    .min(3, { message: 'title search term must be at least 3 characters long' })
    .optional(),
  assignee: z.string().optional(),
  status: z.enum([ASSIGNED_STATUS, COMPLETED_STATUS]).optional(),
  page: z
    .string()
    .regex(/^\d+$/, { message: 'page must be a positive integer' })
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, { message: 'limit must be a positive integer' })
    .optional()
    .default('10'),
});

export const listTaskSchema = z.object({
  query: listTaskQuerySchema,
  body: z.object({}).optional(),
  params: z.object({}).optional(),
});

export default listTaskSchema;
