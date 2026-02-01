export type Rarity = '⭐' | '⭐⭐' | '⭐⭐⭐' | '⭐⭐⭐⭐' | '⭐⭐⭐⭐⭐';

// Skills
export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'active' | 'passive'; // active = special ability, passive = always active
  effect: string; // description of the effect
  requiredWeeklyMaterial?: WeeklyBossMaterialType;
}

export interface Character {
  id: string;
  name: string;
  rarity: Rarity;
  level: number;
  ascensionLevel: number; // 0-9 (uncapped 9 times to reach level 100)
  experience: number;
  nextLevelExp: number;
  baseHP: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  icon: string; // emoji placeholder
  spriteUrl?: string; // optional custom sprite image
  description: string;
  favorability: number; // affection/bond level
  uncapMaterial: UncapMaterialType; // which material this character needs
  skills?: Skill[]; // optional character skills
  skillLevels?: Record<string, number>; // per-skill level tracking
  constellationLevel: number; // 0-6 constellation unlocks
  baseCharacterId?: string; // original character template ID for identifying duplicates
}

export interface CharacterInventory {
  characters: Character[];
  activeCharacterId: string; // currently selected character
}

export interface GachaPool {
  id: string;
  name: string;
  rates: {
    fiveStarRate: number; // 0.03 = 3%
    fourStarRate: number; // 0.1 = 10%
    threeStarRate: number; // 0.87 = 87%
  };
  featureCharacterId?: string; // featured character for this banner
  endDate: Date;
}

export interface GachaResult {
  character: Character;
  isNew: boolean; // true if first time pulling this character
  isDuplicate: boolean; // true if duplicate (converted to constellation)
  constellationItem?: string; // constellation item name if duplicate
}

export interface GachaBanner {
  id: 'standard' | 'limited';
  name: string;
  description: string;
  rates: {
    fiveStarRate: number;
    fourStarRate: number;
    threeStarRate: number;
  };
  featuredCharacterId?: string;
  endDate?: string; // ISO string for limited banners
}

export interface GachaHistoryEntry {
  id: string;
  timestamp: number;
  bannerId: GachaBanner['id'];
  characterId: string;
  characterName: string;
  rarity: Rarity;
  isNew: boolean;
}

export interface GachaCurrency {
  primogems: number; // premium currency (paid)
  freeGems: number; // free currency (earned from game)
  wishes: number; // gacha tickets
  constellationDust: number; // dust from excess constellation items
}

export type BookTier = 1 | 2 | 3;

export interface LevelUpBook {
  tier: BookTier;
  experience: number;
  name: string;
  icon: string;
}

export interface BookInventory {
  tier1: number; // count of tier 1 books
  tier2: number; // count of tier 2 books
  tier3: number; // count of tier 3 books
}

export const BOOK_DATA: Record<BookTier, LevelUpBook> = {
  1: { tier: 1, experience: 100, name: 'Basic Training Book', icon: '📘' },
  2: { tier: 2, experience: 250, name: 'Advanced Training Book', icon: '📗' },
  3: { tier: 3, experience: 500, name: 'Expert Training Book', icon: '📕' },
};

// Uncapping Materials
export type UncapMaterialType = 'crystal' | 'essence' | 'fragment' | 'tome' | 'rune';

export interface UncapMaterial {
  id: UncapMaterialType;
  name: string;
  icon: string;
  description: string;
}

export const UNCAP_MATERIALS: Record<UncapMaterialType, UncapMaterial> = {
  crystal: { id: 'crystal', name: 'Magic Crystal', icon: '💎', description: 'Crystallized magic power' },
  essence: { id: 'essence', name: 'Pure Essence', icon: '🌟', description: 'Concentrated magical essence' },
  fragment: { id: 'fragment', name: 'Ancient Fragment', icon: '🔮', description: 'Fragment of ancient power' },
  tome: { id: 'tome', name: 'Mystic Tome', icon: '📜', description: 'Book of forbidden knowledge' },
  rune: { id: 'rune', name: 'Elemental Rune', icon: '🗿', description: 'Rune of elemental power' },
};

export interface UncapMaterialInventory {
  crystal: number;
  essence: number;
  fragment: number;
  tome: number;
  rune: number;
}

// Skill Upgrade Materials
export type SkillMaterialType = 'spark' | 'core' | 'prism';

export interface SkillMaterial {
  id: SkillMaterialType;
  name: string;
  icon: string;
  description: string;
}

