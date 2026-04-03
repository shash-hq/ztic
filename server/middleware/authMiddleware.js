import jwt from 'jsonwebtoken';
import { createError } from './errorHandler.js';

// ── verifyAccessToken ─────────────────────────────────────────────────────────
// Attaches decoded JWT payload to req.user on success.
// Expects: Authorization: Bearer <accessToken>
export const verifyAccessToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(createError('Access token required', 401));
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload; // { sub, role, tenantId, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createError('Access token expired', 401));
    }
    return next(createError('Access token invalid', 401));
  }
};

// ── requireRole ───────────────────────────────────────────────────────────────
// Factory — returns middleware that enforces role membership.
// Usage: router.get('/admin', verifyAccessToken, requireRole(['admin']), handler)
export const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) {
    return next(createError('Authentication required', 401));
  }
  if (!roles.includes(req.user.role)) {
    return next(
      createError(
        `Role '${req.user.role}' is not authorised to access this resource`,
        403
      )
    );
  }
  next();
};
