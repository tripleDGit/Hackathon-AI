import { SkillMaterialType, UncapMaterialType, BookTier } from '@/types/character.types';

export type DungeonType = 'skill' | 'ascension' | 'shared';
export type DungeonDifficulty = 'easy' | 'medium' | 'hard';
export type SharedRewardType = 'points' | 'books';

export interface DungeonRunResult {
  type: DungeonType;
  difficulty: DungeonDifficulty;
  energySpent: number;
  skillMaterials?: Partial<Record<SkillMaterialType, number>>;
  uncapMaterials?: Partial<Record<UncapMaterialType, number>>;
  pointsReward?: number;
  booksReward?: Partial<Record<BookTier, number>>;
}

export interface DungeonBattle {
  currentRound: number;
  totalRounds: number;
  correctAnswers: number;
  incorrectAnswers: number;
  wrongAnswerIndices: number[];
  status: 'in-progress' | 'won' | 'lost';
}

