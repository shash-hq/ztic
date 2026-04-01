import { Router } from 'express';
import { reserveSeats, releaseSeats } from '../controllers/seatController.js';
import { seatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/reserve', seatLimiter, reserveSeats);
router.delete('/reserve', seatLimiter, releaseSeats);

export default router;
