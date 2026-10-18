import { Router } from 'express';
import { getAnalyticsHandler } from '../controllers/analytics.controller.js';

export const analyticsRouter = Router();

analyticsRouter.get('/', getAnalyticsHandler);
