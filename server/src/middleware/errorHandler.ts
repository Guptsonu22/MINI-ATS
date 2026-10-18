import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { env } from '../config/environment.js';
import { AppError } from '../utils/AppError.js';

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue?: Record<string, string>;
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Zod validation errors
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

  // 2. Mongoose Duplicate Key Error (E11000)
  if ('code' in err && (err as MongoDuplicateKeyError).code === 11000) {
    const mongoErr = err as MongoDuplicateKeyError;
    const field = mongoErr.keyValue ? Object.keys(mongoErr.keyValue)[0] : 'field';
    const value = mongoErr.keyValue ? mongoErr.keyValue[field] : 'value';

    res.status(409).json({
      success: false,
      error: {
        message: `A candidate with ${field} '${value}' already exists.`,
        code: 'DUPLICATE_ENTRY',
        details: [{ field: field || 'email', message: `Duplicate value '${value}' is not allowed` }],
      },
    });
    return;
  }

  // 3. Mongoose CastError (e.g. invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      error: {
        message: `Invalid identifier format for field '${err.path}'`,
        code: 'INVALID_ID_FORMAT',
      },
    });
    return;
  }

  // 4. Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Database schema validation failed',
        code: 'SCHEMA_VALIDATION_ERROR',
        details,
      },
    });
    return;
  }

  // 5. AppError operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  // 6. Generic unhandled server error
  const statusCode = (err as { statusCode?: number }).statusCode || 500;
  const message =
    statusCode === 500 && env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : err.message || 'Internal Server Error';

  if (env.NODE_ENV !== 'test') {
    console.error('Unhandled Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: (err as { code?: string }).code || 'INTERNAL_SERVER_ERROR',
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
};
