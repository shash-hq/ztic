import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
    },
    row: { type: Number, required: true },  // 0-based index
    col: { type: Number, required: true },  // 0-based index
    label: { type: String, required: true }, // "α-4"
    type: {
      type: String,
      enum: ['standard', 'premium'],
      default: 'standard',
    },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['available', 'reserved', 'booked'],
      default: 'available',
      index: true,
    },
    reservedBy: { type: String, default: null },   // sessionId
    reservedAt: { type: Date, default: null },      // TTL base field
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound unique index: one seat per show per position
seatSchema.index({ show: 1, row: 1, col: 1 }, { unique: true });

// TTL index: auto-releases reserved seats after 10 minutes
seatSchema.index(
  { reservedAt: 1 },
  { expireAfterSeconds: 600, partialFilterExpression: { status: 'reserved' } }
);

export default mongoose.model('Seat', seatSchema);
