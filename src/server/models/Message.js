import mongoose from 'mongoose';
import { toJSON } from './toJSON.js';

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, lowercase: true, trim: true }, // sender email
    to: { type: String, required: true, lowercase: true, trim: true },   // receiver email
    message: { type: String, required: true }, // your Messages.jsx reads message.message
    read: { type: Boolean, default: false },
  },
  { timestamps: true, strict: false, toJSON, toObject: toJSON }
);

messageSchema.index({ from: 1, to: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
