export class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const errorHandler = (err, req, res) => {
  //console.error(err); // Log the error for debugging purposes

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details;

  res.status(statusCode).json({ status: statusCode, message, errors: details });
};

export default errorHandler;
