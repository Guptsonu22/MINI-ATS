import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/environment.js';
import { healthRouter } from './routes/health.routes.js';
import { candidateRouter } from './routes/candidate.routes.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = (): Application => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    })
  );

  // Request logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api', healthRouter);
  app.use('/api/candidates', candidateRouter);

  // Fallback 404 handler
  app.use(notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
};
