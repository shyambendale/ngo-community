import mongoose from 'mongoose';
import { toJSON } from './toJSON.js';

const requirementSchema = new mongoose.Schema(
  {
    ngoEmail: { type: String, required: true, lowercase: true, trim: true },
    ngoName: String,
    item: { type: String, required: true, trim: true },
    quantity: mongoose.Schema.Types.Mixed,
    description: String,

    // Admin approval: pending -> approved / rejected
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: String,

    // open / fulfilled / closed (REQUIREMENT_STATUS in config.js)
    fulfillmentStatus: { type: String, enum: ['open', 'fulfilled', 'closed'], default: 'open' },
  },
  { timestamps: true, strict: false, toJSON, toObject: toJSON }
);

export default mongoose.model('Requirement', requirementSchema);
