import mongoose from 'mongoose';

const userBankAccountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountHolderName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscOrSwift: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

userBankAccountSchema.index({ user: 1 });

export const UserBankAccount = mongoose.model(
  'UserBankAccount',
  userBankAccountSchema
);
