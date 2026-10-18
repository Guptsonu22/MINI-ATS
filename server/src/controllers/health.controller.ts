import { Request, Response } from 'express';
import { env } from '../config/environment.js';
import { getDatabaseStatus } from '../config/database.js';

export const getHealth = (_req: Request, res: Response): void => {
  const dbStatus = getDatabaseStatus();

  res.status(200).json({
    success: true,
    message: 'Mini ATS API is running smoothly',
    data: {
      status: 'healthy',
      service: 'mini-ats-server',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      nodeVersion: process.version,
      database: dbStatus,
    },
  });
};
