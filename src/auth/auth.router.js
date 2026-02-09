import express from 'express';

import { registerHandler } from './register.handler';
import { loginHandler } from './login.handler';
import { registerSchema } from './schemas/register.schema';
import { loginSchema } from './schemas/login.schema';
import { validateRequest } from '../shared/validators/request.validator';

const authRouter = express.Router();

authRouter.post('/register', validateRequest(registerSchema), registerHandler);
authRouter.post('/login', validateRequest(loginSchema), loginHandler);
export default authRouter;
