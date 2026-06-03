import { Router } from 'express';
import path from 'path';
import { body, query } from 'express-validator';
import { authRequired, loadUser, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadWithdrawalProof, handleMulterError } from '../middleware/upload.js';
import { User } from '../models/User.js';
import { PlatformBank } from '../models/PlatformBank.js';
import { InterestLog } from '../models/InterestLog.js';
import { RechargeRequest } from '../models/RechargeRequest.js';
import { WithdrawalRequest } from '../models/WithdrawalRequest.js';
import { Transaction } from '../models/Transaction.js';
import {
  accrueAllUsersBeforeRateChange,
  applyAccrualToUser,
  projectBalance,
} from '../services/creditGrowth.js';

const router = Router();

router.use(authRequired, loadUser, requireAdmin);

function proofPublicPath(filename) {
  return `/uploads/withdrawals/${path.basename(filename)}`;
}

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [totalUsers, pendingRecharges, pendingWithdrawals, users] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      RechargeRequest.countDocuments({ status: 'pending' }),
      WithdrawalRequest.countDocuments({ status: 'pending' }),
      User.find({ role: 'user' }).select('balance'),
    ]);

    let totalCredits = 0;
    for (const u of users) {
      await applyAccrualToUser(u);
      totalCredits += await projectBalance(u);
    }

    res.json({
      totalUsers,
      totalCredits: Math.round(totalCredits * 100) / 100,
      pendingRecharges,
      pendingWithdrawals,
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  '/users',
  [
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const filter = { role: 'user' };
      if (req.query.search) {
        const s = req.query.search;
        filter.$or = [
          { name: new RegExp(s, 'i') },
          { email: new RegExp(s, 'i') },
        ];
      }
      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        User.countDocuments(filter),
      ]);

      const enriched = [];
      for (const u of users) {
        await applyAccrualToUser(u);
        enriched.push({
          ...u.toObject(),
          balance: await projectBalance(u),
        });
      }

      res.json({ users: enriched, total, page, limit });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'user' }).select(
      '-password'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    await applyAccrualToUser(user);
    const balance = await projectBalance(user);

    const [recharges, withdrawals, transactions] = await Promise.all([
      RechargeRequest.find({ user: user._id }).sort({ createdAt: -1 }).limit(50),
      WithdrawalRequest.find({ user: user._id })
        .populate('bankAccount')
        .sort({ createdAt: -1 })
        .limit(50),
      Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(50),
    ]);

    res.json({
      user: { ...user.toObject(), balance },
      recharges,
      withdrawals,
      transactions,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/interest', async (_req, res, next) => {
  try {
    const logs = await InterestLog.find()
      .populate('changedBy', 'name email')
      .sort({ effectiveFrom: -1 });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/interest',
  [body('dailyPercent').isFloat({ min: 0 }).withMessage('Rate must be >= 0')],
  validate,
  async (req, res, next) => {
    try {
      const now = new Date();
      await accrueAllUsersBeforeRateChange(now);

      const log = await InterestLog.create({
        dailyPercent: Number(req.body.dailyPercent),
        effectiveFrom: now,
        changedBy: req.user._id,
        note: req.body.note || '',
      });

      res.status(201).json({ log });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/platform-bank', async (_req, res, next) => {
  try {
    const bank = await PlatformBank.findOne().sort({ updatedAt: -1 });
    res.json({ bank });
  } catch (err) {
    next(err);
  }
});

router.put(
  '/platform-bank',
  [
    body('accountHolderName').trim().notEmpty(),
    body('bankName').trim().notEmpty(),
    body('accountNumber').trim().notEmpty(),
    body('ifscOrSwift').trim().notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      let bank = await PlatformBank.findOne();
      const payload = {
        ...req.body,
        updatedBy: req.user._id,
      };
      if (bank) {
        Object.assign(bank, payload);
        await bank.save();
      } else {
        bank = await PlatformBank.create(payload);
      }
      res.json({ bank });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/recharges', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await RechargeRequest.find(filter)
      .populate('user', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/recharges/:id',
  [
    body('status').isIn(['approved', 'rejected']),
    body('adminRemarks').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const request = await RechargeRequest.findById(req.params.id);
      if (!request) return res.status(404).json({ message: 'Request not found' });
      if (request.status !== 'pending') {
        return res.status(400).json({ message: 'Request already processed' });
      }

      const { status, adminRemarks } = req.body;
      request.status = status;
      request.adminRemarks = adminRemarks || '';
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();

      if (status === 'approved') {
        const user = await User.findById(request.user);
        await applyAccrualToUser(user);
        user.balance = Math.round((user.balance + request.amount) * 100) / 100;
        user.lastAccrualAt = new Date();
        await user.save();

        await Transaction.create({
          user: user._id,
          type: 'recharge_approved',
          amount: request.amount,
          balanceAfter: user.balance,
          referenceId: request._id,
          referenceModel: 'RechargeRequest',
          note: adminRemarks || 'Recharge approved',
        });
      }

      await request.save();
      res.json({ request });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/withdrawals', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const withdrawals = await WithdrawalRequest.find(filter)
      .populate('user', 'name email balance')
      .populate('bankAccount')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ withdrawals });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/withdrawals/:id',
  (req, res, next) => {
    uploadWithdrawalProof(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  [
    body('status').isIn(['paid', 'rejected']),
    body('adminRemarks').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const withdrawal = await WithdrawalRequest.findById(req.params.id).populate(
        'user'
      );
      if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
      if (withdrawal.status !== 'pending') {
        return res.status(400).json({ message: 'Withdrawal already processed' });
      }

      const { status, adminRemarks } = req.body;
      if (status === 'paid' && !req.file) {
        return res.status(400).json({ message: 'Payment proof required for paid status' });
      }

      withdrawal.status = status;
      withdrawal.adminRemarks = adminRemarks || '';
      withdrawal.reviewedBy = req.user._id;
      withdrawal.reviewedAt = new Date();
      if (req.file) {
        withdrawal.paymentProofUrl = proofPublicPath(req.file.filename);
      }

      withdrawal.statusHistory.push({
        status,
        remarks: adminRemarks || '',
        changedBy: req.user._id,
        at: new Date(),
      });

      if (status === 'rejected') {
        const user = await User.findById(withdrawal.user._id);
        await applyAccrualToUser(user);
        user.balance = Math.round((user.balance + withdrawal.amount) * 100) / 100;
        user.lastAccrualAt = new Date();
        await user.save();

        await Transaction.create({
          user: user._id,
          type: 'withdrawal_rejected_refund',
          amount: withdrawal.amount,
          balanceAfter: user.balance,
          referenceId: withdrawal._id,
          referenceModel: 'WithdrawalRequest',
          note: adminRemarks || 'Withdrawal rejected — funds returned',
        });
      }

      await withdrawal.save();
      res.json({ withdrawal });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
