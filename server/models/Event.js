import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['cinema', 'event', 'comedy'],
      required: true,
    },
    description: { type: String, default: '' },
    location: { type: String, required: true },
    heroImage: { type: String, default: '' },
    isTrending: { type: Boolean, default: false },
    tags: [{ type: String, uppercase: true, trim: true }],
    shows: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Show' }],
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
