import mongoose from 'mongoose';

const rechargeRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    screenshotUrl: { type: String, required: true },
    paymentDescription: { type: String, trim: true, maxlength: 500, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminRemarks: { type: String, trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

rechargeRequestSchema.index({ status: 1, createdAt: -1 });
rechargeRequestSchema.index({ user: 1, createdAt: -1 });

export const RechargeRequest = mongoose.model(
  'RechargeRequest',
  rechargeRequestSchema
);
