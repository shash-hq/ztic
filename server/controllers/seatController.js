import mongoose from 'mongoose';
import Seat from '../models/Seat.js';
import Show from '../models/Show.js';
import { createError } from '../middleware/errorHandler.js';
import { broadcastSeatUpdate, broadcastSeatCount } from '../socket/seatSocket.js';

// POST /api/v1/seats/reserve
// Atomically reserves seats using findOneAndUpdate to prevent race conditions
export const reserveSeats = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { showId, seatIds, sessionId } = req.body;
    if (!showId || !seatIds?.length || !sessionId) {
      return next(createError('showId, seatIds[], and sessionId are required', 400));
    }

    const show = await Show.findById(showId).session(session);
    if (!show) return next(createError('Show not found', 404));
    if (show.status !== 'on_sale') {
      return next(createError('This show is not available for booking', 400));
    }

    // Check all requested seats are still available
    const seats = await Seat.find({
      _id: { $in: seatIds },
      show: showId,
    }).session(session);

    if (seats.length !== seatIds.length) {
      return next(createError('One or more seats not found for this show', 404));
    }

    const unavailable = seats.filter((s) => s.status !== 'available');
    if (unavailable.length > 0) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: 'One or more seats are no longer available',
        conflicting: unavailable.map((s) => s.label),
      });
    }

    // Atomically mark as reserved
    const now = new Date();
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { $set: { status: 'reserved', reservedBy: sessionId, reservedAt: now } },
      { session }
    );

    await session.commitTransaction();

    // Fetch updated seats to broadcast
    const updatedSeats = await Seat.find({ _id: { $in: seatIds } });
    broadcastSeatUpdate(req.app.get('io'), showId, updatedSeats);

    res.json({
      success: true,
      message: 'Seats reserved. You have 10 minutes to complete booking.',
      data: updatedSeats.map((s) => ({
        _id: s._id,
        label: s.label,
        status: s.status,
        price: s.price,
      })),
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// DELETE /api/v1/seats/reserve
// Releases a hold — called on page exit or manual deselect
export const releaseSeats = async (req, res, next) => {
  try {
    const { seatIds, sessionId } = req.body;
    if (!seatIds?.length || !sessionId) {
      return next(createError('seatIds[] and sessionId are required', 400));
    }

    const result = await Seat.updateMany(
      { _id: { $in: seatIds }, reservedBy: sessionId, status: 'reserved' },
      { $set: { status: 'available', reservedBy: null, reservedAt: null } }
    );

    // Broadcast if anything changed
    if (result.modifiedCount > 0) {
      const updatedSeats = await Seat.find({ _id: { $in: seatIds } });
      const showId = updatedSeats[0]?.show?.toString();
      if (showId) broadcastSeatUpdate(req.app.get('io'), showId, updatedSeats);
    }

    res.json({ success: true, message: `${result.modifiedCount} seat(s) released.` });
  } catch (err) {
    next(err);
  }
};
