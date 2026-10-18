import { createApp } from './app.js';
import { env } from './config/environment.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Mini ATS Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
      console.log(`🩺 Health check available at: http://localhost:${env.PORT}/api/health`);
      console.log(`👥 Candidates API available at: http://localhost:${env.PORT}/api/candidates`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await disconnectDatabase();
        } catch (dbErr) {
          console.error('Error disconnecting database:', dbErr);
        }
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Forcefully terminating process after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
