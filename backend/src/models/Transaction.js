import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'recharge_approved',
        'withdrawal_requested',
        'withdrawal_paid',
        'interest_accrual',
        'withdrawal_rejected_refund',
      ],
      required: true,
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    referenceModel: { type: String },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
