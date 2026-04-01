import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    orderRef: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
      },
    ],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'JPY' },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Utility: generate a readable order ref like "ZT-88219"
bookingSchema.statics.generateOrderRef = function () {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `ZT-${num}`;
};

export default mongoose.model('Booking', bookingSchema);
