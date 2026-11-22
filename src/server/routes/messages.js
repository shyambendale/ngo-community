import { Router } from 'express';
import Message from '../models/Message.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /messages  { to, message }   (sender is taken from the login token)
router.post('/messages', requireAuth, async (req, res) => {
  try {
    const { to, text, message, content } = req.body;
    const body = text ?? message ?? content; // accepts whichever field name your form uses
    if (!to || !body) return res.status(400).json({ error: 'Receiver and message text are required' });
    const msg = await Message.create({ ...req.body, from: req.user.email, to, message: body });
    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /messages/:withUser?user=&withUser=   -> whole conversation, oldest first
router.get('/messages/:withUser', requireAuth, async (req, res) => {
  try {
    const me = req.user.email; // always the logged-in user, never trust ?user=
    const other = req.params.withUser.toLowerCase();
    const messages = await Message.find({
      $or: [
        { from: me, to: other },
        { from: other, to: me },
      ],
    }).sort({ createdAt: 1 });
    await Message.updateMany({ from: other, to: me, read: false }, { read: true });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
