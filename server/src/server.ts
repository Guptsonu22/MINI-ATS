import { createApp } from './app.js';
import { env } from './config/environment.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Mini ATS Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  console.log(`🩺 Health check available at: http://localhost:${env.PORT}/api/health`);
});

const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forcefully terminating process after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
