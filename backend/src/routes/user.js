import { Router } from 'express';
import path from 'path';
import { body } from 'express-validator';
import { authRequired, loadUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadRechargeScreenshot, handleMulterError } from '../middleware/upload.js';
import { PlatformBank } from '../models/PlatformBank.js';
import { RechargeRequest } from '../models/RechargeRequest.js';
import { WithdrawalRequest } from '../models/WithdrawalRequest.js';
import { UserBankAccount } from '../models/UserBankAccount.js';
import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import {
  applyAccrualToUser,
  getCurrentDailyRate,
  projectBalance,
} from '../services/creditGrowth.js';

const router = Router();

router.use(authRequired, loadUser);

function rechargePublicPath(filename) {
  return `/uploads/recharges/${path.basename(filename)}`;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    await applyAccrualToUser(user);
    const balance = await projectBalance(user);
    const dailyInterestPercent = await getCurrentDailyRate();
    res.json({
      balance,
      dailyInterestPercent,
      lastAccrualAt: user.lastAccrualAt,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/platform-bank', async (_req, res, next) => {
  try {
    const bank = await PlatformBank.findOne().sort({ updatedAt: -1 });
    res.json({ bank });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/recharges',
  (req, res, next) => {
    uploadRechargeScreenshot(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  [body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1')],
  validate,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Payment screenshot is required' });
      }
      const request = await RechargeRequest.create({
        user: req.user._id,
        amount: Number(req.body.amount),
        screenshotUrl: rechargePublicPath(req.file.filename),
      });
      res.status(201).json({ request });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/recharges', async (req, res, next) => {
  try {
    const requests = await RechargeRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

router.get('/bank-accounts', async (req, res, next) => {
  try {
    const accounts = await UserBankAccount.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ accounts });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/bank-accounts',
  [
    body('accountHolderName').trim().notEmpty(),
    body('bankName').trim().notEmpty(),
    body('accountNumber').trim().notEmpty(),
    body('ifscOrSwift').trim().notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const account = await UserBankAccount.create({
        user: req.user._id,
        ...req.body,
      });
      res.status(201).json({ account });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/withdrawals',
  [
    body('bankAccountId').notEmpty(),
    body('amount').isFloat({ min: 1 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      await applyAccrualToUser(user);
      const balance = await projectBalance(user);

      const amount = Number(req.body.amount);
      if (amount > balance) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      const bankAccount = await UserBankAccount.findOne({
        _id: req.body.bankAccountId,
        user: req.user._id,
      });
      if (!bankAccount) {
        return res.status(404).json({ message: 'Bank account not found' });
      }

      const pending = await WithdrawalRequest.countDocuments({
        user: req.user._id,
        status: 'pending',
      });
      if (pending > 0) {
        return res.status(400).json({ message: 'You already have a pending withdrawal' });
      }

      user.balance = Math.round((balance - amount) * 100) / 100;
      user.lastAccrualAt = new Date();
      await user.save();

      const withdrawal = await WithdrawalRequest.create({
        user: req.user._id,
        bankAccount: bankAccount._id,
        amount,
        statusHistory: [{ status: 'pending', at: new Date() }],
      });

      await Transaction.create({
        user: user._id,
        type: 'withdrawal_requested',
        amount: -amount,
        balanceAfter: user.balance,
        referenceId: withdrawal._id,
        referenceModel: 'WithdrawalRequest',
        note: 'Withdrawal requested — balance reserved',
      });

      res.status(201).json({ withdrawal, balance: user.balance });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/withdrawals', async (req, res, next) => {
  try {
    const withdrawals = await WithdrawalRequest.find({ user: req.user._id })
      .populate('bankAccount')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ withdrawals });
  } catch (err) {
    next(err);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
});

export default router;
