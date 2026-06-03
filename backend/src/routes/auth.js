import { Router } from 'express';
import { body } from 'express-validator';
import { User } from '../models/User.js';
import { authRequired, loadUser, signToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import {
  applyAccrualToUser,
  getCurrentDailyRate,
  projectBalance,
} from '../services/creditGrowth.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      const user = await User.create({ name, email, password, role: 'user' });
      const token = signToken(user);
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          balance: user.balance,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      if (user.role === 'user') {
        await applyAccrualToUser(user);
      }
      const token = signToken(user);
      const balance =
        user.role === 'user' ? await projectBalance(user) : user.balance;
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          balance,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', authRequired, loadUser, async (req, res, next) => {
  try {
    let user = req.user;
    if (user.role === 'user') {
      const fresh = await User.findById(user._id);
      await applyAccrualToUser(fresh);
      const balance = await projectBalance(fresh);
      user = fresh.toObject();
      user.balance = balance;
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        lastAccrualAt: user.lastAccrualAt,
      },
      dailyInterestPercent: user.role === 'user' ? await getCurrentDailyRate() : undefined,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
