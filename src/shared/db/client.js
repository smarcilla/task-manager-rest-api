import mongoose from 'mongoose';

const connectDB = async () => {
  const connectionOptions = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI,
      connectionOptions
    );

    console.log(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('Error in MongoDB connection:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
  } catch (error) {
    console.error('Critical error connecting to MongoDB:', error.message);

    process.exit(1);
  }
};

const gracefulShutdown = (signal, server) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB:', err);
      process.exit(1);
    }
  });
};

export { connectDB, gracefulShutdown };
