import { formatMongooseValidation } from './error.formatter.js';

export class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const normalizeError = (err) => {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      message: err.message,
      details: err.details,
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    return {
      statusCode: 400,
      message: 'Validation error',
      details: formatMongooseValidation(err),
    };
  }

  // Duplicate key / MongoServerError (e.g., code 11000)
  if (err.code === 11000 || err.name === 'MongoServerError') {
    const keys = err.keyValue ? Object.keys(err.keyValue) : [];
    const details = keys.length
      ? keys.map((k) => ({ field: k, message: `${k} already exists` }))
      : [{ message: err.message }];
    return { statusCode: 409, message: 'Duplicate key error', details };
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return {
      statusCode: 400,
      message: 'Invalid identifier',
      details: [{ message: err.message }],
    };
  }

  // Fallback
  return {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    details: err.details || null,
  };
};

/* eslint-disable-next-line no-unused-vars */
export const errorHandler = (err, req, res, next) => {
  const { statusCode, message, details } = normalizeError(err);
  res.status(statusCode).json({ status: statusCode, message, errors: details });
};

export default errorHandler;
