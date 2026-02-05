import express from 'express';

import taskHandler from './task.handler';
import { createTaskSchema } from './task.schema';
import { validateRequest } from '../shared/validators/request.validator';

const taskRouter = express.Router();

taskRouter.post('/', validateRequest(createTaskSchema), taskHandler);
export default taskRouter;
