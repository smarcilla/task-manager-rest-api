export const mapUser = (doc) => {
  if (!doc) return doc;

  const plainDoc = typeof doc.toJSON === 'function' ? doc.toJSON() : doc;

  /* eslint-disable no-unused-vars */
  const { _id, __v, createdAt, updatedAt, ...rest } = plainDoc;
  return {
    id: String(_id),
    ...rest,
  };
};
