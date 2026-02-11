import express from 'express';

import createTaskHandler from './handlers/create.task.handler.js';
import listTaskHandler from './handlers/list.task.handler.js';
import markCompletedTaskHandler from './handlers/mark-completed.task.handler.js';
import deleteTaskHandler from './handlers/delete.task.handler.js';
import createTaskSchema from './schemas/create.task.schema.js';
import listTaskSchema from './schemas/list.task.schema.js';
import { validateRequest } from '../shared/validators/request.validator.js';
import authMiddleware from '../shared/auth/auth.middleware.js';

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

taskRouter.patch('/:id/complete', authMiddleware, markCompletedTaskHandler);
taskRouter.delete('/:id', authMiddleware, deleteTaskHandler);

export default taskRouter;
