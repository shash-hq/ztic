import { Router } from 'express';
import { getEvents, getEventBySlug, getShowsForEvent } from '../controllers/eventController.js';

const router = Router();

router.get('/', getEvents);
router.get('/:slug', getEventBySlug);
router.get('/:slug/shows', getShowsForEvent);

export default router;
