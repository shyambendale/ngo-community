import jwt from 'jsonwebtoken';

export const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

// Requires a valid "Authorization: Bearer <token>" header
export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in first' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired, please log in again' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'You are not allowed to do this' });
  }
  next();
};

export const requireAdmin = [requireAuth, requireRole('admin')];
export const requireNgo = [requireAuth, requireRole('ngo', 'admin')];
