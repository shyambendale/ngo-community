
import { Router } from 'express';
import Message from '../models/Message.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /messages
// Send a message
router.post('/messages', requireAuth, async (req, res) => {
  try {
    const { to, text, message, content } = req.body;
    const body = text ?? message ?? content;

    if (!to || !body || !String(body).trim()) {
      return res.status(400).json({
        error: 'Receiver and message text are required'
      });
    }

    const sender = req.user.email.toLowerCase();
    const receiver = to.toLowerCase().trim();

    if (sender === receiver) {
      return res.status(400).json({
        error: 'You cannot message yourself'
      });
    }

    const msg = await Message.create({
      from: sender,
      to: receiver,
      message: String(body).trim()
    });

    res.status(201).json(msg);

  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({
      error: 'Failed to send message'
    });
  }
});


// GET /conversations
// Fetch all conversations of logged-in user
// GET /conversations
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const me = req.user.email.toLowerCase();

    const messages = await Message.find({
      $or: [{ from: me }, { to: me }]
    }).sort({ createdAt: -1 });

    const conversations = new Map();

    for (const msg of messages) {
      const otherEmail =
        msg.from.toLowerCase() === me
          ? msg.to.toLowerCase()
          : msg.from.toLowerCase();

      if (!conversations.has(otherEmail)) {
        conversations.set(otherEmail, {
          email: otherEmail,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unreadCount: 0
        });
      }

      if (msg.to.toLowerCase() === me && !msg.read) {
        conversations.get(otherEmail).unreadCount++;
      }
    }

    res.json(Array.from(conversations.values()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});


// GET /messages/:withUser
// Fetch complete conversation between two users
router.get('/messages/:withUser', requireAuth, async (req, res) => {
  try {
    const me = req.user.email.toLowerCase();
    const other = req.params.withUser.toLowerCase().trim();

    const messages = await Message.find({
      $or: [
        { from: me, to: other },
        { from: other, to: me }
      ]
    }).sort({ createdAt: 1 });

    // Mark received messages as read
    await Message.updateMany(
      {
        from: other,
        to: me,
        read: false
      },
      {
        $set: { read: true }
      }
    );

    res.json(messages);

  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({
      error: 'Failed to fetch messages'
    });
  }
});

export default router;
