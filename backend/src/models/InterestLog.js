import mongoose from 'mongoose';

const interestLogSchema = new mongoose.Schema(
  {
    dailyPercent: { type: Number, required: true, min: 0 },
    effectiveFrom: { type: Date, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

interestLogSchema.index({ effectiveFrom: -1 });

export const InterestLog = mongoose.model('InterestLog', interestLogSchema);
