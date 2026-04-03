import { Router } from 'express';
import {
  sendOtp,
  verifyOtp,
  sendMagicLink,
  verifyMagicLink,
  refreshAccessToken,
  logout,
  getMe,
} from '../controllers/authController.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';

const router = Router();

// Passwordless OTP flow
router.post('/otp/send',        sendOtp);
router.post('/otp/verify',      verifyOtp);

// Magic link flow (email fallback)
router.post('/magic-link/send',    sendMagicLink);
router.get('/magic-link/verify',   verifyMagicLink);

// Session management
router.post('/token/refresh',   refreshAccessToken);
router.post('/logout',          logout);

// Authenticated profile
router.get('/me', verifyAccessToken, getMe);

export default router;
