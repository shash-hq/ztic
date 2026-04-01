import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Seat from '../models/Seat.js';
import Show from '../models/Show.js';
import { createError } from '../middleware/errorHandler.js';
import { broadcastSeatUpdate, broadcastSeatCount } from '../socket/seatSocket.js';

// POST /api/v1/bookings
export const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { showId, seatIds, customerEmail, sessionId } = req.body;
    if (!showId || !seatIds?.length || !customerEmail) {
      return next(createError('showId, seatIds[], and customerEmail are required', 400));
    }

    const show = await Show.findById(showId).session(session);
    if (!show) return next(createError('Show not found', 404));

    // Seats must be reserved by this session
    const seats = await Seat.find({
      _id: { $in: seatIds },
      show: showId,
      status: 'reserved',
      reservedBy: sessionId,
    }).session(session);

    if (seats.length !== seatIds.length) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: 'Seat reservation expired or invalid. Please reselect.',
      });
    }

    const totalAmount = seats.reduce((sum, s) => sum + s.price, 0);
    const orderRef = Booking.generateOrderRef();

    // Create booking record
    const [booking] = await Booking.create(
      [{ orderRef, show: showId, seats: seatIds, totalAmount, currency: 'JPY', customerEmail, status: 'confirmed' }],
      { session }
    );

    // Mark seats as booked
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { $set: { status: 'booked', reservedBy: null, reservedAt: null, booking: booking._id } },
      { session }
    );

    // Decrement available seat count on Show
    await Show.findByIdAndUpdate(
      showId,
      { $inc: { availableSeats: -seats.length } },
      { session }
    );

    await session.commitTransaction();

    // Broadcast real-time updates
    const updatedSeats = await Seat.find({ _id: { $in: seatIds } });
    const updatedShow = await Show.findById(showId);
    broadcastSeatUpdate(req.app.get('io'), showId, updatedSeats);
    broadcastSeatCount(req.app.get('io'), showId, updatedShow.availableSeats);

    res.status(201).json({ success: true, data: { orderRef: booking.orderRef, totalAmount, seats: seats.map((s) => s.label) } });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// GET /api/v1/bookings/:orderRef
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ orderRef: req.params.orderRef })
      .populate({ path: 'show', populate: { path: 'event', select: 'title location heroImage' } })
      .populate('seats', 'label type price row col');

    if (!booking) return next(createError('Booking not found', 404));
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};
