import 'dotenv/config'; // Clean static import
import app from './app.js';
import { connectDB, gracefulShutdown } from './shared/db/client.js';

const PORT = process.env.PORT || 3000;

try {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV})`);
  });

  // Listen for interrupt and termination signals (Docker/Node)
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
  process.on('SIGINT', () => gracefulShutdown('SIGINT', server));
} catch (error) {
  console.error('❌ Fatal startup error:', error);
  process.exit(1);
}
