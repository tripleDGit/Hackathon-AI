import { isDevModeEnabled } from '@/services/devMode.service';

const WEEKLY_BOSS_STORAGE_KEY = 'weekly_boss_week_state';
const MAX_WEEKLY_ATTEMPTS = 3;

export interface WeeklyBossState {
  isAvailable: boolean;
  attemptsLeft: number;
  attemptsUsed: number;
  weekKey: string;
  nextAvailableAt?: string;
  daysRemaining?: number;
}

interface WeeklyBossStoredState {
  weekKey: string;
  attemptsUsed: number;
}

const getWeekKey = (date: Date): string => {
  const year = date.getFullYear();
  const firstJan = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const week = Math.ceil(dayOfYear / 7);
  return `${year}-W${week}`;
};

const getNextWeekStart = (date: Date): Date => {
  const day = date.getDay();
  const diff = (7 - day) % 7;
  const next = new Date(date);
  next.setDate(date.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  if (diff === 0) {
    next.setDate(next.getDate() + 7);
  }
  return next;
};

export const getWeeklyBossState = (): WeeklyBossState => {
  if (isDevModeEnabled()) {
    return {
      isAvailable: true,
      attemptsLeft: MAX_WEEKLY_ATTEMPTS,
      attemptsUsed: 0,
      weekKey: getWeekKey(new Date()),
    };
  }

  const now = new Date();
  const currentWeekKey = getWeekKey(now);
  const stored = localStorage.getItem(WEEKLY_BOSS_STORAGE_KEY);

  let state: WeeklyBossStoredState = { weekKey: currentWeekKey, attemptsUsed: 0 };
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as WeeklyBossStoredState;
      if (parsed.weekKey === currentWeekKey) {
        state = parsed;
      }
    } catch {
      state = { weekKey: currentWeekKey, attemptsUsed: 0 };
    }
  }

  const attemptsLeft = Math.max(0, MAX_WEEKLY_ATTEMPTS - state.attemptsUsed);
  const isAvailable = attemptsLeft > 0;

  if (isAvailable) {
    return {
      isAvailable,
      attemptsLeft,
      attemptsUsed: state.attemptsUsed,
      weekKey: currentWeekKey,
    };
  }

  const nextAvailableDate = getNextWeekStart(now);
  const diffMs = nextAvailableDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

  return {
    isAvailable: false,
    attemptsLeft,
    attemptsUsed: state.attemptsUsed,
    weekKey: currentWeekKey,
    nextAvailableAt: nextAvailableDate.toISOString(),
    daysRemaining,
  };
};

export const recordWeeklyBossCompletion = () => {
  const now = new Date();
  const currentWeekKey = getWeekKey(now);
  const stored = localStorage.getItem(WEEKLY_BOSS_STORAGE_KEY);
  let attemptsUsed = 0;

  if (stored) {
    try {
      const parsed = JSON.parse(stored) as WeeklyBossStoredState;
      if (parsed.weekKey === currentWeekKey) {
        attemptsUsed = parsed.attemptsUsed;
      }
    } catch {
      attemptsUsed = 0;
    }
  }

  const updated: WeeklyBossStoredState = {
    weekKey: currentWeekKey,
    attemptsUsed: Math.min(MAX_WEEKLY_ATTEMPTS, attemptsUsed + 1),
  };

  localStorage.setItem(WEEKLY_BOSS_STORAGE_KEY, JSON.stringify(updated));
};
