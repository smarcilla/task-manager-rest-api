import express from 'express';

import { registerHandler } from './register.handler.js';
import { loginHandler } from './login.handler.js';
import { registerSchema } from './schemas/register.schema.js';
import { loginSchema } from './schemas/login.schema.js';
import { validateRequest } from '../shared/validators/request.validator.js';

const authRouter = express.Router();

authRouter.post('/register', validateRequest(registerSchema), registerHandler);
authRouter.post('/login', validateRequest(loginSchema), loginHandler);
export default authRouter;
