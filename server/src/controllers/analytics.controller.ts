import { RequestHandler } from 'express';
import { analyticsService } from '../services/analytics.service.js';

export const getAnalyticsHandler: RequestHandler = async (_req, res, next): Promise<void> => {
  try {
    const analytics = await analyticsService.getAnalytics();

    res.status(200).json({
      success: true,
      message: 'Dashboard analytics retrieved successfully',
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};
