import { Router } from 'express';
import { getShow, getSeatMap } from '../controllers/showController.js';

const router = Router();

router.get('/:showId', getShow);
router.get('/:showId/seats', getSeatMap);

export default router;
