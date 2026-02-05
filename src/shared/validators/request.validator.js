import { AppError } from '../errors/error.handler';

export const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errorsMessage = result.error.issues.map((issue) => ({
      message: issue.message,
    }));
    throw new AppError('Validation Error', 400, errorsMessage);
  }

  next();
};
