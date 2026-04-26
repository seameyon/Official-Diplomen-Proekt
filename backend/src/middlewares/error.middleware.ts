import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export interface AppError extends Error {
  statusCode?: number;
  code?: number | string;
  errors?: Record<string, { message: string }>;
}


export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}


export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new ApiError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};


export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  const errors: Record<string, string> = {};


  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    err.errors.forEach((error) => {
      const path = error.path.join('.');
      errors[path] = error.message;
    });
  }

  
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation error';
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors![key].message;
    });
  }


  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

 
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }


  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(Object.keys(errors).length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};


export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default { notFound, errorHandler, asyncHandler, ApiError };
