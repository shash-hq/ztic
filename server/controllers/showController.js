import Show from '../models/Show.js';
import Seat from '../models/Seat.js';
import { createError } from '../middleware/errorHandler.js';

// GET /api/v1/shows/:showId
export const getShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.showId).populate(
      'event',
      'title slug category location heroImage'
    );
    if (!show) return next(createError('Show not found', 404));
    res.json({ success: true, data: show });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/shows/:showId/seats
// Returns full seat matrix grouped by row — ready for SeatMap component
export const getSeatMap = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.showId);
    if (!show) return next(createError('Show not found', 404));

    const seats = await Seat.find({ show: req.params.showId })
      .select('row col label type price status reservedBy')
      .sort({ row: 1, col: 1 });

    // Group into row arrays for the frontend grid
    const matrix = [];
    for (let r = 0; r < show.venueLayout.rows; r++) {
      matrix.push(seats.filter((s) => s.row === r));
    }

    res.json({
      success: true,
      data: {
        show: {
          _id: show._id,
          date: show.date,
          status: show.status,
          availableSeats: show.availableSeats,
          totalSeats: show.totalSeats,
          venueLayout: show.venueLayout,
        },
        matrix,
      },
    });
  } catch (err) {
    next(err);
  }
};
