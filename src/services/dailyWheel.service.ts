import { isDevModeEnabled } from '@/services/devMode.service';

const DAILY_WHEEL_STORAGE_KEY = 'daily_wheel_last_spin';

export interface DailyWheelState {
  isAvailable: boolean;
  lastSpinAt?: string;
  nextAvailableAt?: string;
  hoursRemaining?: number;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getNextMidnight = (date: Date) => {
  const next = new Date(date);
  next.setDate(date.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const getDailyWheelState = (): DailyWheelState => {
  if (isDevModeEnabled()) {
    return { isAvailable: true };
  }

  const lastSpinAt = localStorage.getItem(DAILY_WHEEL_STORAGE_KEY) || undefined;
  if (!lastSpinAt) {
    return { isAvailable: true };
  }

  const lastDate = new Date(lastSpinAt);
  const now = new Date();
  if (!isSameDay(lastDate, now)) {
    return { isAvailable: true, lastSpinAt };
  }

  const nextAvailableDate = getNextMidnight(now);
  const diffMs = nextAvailableDate.getTime() - now.getTime();
  const hoursRemaining = Math.ceil(diffMs / (60 * 60 * 1000));

  return {
    isAvailable: false,
    lastSpinAt,
    nextAvailableAt: nextAvailableDate.toISOString(),
    hoursRemaining,
  };
};

export const recordDailyWheelSpin = () => {
  localStorage.setItem(DAILY_WHEEL_STORAGE_KEY, new Date().toISOString());
};
