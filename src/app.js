import express from 'express';

express.json();

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

export default app;