export const SKILL_MATERIALS: Record<SkillMaterialType, SkillMaterial> = {
  spark: { id: 'spark', name: 'Skill Spark', icon: '✨', description: 'Basic energy used to train skills' },
  core: { id: 'core', name: 'Skill Core', icon: '💠', description: 'Condensed power for advanced skills' },
  prism: { id: 'prism', name: 'Skill Prism', icon: '🔶', description: 'Rare prism for elite skill mastery' },
};

export interface SkillMaterialInventory {
  spark: number;
  core: number;
  prism: number;
}

export type SkillUpgradeCost =
  | { materialType: 'skill'; material: SkillMaterialType; amount: number }
  | { materialType: 'weekly'; material: WeeklyBossMaterialType; amount: number };

// Weekly Boss Materials
export type WeeklyBossMaterialType = 'sigil' | 'memory' | 'crown' | 'glyph';

export interface WeeklyBossMaterial {
  id: WeeklyBossMaterialType;
  name: string;
  icon: string;
  description: string;
}

export const WEEKLY_BOSS_MATERIALS: Record<WeeklyBossMaterialType, WeeklyBossMaterial> = {
  sigil: { id: 'sigil', name: 'Boss Sigil', icon: '🪙', description: 'Mark of a fallen weekly boss' },
  memory: { id: 'memory', name: 'Memory Shard', icon: '🧠', description: 'Fragment of a perfected memory' },
  crown: { id: 'crown', name: 'Crown of Will', icon: '👑', description: 'Rare proof of mastery' },
  glyph: { id: 'glyph', name: 'Block Glyph', icon: '🧩', description: 'Rune left by shattered blocks' },
};

export interface WeeklyBossMaterialInventory {
  sigil: number;
  memory: number;
  crown: number;
  glyph: number;
}

// Character Skills Database
export const CHARACTER_SKILLS: Record<string, Skill[]> = {
  'mathematica': [
    {
      id: 'calculation_mastery',
      name: 'Calculation Mastery',
      description: 'Enhances attack power based on level',
      icon: '🧮',
      type: 'passive',
      effect: 'Increases attack by 10% per level',
    },
    {
      id: 'formula_strike',
      name: 'Formula Strike',
      description: 'Unleash calculated power',
      icon: '⚡',
      type: 'active',
      effect: 'Grants focus on Memory bosses. Deals 15 damage on Block Blast. (3x per fight)',
    },
  ],
  'memoria': [
    {
      id: 'grid_focus',
      name: 'Grid Focus',
      description: 'Master of visual recall',
      icon: '🧠',
      type: 'passive',
      effect: 'Counters the Memory Grid boss with heightened recall.',
      requiredWeeklyMaterial: 'memory',
    },
    {
      id: 'pattern_lock',
      name: 'Pattern Lock',
      description: 'Lock in 3 tiles automatically',
      icon: '🧩',
      type: 'active',
      effect: 'Automatically solves 3 tiles in Memory Grid. (1x per fight)',
      requiredWeeklyMaterial: 'memory',
    },
  ],
  'sequenzia': [
    {
      id: 'sequence_mastery',
      name: 'Sequence Mastery',
      description: 'Exceptional at numeric sequences',
      icon: '🔢',
      type: 'passive',
      effect: 'Counters the Memory Sequence boss with sharper recall.',
      requiredWeeklyMaterial: 'crown',
    },
    {
      id: 'echo_chain',
      name: 'Echo Chain',
      description: 'Automatically repeat 2 numbers',
      icon: '🔗',
      type: 'active',
      effect: 'Automatically inputs 2 correct numbers in Memory Sequence. (1x per fight)',
      requiredWeeklyMaterial: 'crown',
    },
  ],
  'blocksmith': [
    {
      id: 'blast_planner',
      name: 'Blast Planner',
      description: 'Strategic block placement expert',
      icon: '🧱',
      type: 'passive',
      effect: 'Counters the Block Blast boss with smart placement.',
      requiredWeeklyMaterial: 'glyph',
    },
    {
      id: 'chain_reactor',
      name: 'Chain Reactor',
      description: 'Unleash 20 bonus damage',
      icon: '💥',
      type: 'active',
      effect: 'Deals 20 bonus damage in Block Blast. (1x per fight)',
      requiredWeeklyMaterial: 'glyph',
    },
  ],
};
