import Event from '../models/Event.js';
import { createError } from '../middleware/errorHandler.js';

// GET /api/v1/events
export const getEvents = async (req, res, next) => {
  try {
    const { category, trending } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (trending === 'true') filter.isTrending = true;

    const events = await Event.find(filter)
      .populate('shows', 'date status availableSeats totalSeats')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/events/:slug
export const getEventBySlug = async (req, res, next) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug }).populate({
      path: 'shows',
      select: 'date status availableSeats totalSeats venueLayout',
    });
    if (!event) return next(createError('Event not found', 404));
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/events/:slug/shows
export const getShowsForEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug }).populate({
      path: 'shows',
      select: 'date status availableSeats totalSeats venueLayout',
    });
    if (!event) return next(createError('Event not found', 404));
    res.json({ success: true, data: event.shows });
  } catch (err) {
    next(err);
  }
};
