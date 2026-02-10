export const formatMongooseValidation = (err) =>
  Object.values(err.errors || {}).map((e) => ({
    path: e.path,
    message: e.message || e.properties?.message,
  }));
