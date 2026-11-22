import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import authRoutes from './routes/auth.js';
import ngoRoutes from './routes/ngo.js';
import requirementRoutes from './routes/requirements.js';
import messageRoutes from './routes/messages.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || '*' }));
app.use(express.json({ limit: '5mb' }));

app.get('/', (_req, res) => res.json({ status: 'NGO API running' }));

// Same URLs your frontend already calls
app.use(authRoutes);
app.use(ngoRoutes);
app.use(requirementRoutes);
app.use(messageRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Creates the admin account from .env the first time the server starts
async function ensureAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  const exists = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (!exists) {
    await User.create({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'admin',
    });
    console.log(`Admin account created: ${ADMIN_EMAIL}`);
  }
}

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await ensureAdmin();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
