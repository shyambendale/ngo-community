import mongoose from 'mongoose';
import { toJSON } from './toJSON.js';

// One collection for everyone: normal users, NGOs and admins.
// NGOs are users with role "ngo" plus their NGO details and an approval status.
// strict:false keeps any extra fields your forms send (phone, address, description...).
const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'ngo', 'admin'], default: 'user' },

    // NGO only
    city: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
  },
  { timestamps: true, strict: false, toJSON, toObject: toJSON }
);

export default mongoose.model('User', userSchema);
