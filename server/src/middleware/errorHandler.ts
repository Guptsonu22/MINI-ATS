import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/environment.js';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.errors.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
};
