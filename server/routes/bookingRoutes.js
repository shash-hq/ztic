import { Router } from 'express';
import { createBooking, getBooking } from '../controllers/bookingController.js';
import { seatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', seatLimiter, createBooking);
router.get('/:orderRef', getBooking);

export default router;
