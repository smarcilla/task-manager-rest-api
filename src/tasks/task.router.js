import express from 'express';

import createTaskHandler from './handlers/create.task.handler';
import listTaskHandler from './handlers/list.task.handler';
import { createTaskSchema } from './task.schema';
import listTaskSchema from './schemas/list.task.schema';
import { validateRequest } from '../shared/validators/request.validator';
import authMiddleware from '../shared/auth/auth.middleware';

const taskRouter = express.Router();

taskRouter.post(
  '/',
  authMiddleware,
  validateRequest(createTaskSchema),
  createTaskHandler
);
taskRouter.get(
  '/',
  authMiddleware,
  validateRequest(listTaskSchema),
  listTaskHandler
);

export default taskRouter;
