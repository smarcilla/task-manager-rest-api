import mongoose from 'mongoose';

const connectDB = async () => {
  // Recommended options for Mongoose 8+ and Docker environments
  const connectionOptions = {
    autoIndex: true, // Useful in development; usually disabled in large-scale production
    serverSelectionTimeoutMS: 5000, // Don't wait more than 5s to connect
    socketTimeoutMS: 45000, // Close idle sockets after 45s
  };

  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI,
      connectionOptions
    );

    console.log(`🚀 MongoDB conectado: ${conn.connection.host}`);

    // Handle events after the initial connection
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error en la conexión de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });
  } catch (error) {
    console.error('🔴 Error crítico al conectar a MongoDB:', error.message);
    // Instead of exiting immediately, you could implement retry logic
    process.exit(1);
  }
};

/**
 * Function to gracefully shut down the application
 */
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
