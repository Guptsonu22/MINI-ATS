import { Request, Response } from 'express';
import { env } from '../config/environment.js';

export const getHealth = (_req: Request, res: Response): void => {
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
    },
  });
};
