import express from 'express';

import taskRouter from './tasks/task.router';
import authRouter from './auth/auth.router';
import errorHandler from './shared/errors/error.handler';

const app = express();

app.use(express.json());

app.use('/tasks', taskRouter);
app.use('/auth', authRouter);

app.use(errorHandler);

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

export default app;
