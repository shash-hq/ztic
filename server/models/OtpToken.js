import mongoose from 'mongoose';

const otpTokenSchema = new mongoose.Schema({
  // contact is either an email address or E.164 phone number e.g. +919876543210
  contact: {
    type: String,
    required: true,
    index: true,
  },
  // bcrypt hash of the 6-digit OTP — plain OTP is NEVER persisted
  otpHash: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    enum: ['email', 'sms', 'whatsapp'],
    required: true,
  },
  // incremented on each failed verify attempt; locked after 3
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index: MongoDB auto-deletes document 600 seconds after createdAt
otpTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

export default mongoose.model('OtpToken', otpTokenSchema);
