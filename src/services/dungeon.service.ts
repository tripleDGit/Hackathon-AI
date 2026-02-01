import { SkillMaterialType, UncapMaterialType } from '@/types/character.types';
import { DungeonDifficulty, DungeonRunResult, DungeonType, SharedRewardType } from '@/types/dungeon.types';
import { addBooks, addSkillMaterials, addUncapMaterial } from '@/services/character.service';
import { addPoints } from '@/services/missions.service';
import { getProgression } from '@/services/progression.service';
import { spendEnergy } from '@/services/energy.service';

const DIFFICULTY_COST: Record<DungeonDifficulty, number> = {
  easy: 20,
  medium: 30,
  hard: 40,
};

const DIFFICULTY_UNLOCK_LEVEL: Record<DungeonDifficulty, number> = {
  easy: 1,
  medium: 10,
  hard: 20,
};

const DIFFICULTY_REWARD_RANGE: Record<DungeonDifficulty, { min: number; max: number }> = {
  easy: { min: 2, max: 4 },
  medium: { min: 4, max: 7 },
  hard: { min: 7, max: 12 },
};

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const isDungeonDifficultyUnlocked = (difficulty: DungeonDifficulty): boolean => {
  const progression = getProgression();
  return progression.currentLevel >= DIFFICULTY_UNLOCK_LEVEL[difficulty];
};

export const getDungeonDifficultyRequirement = (difficulty: DungeonDifficulty): number => {
  return DIFFICULTY_UNLOCK_LEVEL[difficulty];
};

export const getDungeonEnergyCost = (difficulty: DungeonDifficulty): number => {
  return DIFFICULTY_COST[difficulty];
};

export const runDungeon = (
  type: DungeonType,
  difficulty: DungeonDifficulty,
  material: SkillMaterialType | UncapMaterialType | SharedRewardType
): { success: boolean; error?: string; result?: DungeonRunResult } => {
  if (!isDungeonDifficultyUnlocked(difficulty)) {
    return { success: false, error: 'Difficulty locked' };
  }

  const energyCost = getDungeonEnergyCost(difficulty);
  const energyResult = spendEnergy(energyCost);
  if (!energyResult.success) {
    return { success: false, error: energyResult.error || 'Not enough energy' };
  }

  const range = DIFFICULTY_REWARD_RANGE[difficulty];
  const amount = getRandomInt(range.min, range.max);

  if (type === 'skill') {
    addSkillMaterials({ [material as SkillMaterialType]: amount });
    return {
      success: true,
      result: {
        type,
        difficulty,
        energySpent: energyCost,
        skillMaterials: { [material as SkillMaterialType]: amount },
      },
    };
  }

  if (type === 'shared') {
    if (material === 'points') {
      const points = amount * 10;
      addPoints(points);
      return {
        success: true,
        result: {
          type,
          difficulty,
          energySpent: energyCost,
          pointsReward: points,
        },
      };
    }

    const bookTier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    const bookCount = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1 : 2;
    addBooks(bookTier, bookCount);
    return {
      success: true,
      result: {
        type,
        difficulty,
        energySpent: energyCost,
        booksReward: { [bookTier]: bookCount },
      },
    };
  }

  addUncapMaterial(material as UncapMaterialType, amount);
  return {
    success: true,
    result: {
      type,
      difficulty,
      energySpent: energyCost,
      uncapMaterials: { [material as UncapMaterialType]: amount },
    },
  };
};
