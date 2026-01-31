export type Rarity = '⭐' | '⭐⭐' | '⭐⭐⭐' | '⭐⭐⭐⭐' | '⭐⭐⭐⭐⭐';

// Skills
export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'active' | 'passive'; // active = special ability, passive = always active
  effect: string; // description of the effect
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
  duplicateCount: number; // how many times this character was already owned
}

export interface GachaCurrency {
  primogems: number; // premium currency (paid)
  freeGems: number; // free currency (earned from game)
  wishes: number; // gacha tickets
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
      description: 'A powerful calculated attack',
      icon: '⚡',
      type: 'active',
      effect: 'Deal 1.5x damage to a single enemy. Cooldown: 2 turns',
    },
  ],
};
