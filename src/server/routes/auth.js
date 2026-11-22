import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

const authResponse = (user, message) => {
  const token = signToken(user);
  // token is returned both at top level and inside user, so it is saved
  // whichever one your authSlice stores in localStorage
  return { message, token, user: { ...user.toJSON(), token } };
};

// POST /registerUser
router.post('/registerUser', async (req, res) => {
  try {
    const { email, password, role, status, ...rest } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const user = await User.create({
      ...rest,
      email,
      password: await bcrypt.hash(password, 10),
      role: 'user', // never trust role from the client
    });
    res.status(201).json(authResponse(user, 'User registered successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /registerNgo  -> NGO is created with status "pending" until an admin approves it
router.post('/registerNgo', async (req, res) => {
  try {
    const { email, password, role, status, ...rest } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const ngo = await User.create({
      ...rest,
      email,
      password: await bcrypt.hash(password, 10),
      role: 'ngo',
      status: 'pending',
    });
    res.status(201).json(authResponse(ngo, 'NGO registered. Waiting for admin approval.'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'NGO registration failed' });
  }
});

// POST /loginUser
router.post('/loginUser', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (user.role === 'ngo' && user.status === 'rejected') {
      return res.status(403).json({ error: 'Your NGO registration was rejected' });
    }
    res.json(authResponse(user, 'Login successful'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
