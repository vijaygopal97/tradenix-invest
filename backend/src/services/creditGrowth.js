import { InterestLog } from '../models/InterestLog.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns interest log entries sorted ascending by effectiveFrom.
 */
export async function getInterestTimeline() {
  const logs = await InterestLog.find().sort({ effectiveFrom: 1 }).lean();
  return logs;
}

/**
 * Daily percent effective at a given instant (prospective rates).
 */
export function rateAtTime(timeline, at) {
  if (!timeline.length) return 0;
  let rate = timeline[0].dailyPercent;
  for (const entry of timeline) {
    if (entry.effectiveFrom <= at) rate = entry.dailyPercent;
    else break;
  }
  return rate;
}

/**
 * Accrue interest on balance between two timestamps using piecewise daily rates.
 * Linear pro-rata of daily percentage over each segment.
 */
export function accrueBetween(balance, from, to, timeline) {
  if (balance <= 0 || to <= from) return { balance, accrued: 0 };

  let cursor = from;
  let currentBalance = balance;
  let totalAccrued = 0;

  const segments = timeline.filter((e) => e.effectiveFrom > from && e.effectiveFrom < to);
  const breakpoints = [from, ...segments.map((s) => s.effectiveFrom), to];

  for (let i = 0; i < breakpoints.length - 1; i++) {
    const segStart = breakpoints[i];
    const segEnd = breakpoints[i + 1];
    const dailyPercent = rateAtTime(timeline, segStart);
    const elapsedMs = segEnd - segStart;
    const increment = currentBalance * (dailyPercent / 100) * (elapsedMs / MS_PER_DAY);
    currentBalance += increment;
    totalAccrued += increment;
  }

  return { balance: currentBalance, accrued: totalAccrued };
}

export async function applyAccrualToUser(userDoc, now = new Date()) {
  const timeline = await getInterestTimeline();
  if (!timeline.length || userDoc.balance <= 0) {
    userDoc.lastAccrualAt = now;
    await userDoc.save();
    return userDoc;
  }

  const from = userDoc.lastAccrualAt || userDoc.createdAt || now;
  if (now <= from) return userDoc;

  const { balance: newBalance, accrued } = accrueBetween(
    userDoc.balance,
    from,
    now,
    timeline
  );

  if (accrued > 0.000001) {
    userDoc.balance = Math.round(newBalance * 100) / 100;
    userDoc.lastAccrualAt = now;
    await userDoc.save();
    await Transaction.create({
      user: userDoc._id,
      type: 'interest_accrual',
      amount: Math.round(accrued * 100) / 100,
      balanceAfter: userDoc.balance,
      note: 'Continuous daily interest accrual',
    });
  } else {
    userDoc.lastAccrualAt = now;
    await userDoc.save();
  }

  return userDoc;
}

export async function applyAccrualById(userId, now = new Date()) {
  const user = await User.findById(userId);
  if (!user) return null;
  return applyAccrualToUser(user, now);
}

export async function accrueAllUsersBeforeRateChange(now = new Date()) {
  const users = await User.find({ role: 'user', balance: { $gt: 0 } });
  for (const user of users) {
    await applyAccrualToUser(user, now);
  }
}

/**
 * Project balance at `now` without persisting (for live dashboard display).
 */
export async function projectBalance(userDoc, now = new Date()) {
  const timeline = await getInterestTimeline();
  if (!timeline.length || userDoc.balance <= 0) {
    return userDoc.balance;
  }
  const from = userDoc.lastAccrualAt || userDoc.createdAt || now;
  const { balance } = accrueBetween(userDoc.balance, from, now, timeline);
  return Math.round(balance * 100) / 100;
}

export async function getCurrentDailyRate() {
  const timeline = await getInterestTimeline();
  if (!timeline.length) return 0;
  return rateAtTime(timeline, new Date());
}
