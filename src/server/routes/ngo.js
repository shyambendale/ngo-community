import { Router } from 'express';
import User from '../models/User.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /searchNgos?city=&name=   (approved NGOs only, case-insensitive partial match)
router.get('/searchNgos', async (req, res) => {
  try {
    const filter = { role: 'ngo', status: 'approved' };
    if (req.query.city) filter.city = new RegExp(escape(req.query.city), 'i');
    if (req.query.name) filter.name = new RegExp(escape(req.query.name), 'i');
    const ngos = await User.find(filter).sort({ name: 1 });
    res.json(ngos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /admin/pendingNgos
router.get('/admin/pendingNgos', requireAdmin, async (_req, res) => {
  try {
    res.json(await User.find({ role: 'ngo', status: 'pending' }).sort({ createdAt: -1 }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending NGOs' });
  }
});

// POST /admin/approveNgo  { ngoId }
router.post('/admin/approveNgo', requireAdmin, async (req, res) => {
  try {
    const ngo = await User.findOneAndUpdate(
      { _id: req.body.ngoId, role: 'ngo' },
      { status: 'approved' },
      { new: true }
    );
    if (!ngo) return res.status(404).json({ error: 'NGO not found' });
    res.json({ message: 'NGO approved', ngo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Approval failed' });
  }
});

// POST /admin/rejectNgo  { ngoId }   (extra – use it if you add a Reject button)
router.post('/admin/rejectNgo', requireAdmin, async (req, res) => {
  try {
    const ngo = await User.findOneAndUpdate(
      { _id: req.body.ngoId, role: 'ngo' },
      { status: 'rejected' },
      { new: true }
    );
    if (!ngo) return res.status(404).json({ error: 'NGO not found' });
    res.json({ message: 'NGO rejected', ngo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Rejection failed' });
  }
});

export default router;
