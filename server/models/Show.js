import mongoose from 'mongoose';

const venueLayoutSchema = new mongoose.Schema(
  {
    rows: { type: Number, required: true },
    cols: { type: Number, required: true },
    aisleAfterCol: { type: Number, required: true },
    premiumRows: [{ type: Number }],
    premiumPrice: { type: Number, required: true },
    standardPrice: { type: Number, required: true },
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    venueLayout: { type: venueLayoutSchema, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    status: {
      type: String,
      enum: ['on_sale', 'sold_out', 'cancelled'],
      default: 'on_sale',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Show', showSchema);
