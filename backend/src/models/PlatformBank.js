import mongoose from 'mongoose';

const platformBankSchema = new mongoose.Schema(
  {
    accountHolderName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscOrSwift: { type: String, required: true, trim: true },
    branch: { type: String, trim: true },
    instructions: { type: String, trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const PlatformBank = mongoose.model('PlatformBank', platformBankSchema);
