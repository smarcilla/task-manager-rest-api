import express from 'express';

import { registerHandler } from './register.handler';
import { registerSchema } from './schemas/register.schema';
import { validateRequest } from '../shared/validators/request.validator';

const authRouter = express.Router();

authRouter.post('/register', validateRequest(registerSchema), registerHandler);
export default authRouter;
