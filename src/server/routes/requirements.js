import { Router } from 'express';
import Requirement from '../models/Requirement.js';
import User from '../models/User.js';
import { requireAdmin, requireNgo } from '../middleware/auth.js';

const router = Router();
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// NGOs can only see/edit their own requirements (admins can see all)
const canAccessNgo = (req, email) =>
  req.user.role === 'admin' || req.user.email === String(email).toLowerCase();

const byNgoAndStatus = (status) => async (req, res) => {
  try {
    if (!canAccessNgo(req, req.params.ngoEmail)) return res.status(403).json({ error: 'Not allowed' });
    const list = await Requirement.find({ ngoEmail: req.params.ngoEmail.toLowerCase(), status }).sort({
      createdAt: -1,
    });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to fetch ${status} requirements` });
  }
};

// POST /ngo/postRequirement
router.post('/ngo/postRequirement', requireNgo, async (req, res) => {
  try {
    const { status, rejectionReason, _id, id, ...data } = req.body;
    if (!data.item) return res.status(400).json({ error: 'Item is required' });
    const ngo = await User.findById(req.user.id);
    const requirement = await Requirement.create({
      ...data,
      ngoEmail: req.user.email,
      ngoName: data.ngoName || ngo?.name,
      status: 'pending',
    });
    res.status(201).json({ message: 'Requirement posted. Waiting for admin approval.', requirement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post requirement' });
  }
});

// GET /searchRequirements?item=   (approved only)
router.get('/searchRequirements', async (req, res) => {
  try {
    const filter = { status: 'approved' };
    if (req.query.item) filter.item = new RegExp(escape(req.query.item), 'i');
    res.json(await Requirement.find(filter).sort({ createdAt: -1 }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/ngo/approvedRequirements/:ngoEmail', requireNgo, byNgoAndStatus('approved'));
router.get('/ngo/pendingRequirements/:ngoEmail', requireNgo, byNgoAndStatus('pending'));
router.get('/ngo/rejectedRequirements/:ngoEmail', requireNgo, byNgoAndStatus('rejected'));

// PUT /ngo/updateRequirement/:id   -> edited requirements go back to "pending" for re-approval
router.put('/ngo/updateRequirement/:id', requireNgo, async (req, res) => {
  try {
    const existing = await Requirement.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Requirement not found' });
    if (!canAccessNgo(req, existing.ngoEmail)) return res.status(403).json({ error: 'Not allowed' });

    const { status, ngoEmail, _id, id, ...data } = req.body;
    Object.assign(existing, data, { status: 'pending', rejectionReason: undefined });
    await existing.save();
    res.json({ message: 'Requirement updated. Waiting for admin approval.', requirement: existing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update requirement' });
  }
});

// GET /admin/pendingRequirements
router.get('/admin/pendingRequirements', requireAdmin, async (_req, res) => {
  try {
    res.json(await Requirement.find({ status: 'pending' }).sort({ createdAt: -1 }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending requirements' });
  }
});

// POST /admin/approveRequirement  { requirementId }
router.post('/admin/approveRequirement', requireAdmin, async (req, res) => {
  try {
    const requirement = await Requirement.findByIdAndUpdate(
      req.body.requirementId,
      { status: 'approved', $unset: { rejectionReason: 1 } },
      { new: true }
    );
    if (!requirement) return res.status(404).json({ error: 'Requirement not found' });
    res.json({ message: 'Requirement approved', requirement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Approval failed' });
  }
});

// POST /admin/rejectRequirement  { requirementId, reason }
router.post('/admin/rejectRequirement', requireAdmin, async (req, res) => {
  try {
    const requirement = await Requirement.findByIdAndUpdate(
      req.body.requirementId,
      { status: 'rejected', rejectionReason: req.body.reason || '' },
      { new: true }
    );
    if (!requirement) return res.status(404).json({ error: 'Requirement not found' });
    res.json({ message: 'Requirement rejected', requirement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Rejection failed' });
  }
});

export default router;
