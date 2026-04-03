import { Router } from 'express';
// 1. We import the EXACT names you actually used in tenantController.js
import { 
  registerTenant, 
  getMyTenant, 
  updateBranding,
  updateTenant,
  addMember,
  removeMember
} from '../controllers/tenantController.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import { resolveTenant } from '../middleware/tenantMiddleware.js';

const router = Router();

router.post('/register', verifyAccessToken, registerTenant);

router.use(verifyAccessToken, resolveTenant);

// 2. We attach the correct functions to the URLs
router.get('/me', getMyTenant);
router.patch('/me', updateTenant);
router.patch('/me/branding', updateBranding);
router.post('/me/members', addMember);
router.delete('/me/members/:userId', removeMember);

export default router;
