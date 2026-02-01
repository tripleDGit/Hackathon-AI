import { SkillMaterialType, UncapMaterialType } from '@/types/character.types';

export type DungeonType = 'skill' | 'ascension';
export type DungeonDifficulty = 'easy' | 'medium' | 'hard';

export interface DungeonRunResult {
  type: DungeonType;
  difficulty: DungeonDifficulty;
  energySpent: number;
  skillMaterials?: Partial<Record<SkillMaterialType, number>>;
  uncapMaterials?: Partial<Record<UncapMaterialType, number>>;
}
