import mongoose from 'mongoose';

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'paid', 'rejected'],
      required: true,
    },
    remarks: { type: String, trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const withdrawalRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserBankAccount',
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'rejected'],
      default: 'pending',
    },
    adminRemarks: { type: String, trim: true },
    paymentProofUrl: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    statusHistory: [statusHistoryEntrySchema],
  },
  { timestamps: true }
);

withdrawalRequestSchema.index({ status: 1, createdAt: -1 });
withdrawalRequestSchema.index({ user: 1, createdAt: -1 });

export const WithdrawalRequest = mongoose.model(
  'WithdrawalRequest',
  withdrawalRequestSchema
);
