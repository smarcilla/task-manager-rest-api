import app from './app.js';

const PORT = process.env.PORT || 3000;

//TODO: connect to database before starting the server

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
