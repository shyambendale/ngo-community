// Adds an `id` field (like Firestore doc ids) and hides password / __v in API responses
export const toJSON = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.password;
    return ret;
  },
};
