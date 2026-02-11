import express from 'express';

import taskRouter from './tasks/task.router.js';
import authRouter from './auth/auth.router.js';
import errorHandler from './shared/errors/error.handler.js';

const app = express();

app.use(express.json());

app.use('/tasks', taskRouter);
app.use('/auth', authRouter);

app.use(errorHandler);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
