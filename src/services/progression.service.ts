import { Difficulty } from '@/types/game.types';

export interface ProgressionState {
  currentLevel: number;
  enemiesDefeated: number;
  bossesDefeated: number;
}

const PROGRESSION_KEY = 'battle_progression';

export const getProgression = (): ProgressionState => {
  const stored = localStorage.getItem(PROGRESSION_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  const initial: ProgressionState = {
    currentLevel: 1,
    enemiesDefeated: 0,
    bossesDefeated: 0,
  };

  saveProgression(initial);
  return initial;
};

export const saveProgression = (state: ProgressionState) => {
  localStorage.setItem(PROGRESSION_KEY, JSON.stringify(state));
};

export const advanceLevel = (): ProgressionState => {
  const current = getProgression();
  const newState: ProgressionState = {
    currentLevel: current.currentLevel + 1,
    enemiesDefeated: current.enemiesDefeated + 1,
    bossesDefeated: current.bossesDefeated + (isBossLevel(current.currentLevel + 1) ? 1 : 0),
  };
  saveProgression(newState);
  return newState;
};

export const isBossLevel = (level: number): boolean => {
  return level % 10 === 0;
};

export const getDifficultyForLevel = (level: number): Difficulty => {
  if (level <= 10) return Difficulty.EASY;
  if (level <= 20) return Difficulty.MEDIUM;
  return Difficulty.HARD;
};

export const resetProgression = () => {
  const initial: ProgressionState = {
    currentLevel: 1,
    enemiesDefeated: 0,
    bossesDefeated: 0,
  };
  saveProgression(initial);
};
