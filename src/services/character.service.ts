import { Character, CharacterInventory, GachaResult, Rarity, GachaCurrency, BookInventory, BookTier, BOOK_DATA, UncapMaterialType, UncapMaterialInventory, CHARACTER_SKILLS, SkillMaterialInventory, SkillMaterialType, SKILL_MATERIALS, Skill, WeeklyBossMaterialInventory, WeeklyBossMaterialType, SkillUpgradeCost, WEEKLY_BOSS_MATERIALS, GachaBanner, GachaHistoryEntry } from '@/types/character.types';
import { ConstellationItemInventory, CHARACTER_CONSTELLATIONS } from '@/types/constellation.types';
import { loadUserProgress, saveUserProgress } from '@/services/missions.service';
import { isDevModeEnabled } from '@/services/devMode.service';

const getSkillKeyFromName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const ensureSkillLevels = (character: Character, skills: Skill[]): { character: Character; updated: boolean } => {
  if (skills.length === 0) {
    return { character, updated: false };
  }

  const currentLevels = character.skillLevels ?? {};
  let updated = false;
  const nextLevels: Record<string, number> = { ...currentLevels };

  skills.forEach((skill) => {
    if (nextLevels[skill.id] == null) {
      nextLevels[skill.id] = 1;
      updated = true;
    }
  });

  if (!updated && character.skillLevels) {
    return { character, updated: false };
  }

  return { character: { ...character, skillLevels: nextLevels }, updated: true };
};

const hydrateInventorySkills = (inventory: CharacterInventory): { inventory: CharacterInventory; updated: boolean } => {
  let updated = false;
  const characters = inventory.characters.map((character) => {
    let char = character;
    
    // Ensure constellation level exists
    if (char.constellationLevel === undefined) {
      char = { ...char, constellationLevel: 0 };
      updated = true;
    }
    
    // Ensure baseCharacterId exists for older characters
    if (!char.baseCharacterId && char.id.includes('_')) {
      const parts = char.id.split('_');
      if (parts.length >= 2) {
        char = { ...char, baseCharacterId: `${parts[0]}_${parts[1]}` };
        updated = true;
      }
    }
    
    if (char.skills && char.skills.length > 0) {
      const ensured = ensureSkillLevels(char, char.skills);
      if (ensured.updated) {
        updated = true;
      }
      return ensured.character;
    }

    const skillKey = getSkillKeyFromName(char.name);
    const skills = CHARACTER_SKILLS[skillKey];
    if (skills) {
      updated = true;
      const ensured = ensureSkillLevels({ ...char, skills }, skills);
      if (ensured.updated) {
        updated = true;
      }
      return ensured.character;
    }

    return char;
  });

  if (!updated) {
    return { inventory, updated };
  }

  return { inventory: { ...inventory, characters }, updated };
};

// Dev-exclusive characters (not in regular gacha pool)
const DEV_CHARACTER_POOL: Character[] = [
  {
    id: 'char_007',
    name: 'Memoria',
    rarity: '⭐⭐⭐⭐⭐',
    level: 1,
    ascensionLevel: 0,
    experience: 0,
    nextLevelExp: 1000,
    baseHP: 240,
    baseAttack: 32,
    baseDefense: 28,
    baseSpeed: 34,
    icon: '🧠',
    description: 'Master of visual recall. Excels against Memory Grid bosses.',
    favorability: 0,
    uncapMaterial: 'essence',
    skills: CHARACTER_SKILLS['memoria'],
  },
  {
    id: 'char_008',
    name: 'Sequenzia',
    rarity: '⭐⭐⭐⭐⭐',
    level: 1,
    ascensionLevel: 0,
    experience: 0,
    nextLevelExp: 1000,
    baseHP: 235,
    baseAttack: 34,
    baseDefense: 26,
    baseSpeed: 36,
    icon: '🔢',
    description: 'Sequence savant. Dominates Memory Sequence bosses.',
    favorability: 0,
    uncapMaterial: 'fragment',
    skills: CHARACTER_SKILLS['sequenzia'],
  },
  {
    id: 'char_009',
    name: 'Blocksmith',
    rarity: '⭐⭐⭐⭐⭐',
    level: 1,
    ascensionLevel: 0,
    experience: 0,
    nextLevelExp: 1000,
    baseHP: 250,
    baseAttack: 30,
    baseDefense: 30,
    baseSpeed: 28,
    icon: '🧩',
    description: 'Block strategist. Built to counter Block Blast bosses.',
    favorability: 0,
    uncapMaterial: 'tome',
    skills: CHARACTER_SKILLS['blocksmith'],
  },
];

// Template characters for gacha pool
const CHARACTER_POOL: Character[] = [
  {
    id: 'char_001',
    name: 'Mathematica',
    rarity: '⭐⭐⭐⭐⭐',
    level: 1,
    ascensionLevel: 0,
    experience: 0,
    nextLevelExp: 1000,
    baseHP: 250,
    baseAttack: 35,
    baseDefense: 25,
    baseSpeed: 30,
    icon: '🧙‍♀️',
    spriteUrl: 'https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=400&h=400&fit=crop',
    description: 'Master of Mathematics. Expert in solving complex equations.',
    favorability: 0,
    uncapMaterial: 'crystal',
    skills: CHARACTER_SKILLS['mathematica'],
  },
  {
    id: 'char_002',
    name: 'Arithmetica',
    rarity: '⭐⭐⭐⭐',
    level: 1,
    ascensionLevel: 0,
    experience: 0,
    nextLevelExp: 800,
    baseHP: 200,
    baseAttack: 28,
    baseDefense: 20,
    baseSpeed: 25,
    icon: '🤓',
    description: 'Quick calculator. Specializes in arithmetic operations.',
    favorability: 0,
    uncapMaterial: 'essence',
  },
  {
    id: 'char_003',
    name: 'Geometry',
    rarity: '⭐⭐⭐⭐',
    level: 1,
    ascensionLevel: 0,
    experience: 0,
    nextLevelExp: 800,
    baseHP: 180,
    baseAttack: 32,
    baseDefense: 28,
    baseSpeed: 20,
    icon: '📐',
    description: 'Shape master. Excellent in geometric calculations.',
    favorability: 0,
    uncapMaterial: 'fragment',
  },
  {
    id: 'char_004',
    name: 'Algebra',
    rarity: '⭐⭐⭐',
    level: 1,
    ascensionLevel: 0,
    experience: 0,
    nextLevelExp: 600,
    baseHP: 150,
    baseAttack: 22,
    baseDefense: 18,
    baseSpeed: 22,
    icon: '📊',
    description: 'Variable solver. Good at balancing equations.',
    favorability: 0,
    uncapMaterial: 'tome',
  },
  {
    id: 'char_005',
    name: 'Counter',
    rarity: '⭐⭐⭐',
    level: 1,
    ascensionLevel: 0,
    experience: 0,
    nextLevelExp: 600,
    baseHP: 140,
    baseAttack: 20,
    baseDefense: 15,
    baseSpeed: 26,
    icon: '🔢',
    description: 'Fast thinker. Loves counting and sequences.',
    favorability: 0,
    uncapMaterial: 'rune',
  },
  {
    id: 'char_006',
    name: 'Novice Student',
    rarity: '⭐',
    level: 1,
    ascensionLevel: 0,
    experience: 0,
    nextLevelExp: 400,
    baseHP: 100,
    baseAttack: 10,
    baseDefense: 8,
    baseSpeed: 12,
    icon: '👨‍🎓',
    description: 'A beginner in mathematics. Eager to learn!',
    favorability: 0,
    uncapMaterial: 'crystal',
  },
];

// Gacha rates
const GACHA_RATES = {
  fiveStarRate: 0.03,  // 3%
  fourStarRate: 0.10,  // 10%
  threeStarRate: 0.87, // 87%
};

const FEATURED_FIVE_STAR_SHARE = 0.5; // 50% of 5★ pulls go to featured
const GACHA_HISTORY_KEY = 'gacha_history';
const MAX_GACHA_HISTORY = 200;

const GACHA_BANNERS: GachaBanner[] = [
  {
    id: 'standard',
    name: 'Standard Banner',
    description: 'Permanent wish pool with core characters.',
    rates: GACHA_RATES,
  },
  {
    id: 'limited',
    name: 'Limited-Time Banner',
    description: 'Features a special 5★ with boosted chance.',
    rates: GACHA_RATES,
    featuredCharacterId: 'char_007',
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
  },
];

export const getGachaBanners = (): GachaBanner[] => GACHA_BANNERS;

export const getGachaHistory = (): GachaHistoryEntry[] => {
  const stored = localStorage.getItem(GACHA_HISTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as GachaHistoryEntry[];
  } catch {
    return [];
  }
};

const saveGachaHistory = (history: GachaHistoryEntry[]) => {
  localStorage.setItem(GACHA_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_GACHA_HISTORY)));
};

const addGachaHistoryEntry = (entry: GachaHistoryEntry) => {
  const history = getGachaHistory();
  history.unshift(entry);
  saveGachaHistory(history);
};

const getBannerById = (bannerId: GachaBanner['id']): GachaBanner => {
  return GACHA_BANNERS.find((b) => b.id === bannerId) ?? GACHA_BANNERS[0];
};

const getBannerPool = (bannerId: GachaBanner['id']): Character[] => {
  if (bannerId === 'limited') {
    const featured = DEV_CHARACTER_POOL.find((c) => c.id === 'char_007');
    return featured ? [...CHARACTER_POOL, featured] : CHARACTER_POOL;
  }
  return CHARACTER_POOL;
};

export const getBannerPoolInfo = (bannerId: GachaBanner['id']) => {
  const banner = getBannerById(bannerId);
  const pool = getBannerPool(bannerId);

  const fiveStars = pool.filter((c) => c.rarity === '⭐⭐⭐⭐⭐');
  const fourStars = pool.filter((c) => c.rarity === '⭐⭐⭐⭐');
  const threeStars = pool.filter((c) => c.rarity === '⭐⭐⭐' || c.rarity === '⭐⭐' || c.rarity === '⭐');

  const fiveStarRate = banner.rates.fiveStarRate;
  const fourStarRate = banner.rates.fourStarRate;
  const threeStarRate = banner.rates.threeStarRate;

  const featuredId = banner.featuredCharacterId;
  const featuredFiveStarChance = featuredId ? fiveStarRate * FEATURED_FIVE_STAR_SHARE : 0;
  const nonFeaturedFiveStarChance = featuredId && fiveStars.length > 1
    ? (fiveStarRate - featuredFiveStarChance) / (fiveStars.length - 1)
    : fiveStars.length > 0
      ? fiveStarRate / fiveStars.length
      : 0;

  const perFourStarChance = fourStars.length > 0 ? fourStarRate / fourStars.length : 0;
  const perThreeStarChance = threeStars.length > 0 ? threeStarRate / threeStars.length : 0;

  const characters = pool.map((c) => {
    if (c.rarity === '⭐⭐⭐⭐⭐') {
      const isFeatured = featuredId === c.id;
      return {
        ...c,
        chance: isFeatured ? featuredFiveStarChance : nonFeaturedFiveStarChance,
        isFeatured,
      };
    }
    if (c.rarity === '⭐⭐⭐⭐') {
      return { ...c, chance: perFourStarChance, isFeatured: false };
    }
    return { ...c, chance: perThreeStarChance, isFeatured: false };
  });

  return { banner, characters };
};

export const getCharacterInventory = (): CharacterInventory => {
  const stored = localStorage.getItem('character_inventory');
  if (stored) {
    const parsed: CharacterInventory = JSON.parse(stored);
    const hydrated = hydrateInventorySkills(parsed);
    let nextInventory = hydrated.inventory;

    if (isDevModeEnabled()) {
      const ensured = ensureDevModeCharacters(nextInventory);
      nextInventory = ensured.inventory;
      if (ensured.updated) {
        saveCharacterInventory(nextInventory);
      }
    } else if (hydrated.updated) {
      saveCharacterInventory(nextInventory);
    }

    return nextInventory;
  }

  // Initialize with starter character (Mathematica with sprite)
  const starterChar: Character = {
    ...CHARACTER_POOL[0], // Mathematica instead of Novice Student
    id: `starter_${Date.now()}`,
    constellationLevel: 0,
    baseCharacterId: CHARACTER_POOL[0].id,
  };

  let inventory: CharacterInventory = {
    characters: [starterChar],
    activeCharacterId: starterChar.id,
  };

  if (isDevModeEnabled()) {
    inventory = ensureDevModeCharacters(inventory).inventory;
  }

  saveCharacterInventory(inventory);
  return inventory;
};

const ensureDevModeCharacters = (inventory: CharacterInventory): { inventory: CharacterInventory; updated: boolean } => {
  const devIds = new Set(['char_007', 'char_008', 'char_009']);
  const existingIds = new Set(inventory.characters.map((c) => c.baseCharacterId || c.id));
  const additions = DEV_CHARACTER_POOL.filter((character) => devIds.has(character.id) && !existingIds.has(character.id));

  if (additions.length === 0) {
    return { inventory, updated: false };
  }

  const timestamp = Date.now();
  const enhanced = additions.map((character, index) => ({
    ...character,
    id: `${character.id}_${timestamp}_${index}`,
    constellationLevel: 0,
    baseCharacterId: character.id,
  }));

  return {
    inventory: {
      ...inventory,
      characters: [...inventory.characters, ...enhanced],
    },
    updated: true,
  };
};

export const saveCharacterInventory = (inventory: CharacterInventory) => {
  localStorage.setItem('character_inventory', JSON.stringify(inventory));
};

// Cleanup function to remove duplicate characters and convert to constellation items
export const cleanupDuplicateCharacters = (): { removed: number; itemsAdded: number } => {
  const inventory = getCharacterInventory();
  const constInventory = getConstellationItemInventory();
  
  // Group characters by their base ID (name as fallback)
  const characterMap = new Map<string, Character[]>();
  
  inventory.characters.forEach(char => {
    const baseId = char.baseCharacterId || char.id.split('_').slice(0, 2).join('_') || char.name;
    const existing = characterMap.get(baseId) || [];
    existing.push(char);
    characterMap.set(baseId, existing);
  });
  
  // Keep only one character per base ID, convert others to constellation items
  const uniqueCharacters: Character[] = [];
  let removedCount = 0;
  let itemsAddedCount = 0;
  
  characterMap.forEach((chars, baseId) => {
    if (chars.length === 1) {
      uniqueCharacters.push(chars[0]);
      return;
    }
    
    // Keep the character with highest level/constellation/favorability
    const best = chars.reduce((prev, current) => {
      if (current.level > prev.level) return current;
      if (current.level === prev.level && current.constellationLevel > prev.constellationLevel) return current;
      if (current.level === prev.level && current.constellationLevel === prev.constellationLevel && current.favorability > prev.favorability) return current;
      return prev;
    });
    
    uniqueCharacters.push(best);
    
    // Convert duplicates to constellation items
    const duplicateCount = chars.length - 1;
    removedCount += duplicateCount;
    itemsAddedCount += duplicateCount;
    
    // Add constellation items for each duplicate
    const actualBaseId = best.baseCharacterId || best.id.split('_').slice(0, 2).join('_');
    constInventory[actualBaseId] = (constInventory[actualBaseId] || 0) + duplicateCount;
  });
  
  // Update inventories
  inventory.characters = uniqueCharacters;
  
  // If active character was removed, set first character as active
  if (!inventory.characters.find(c => c.id === inventory.activeCharacterId)) {
    if (inventory.characters.length > 0) {
      inventory.activeCharacterId = inventory.characters[0].id;
    }
  }
  
  saveCharacterInventory(inventory);
  saveConstellationItemInventory(constInventory);
  
  return { removed: removedCount, itemsAdded: itemsAddedCount };
};

export const getGachaCurrency = (): GachaCurrency => {
  const stored = localStorage.getItem('gacha_currency');
  if (stored) {
    return JSON.parse(stored);
  }

  const currency: GachaCurrency = {
    primogems: 0,
    freeGems: 300, // Starting gems from game points
    wishes: 0,
    constellationDust: 0,
  };

  saveGachaCurrency(currency);
  return currency;
};

export const saveGachaCurrency = (currency: GachaCurrency) => {
  localStorage.setItem('gacha_currency', JSON.stringify(currency));
};

// Constellation Item Inventory
export const getConstellationItemInventory = (): ConstellationItemInventory => {
  const stored = localStorage.getItem('constellation_item_inventory');
  if (stored) {
    return JSON.parse(stored);
  }
  return {};
};

export const saveConstellationItemInventory = (inventory: ConstellationItemInventory) => {
  localStorage.setItem('constellation_item_inventory', JSON.stringify(inventory));
};

export const addConstellationItem = (baseCharacterId: string, amount: number = 1) => {
  const inventory = getConstellationItemInventory();
  const charInventory = getCharacterInventory();
  
  // Check if character exists and is at C6
  const character = charInventory.characters.find(c => 
    (c.baseCharacterId || c.id) === baseCharacterId
  );
  
  if (character && character.constellationLevel >= 6) {
    // Convert to dust instead
    const currency = getGachaCurrency();
    const dustValue = 10; // Each excess constellation item = 10 dust
    currency.constellationDust = (currency.constellationDust || 0) + (dustValue * amount);
    saveGachaCurrency(currency);
    return;
  }
  
  inventory[baseCharacterId] = (inventory[baseCharacterId] || 0) + amount;
  saveConstellationItemInventory(inventory);
};

export const useConstellationItem = (characterId: string): { success: boolean; error?: string } => {
  const charInventory = getCharacterInventory();
  const character = charInventory.characters.find(c => c.id === characterId);
  
  if (!character) {
    return { success: false, error: 'Character not found' };
  }

  const baseId = character.baseCharacterId || character.id;
  const constInventory = getConstellationItemInventory();
  
  if (!constInventory[baseId] || constInventory[baseId] <= 0) {
    return { success: false, error: 'No constellation items available' };
  }

  if (character.constellationLevel >= 6) {
    return { success: false, error: 'Maximum constellation level reached' };
  }

  // Use the item
  constInventory[baseId] -= 1;
  saveConstellationItemInventory(constInventory);

  // Upgrade constellation
  character.constellationLevel += 1;
  saveCharacterInventory(charInventory);

  return { success: true };
};

// Convert constellation items to dust for C6 characters
export const convertConstellationItemToDust = (baseCharacterId: string, amount: number = 1): { success: boolean; dustGained: number } => {
  const constInventory = getConstellationItemInventory();
  
  if (!constInventory[baseCharacterId] || constInventory[baseCharacterId] < amount) {
    return { success: false, dustGained: 0 };
  }
  
  // Remove items
  constInventory[baseCharacterId] -= amount;
  if (constInventory[baseCharacterId] <= 0) {
    delete constInventory[baseCharacterId];
  }
  saveConstellationItemInventory(constInventory);
  
  // Add dust
  const currency = getGachaCurrency();
  const dustValue = 10; // Each constellation item = 10 dust
  const dustGained = dustValue * amount;
  currency.constellationDust = (currency.constellationDust || 0) + dustGained;
  saveGachaCurrency(currency);
  
  return { success: true, dustGained };
};

// Get constellation bonus multipliers
export const getConstellationBonuses = (character: Character): {
  hpMultiplier: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  speedMultiplier: number;
  skillLevelBonus: number;
} => {
  const baseId = character.baseCharacterId || character.id;
  const constellations = CHARACTER_CONSTELLATIONS[baseId];
  
  if (!constellations || character.constellationLevel === 0) {
    return { hpMultiplier: 1, attackMultiplier: 1, defenseMultiplier: 1, speedMultiplier: 1, skillLevelBonus: 0 };
  }

  let hpBonus = 0;
  let attackBonus = 0;
  let defenseBonus = 0;
  let speedBonus = 0;
  let skillLevelBonus = 0;

  // Apply bonuses from unlocked constellations
  for (let i = 0; i < character.constellationLevel; i++) {
    const perk = constellations[i];
    if (!perk) continue;

    // Parse effect to determine bonuses
    if (perk.effect.includes('HP')) {
      const match = perk.effect.match(/\+(\d+)%\s+HP/);
      if (match) hpBonus += parseInt(match[1]) / 100;
    }
    if (perk.effect.includes('Attack') || perk.effect.includes('ATK')) {
      const match = perk.effect.match(/\+(\d+)%\s+(Attack|ATK)/);
      if (match) attackBonus += parseInt(match[1]) / 100;
    }
    if (perk.effect.includes('Defense') || perk.effect.includes('DEF')) {
      const match = perk.effect.match(/\+(\d+)%\s+(Defense|DEF)/);
      if (match) defenseBonus += parseInt(match[1]) / 100;
    }
    if (perk.effect.includes('Speed') || perk.effect.includes('SPD')) {
      const match = perk.effect.match(/\+(\d+)%\s+(Speed|SPD)/);
      if (match) speedBonus += parseInt(match[1]) / 100;
    }
    if (perk.effect.includes('All stats') || perk.effect.includes('All Stats')) {
      const match = perk.effect.match(/\+(\d+)%\s+All\s+[Ss]tats/);
      if (match) {
        const bonus = parseInt(match[1]) / 100;
        hpBonus += bonus;
        attackBonus += bonus;
        defenseBonus += bonus;
        speedBonus += bonus;
      }
    }
    if (perk.effect.includes('Skill levels')) {
      const match = perk.effect.match(/\+(\d+)\s+Skill\s+levels/);
      if (match) skillLevelBonus += parseInt(match[1]);
    }
  }

  return {
    hpMultiplier: 1 + hpBonus,
    attackMultiplier: 1 + attackBonus,
    defenseMultiplier: 1 + defenseBonus,
    speedMultiplier: 1 + speedBonus,
    skillLevelBonus,
  };
};

// Skill material inventory management
export const getSkillMaterialInventory = (): SkillMaterialInventory => {
  const stored = localStorage.getItem('skill_material_inventory');
  if (stored) {
    return JSON.parse(stored);
  }

  const inventory: SkillMaterialInventory = {
    spark: 6,
    core: 2,
    prism: 0,
  };

  saveSkillMaterialInventory(inventory);
  return inventory;
};

export const saveSkillMaterialInventory = (inventory: SkillMaterialInventory) => {
  localStorage.setItem('skill_material_inventory', JSON.stringify(inventory));
};

export const addSkillMaterials = (materials: Partial<SkillMaterialInventory>) => {
  const inventory = getSkillMaterialInventory();
  const updated: SkillMaterialInventory = {
    spark: inventory.spark + (materials.spark ?? 0),
    core: inventory.core + (materials.core ?? 0),
    prism: inventory.prism + (materials.prism ?? 0),
  };
  saveSkillMaterialInventory(updated);
};

export const getWeeklyBossMaterialInventory = (): WeeklyBossMaterialInventory => {
  const stored = localStorage.getItem('weekly_boss_material_inventory');
  if (stored) {
    return JSON.parse(stored) as WeeklyBossMaterialInventory;
  }

  const inventory: WeeklyBossMaterialInventory = {
    sigil: 0,
    memory: 0,
    crown: 0,
    glyph: 0,
  };

  saveWeeklyBossMaterialInventory(inventory);
  return inventory;
};

export const saveWeeklyBossMaterialInventory = (inventory: WeeklyBossMaterialInventory) => {
  localStorage.setItem('weekly_boss_material_inventory', JSON.stringify(inventory));
};

export const addWeeklyBossMaterial = (material: WeeklyBossMaterialType, amount: number) => {
  const inventory = getWeeklyBossMaterialInventory();
  inventory[material] += amount;
  saveWeeklyBossMaterialInventory(inventory);
};

// Add premium currency (primogems)
export const addPrimogems = (amount: number) => {
  const currency = getGachaCurrency();
  currency.primogems += amount;
  saveGachaCurrency(currency);
};

// Book inventory management
export const getBookInventory = (): BookInventory => {
  const stored = localStorage.getItem('book_inventory');
  if (stored) {
    return JSON.parse(stored);
  }

  const inventory: BookInventory = {
    tier1: 5, // Start with 5 tier 1 books
    tier2: 0,
    tier3: 0,
  };

  saveBookInventory(inventory);
  return inventory;
};

export const saveBookInventory = (inventory: BookInventory) => {
  localStorage.setItem('book_inventory', JSON.stringify(inventory));
};

// Uncap Material Inventory Management
export const getUncapMaterialInventory = (): UncapMaterialInventory => {
  const stored = localStorage.getItem('uncap_material_inventory');
  if (stored) {
    return JSON.parse(stored);
  }

  const inventory: UncapMaterialInventory = {
    crystal: 10, // Start with some materials for testing
    essence: 10,
    fragment: 10,
    tome: 10,
    rune: 10,
  };

  saveUncapMaterialInventory(inventory);
  return inventory;
};

export const saveUncapMaterialInventory = (inventory: UncapMaterialInventory) => {
  localStorage.setItem('uncap_material_inventory', JSON.stringify(inventory));
};

export const addUncapMaterial = (materialType: UncapMaterialType, amount: number) => {
  const inventory = getUncapMaterialInventory();
  inventory[materialType] += amount;
  saveUncapMaterialInventory(inventory);
};

// Get level cap based on ascension level
export const getLevelCap = (ascensionLevel: number): number => {
  // Level caps: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
  return (ascensionLevel + 1) * 10;
};

// Skill level cap based on character level cap
export const getMaxSkillLevel = (character: Character): number => {
  const levelCap = getLevelCap(character.ascensionLevel);
  return Math.max(1, Math.min(10, Math.floor(levelCap / 10)));
};

export const getSkillLevel = (character: Character, skillId: string): number => {
  return character.skillLevels?.[skillId] ?? 1;
};

export const getSkillUpgradeCost = (skill: Skill, nextLevel: number): SkillUpgradeCost => {
  let amount = 1;
  if (nextLevel === 10) {
    amount = 2;
  } else if (nextLevel === 9) {
    amount = 1;
  } else if (nextLevel <= 3) {
    amount = 2 + nextLevel;
  } else if (nextLevel <= 6) {
    amount = 1 + (nextLevel - 3);
  } else {
    amount = 1 + (nextLevel - 6);
  }

  if (skill.requiredWeeklyMaterial) {
    return { materialType: 'weekly', material: skill.requiredWeeklyMaterial, amount };
  }

  const material: SkillMaterialType = nextLevel <= 3 ? 'spark' : nextLevel <= 6 ? 'core' : 'prism';
  return { materialType: 'skill', material, amount };
};

export const levelUpSkill = (characterId: string, skillId: string): { success: boolean; error?: string } => {
  const inventory = getCharacterInventory();
  const characterIndex = inventory.characters.findIndex((c) => c.id === characterId);
  if (characterIndex === -1) {
    return { success: false, error: 'Character not found' };
  }

  const character = inventory.characters[characterIndex];
  const maxSkillLevel = getMaxSkillLevel(character);
  const currentLevel = getSkillLevel(character, skillId);
  const skill = character.skills?.find((entry) => entry.id === skillId);
  if (!skill) {
    return { success: false, error: 'Skill not found' };
  }

  if (currentLevel >= maxSkillLevel) {
    return { success: false, error: `Skill level capped at Lv.${maxSkillLevel} for current ascension` };
  }

  const nextLevel = currentLevel + 1;
  const cost = getSkillUpgradeCost(skill, nextLevel);
  if (cost.materialType === 'skill') {
    const materials = getSkillMaterialInventory();
    if (materials[cost.material] < cost.amount) {
      return { success: false, error: `Need ${cost.amount} ${SKILL_MATERIALS[cost.material].name}` };
    }

    const updatedMaterials: SkillMaterialInventory = {
      ...materials,
      [cost.material]: materials[cost.material] - cost.amount,
    };
    saveSkillMaterialInventory(updatedMaterials);
  } else {
    const weeklyMaterials = getWeeklyBossMaterialInventory();
    if (weeklyMaterials[cost.material] < cost.amount) {
      return { success: false, error: `Need ${cost.amount} ${WEEKLY_BOSS_MATERIALS[cost.material].name}` };
    }
    weeklyMaterials[cost.material] -= cost.amount;
    saveWeeklyBossMaterialInventory(weeklyMaterials);
  }

  const updatedLevels = { ...(character.skillLevels ?? {}) };
  updatedLevels[skillId] = nextLevel;
  inventory.characters[characterIndex] = { ...character, skillLevels: updatedLevels };
  saveCharacterInventory(inventory);

  return { success: true };
};

// Get uncap material requirements for next ascension
export const getUncapRequirements = (ascensionLevel: number, rarity: Rarity): number => {
  const baseAmount = 5;
  const rarityMultiplier = rarity.length; // 1-5 based on stars
  const ascensionMultiplier = ascensionLevel + 1;
  return baseAmount * rarityMultiplier * ascensionMultiplier;
};

// Get uncap cost in points (based on rarity and ascension level)
export const getUncapCost = (ascensionLevel: number, rarity: string): number => {
  const baseAmount = 100;
  const rarityMultiplier = rarity.split('⭐').length - 1; // 1-5 based on stars
  const ascensionMultiplier = ascensionLevel + 1;
  return baseAmount * rarityMultiplier * ascensionMultiplier;
};

// Check if character is at level cap and needs uncapping
export const isAtLevelCap = (character: Character): boolean => {
  const cap = getLevelCap(character.ascensionLevel);
  return character.level >= cap;
};

// Uncap (ascend) a character
export const uncapCharacter = (characterId: string): boolean => {
  const inventory = getCharacterInventory();
  const materialInventory = getUncapMaterialInventory();
  
  const character = inventory.characters.find(c => c.id === characterId);
  if (!character) {
    return false;
  }

  // Check if already at max ascension (100 = 9 ascensions)
  if (character.ascensionLevel >= 9) {
    return false;
  }

  // Check if at level cap
  if (!isAtLevelCap(character)) {
    return false;
  }

  // Get required materials
  const requiredAmount = getUncapRequirements(character.ascensionLevel, character.rarity);
  const materialType = character.uncapMaterial;

  // Check if we have enough materials
  if (materialInventory[materialType] < requiredAmount) {
    return false;
  }

  // Check if we have enough points
  const userProgress = loadUserProgress();
  const cost = getUncapCost(character.ascensionLevel, character.rarity);
  if (userProgress.totalPoints < cost) {
    return false; // Insufficient points
  }

  // Deduct points
  userProgress.totalPoints -= cost;
  saveUserProgress(userProgress);

  // Deduct materials
  materialInventory[materialType] -= requiredAmount;
  saveUncapMaterialInventory(materialInventory);

  // Ascend character
  character.ascensionLevel += 1;
  
  saveCharacterInventory(inventory);

  return true;
};

// Add books as rewards
export const addBooks = (tier: BookTier, count: number) => {
  const inventory = getBookInventory();
  
  if (tier === 1) inventory.tier1 += count;
  else if (tier === 2) inventory.tier2 += count;
  else if (tier === 3) inventory.tier3 += count;
  
  saveBookInventory(inventory);
};

// Developer resource functions
export const grantDevResources = (type: 'books' | 'gems' | 'materials' | 'all') => {
  if (type === 'books' || type === 'all') {
    const inventory = getBookInventory();
    inventory.tier1 += 50;
    inventory.tier2 += 30;
    inventory.tier3 += 15;
    saveBookInventory(inventory);
  }
  
  if (type === 'gems' || type === 'all') {
    const currency = getGachaCurrency();
    currency.freeGems += 5000;
    currency.primogems += 1000;
    currency.wishes += 10;
    saveGachaCurrency(currency);
  }
  
  if (type === 'materials' || type === 'all') {
    const skillMaterials = getSkillMaterialInventory();
    skillMaterials.spark += 100;
    skillMaterials.core += 50;
    skillMaterials.prism += 25;
    saveSkillMaterialInventory(skillMaterials);
    
    const uncapMaterials = getUncapMaterialInventory();
    uncapMaterials.crystal += 50;
    uncapMaterials.essence += 50;
    uncapMaterials.fragment += 50;
    uncapMaterials.tome += 50;
    uncapMaterials.rune += 50;
    saveUncapMaterialInventory(uncapMaterials);
    
    const weeklyMaterials = getWeeklyBossMaterialInventory();
    weeklyMaterials.sigil += 20;
    weeklyMaterials.memory += 20;
    weeklyMaterials.crown += 20;
    weeklyMaterials.glyph += 20;
    saveWeeklyBossMaterialInventory(weeklyMaterials);
  }
};

// Get book cost in points
export const getBookCost = (bookTier: BookTier): number => {
  if (bookTier === 1) return 10;  // Basic book: 10 points
  if (bookTier === 2) return 25;  // Advanced book: 25 points
  return 50;  // Expert book: 50 points
};

// Use a book to level up a character
export const useBook = (characterId: string, bookTier: BookTier): boolean => {
  const inventory = getBookInventory();
  const charInventory = getCharacterInventory();
  const character = charInventory.characters.find(c => c.id === characterId);
  
  if (!character) {
    return false;
  }
  
  // First, fix any stuck characters to ensure level state is correct
  fixStuckCharacterLevels();
  
  // Check if we have the book
  const bookCount = bookTier === 1 ? inventory.tier1 : bookTier === 2 ? inventory.tier2 : inventory.tier3;
  if (bookCount <= 0) {
    return false;
  }
  
  // Check if character is at level cap with full XP - can't use books
  const levelCap = getLevelCap(character.ascensionLevel);
  if (character.level >= levelCap && character.experience >= character.nextLevelExp) {
    return false; // Can't use books when at cap with full XP
  }
  
  // Check if we have enough points
  const userProgress = loadUserProgress();
  const cost = getBookCost(bookTier);
  if (userProgress.totalPoints < cost) {
    return false; // Insufficient points
  }
  
  // Deduct points
  userProgress.totalPoints -= cost;
  saveUserProgress(userProgress);
  
  // Deduct the book
  if (bookTier === 1) inventory.tier1 -= 1;
  else if (bookTier === 2) inventory.tier2 -= 1;
  else if (bookTier === 3) inventory.tier3 -= 1;
  
  saveBookInventory(inventory);
  
  // Add XP to character
  const expAmount = BOOK_DATA[bookTier].experience;
  gainCharacterExp(characterId, expAmount);
  
  return true;
};

// Add game points to free gems (1 point = 1 gem)
export const addGamePointsAsGems = (points: number) => {
  const currency = getGachaCurrency();
  currency.freeGems += points;
  saveGachaCurrency(currency);
};

// Perform a single gacha pull
export const performGachaPull = (): GachaResult => {
  return performGachaPullForBanner('standard');
};

export const performGachaPullForBanner = (bannerId: GachaBanner['id']): GachaResult => {
  const currency = getGachaCurrency();
  const inventory = getCharacterInventory();
  const banner = getBannerById(bannerId);
  const pool = getBannerPool(bannerId);

  // Cost: 160 gems per pull (or 1 wish if you have it)
  if (currency.freeGems < 160 && currency.wishes === 0) {
    throw new Error('Insufficient gems or wishes');
  }

  if (currency.wishes > 0) {
    currency.wishes -= 1;
  } else {
    currency.freeGems -= 160;
  }

  // Determine rarity
  const rng = Math.random();
  let selectedRarity: Rarity;

  if (rng < banner.rates.fiveStarRate) {
    selectedRarity = '⭐⭐⭐⭐⭐';
  } else if (rng < banner.rates.fiveStarRate + banner.rates.fourStarRate) {
    selectedRarity = '⭐⭐⭐⭐';
  } else {
    selectedRarity = '⭐⭐⭐';
  }

  // Get random character from selected rarity tier (with featured boost)
  let pulledCharTemplate: Character | undefined;
  const availableCharacters = pool.filter(c => c.rarity === selectedRarity);

  if (selectedRarity === '⭐⭐⭐⭐⭐' && banner.featuredCharacterId) {
    const featured = availableCharacters.find(c => c.id === banner.featuredCharacterId);
    const nonFeatured = availableCharacters.filter(c => c.id !== banner.featuredCharacterId);
    if (featured && Math.random() < FEATURED_FIVE_STAR_SHARE) {
      pulledCharTemplate = featured;
    } else if (nonFeatured.length > 0) {
      pulledCharTemplate = nonFeatured[Math.floor(Math.random() * nonFeatured.length)];
    }
  }

  if (!pulledCharTemplate) {
    pulledCharTemplate = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
  }

  // Check if character already exists (by baseCharacterId)
  const existingCharacter = inventory.characters.find(c => 
    (c.baseCharacterId || c.id) === pulledCharTemplate.id
  );
  const isNew = !existingCharacter;
  const isDuplicate = !!existingCharacter;

  let resultCharacter: Character;
  let constellationItem: string | undefined;

  if (isNew) {
    // New character - add to inventory
    const newCharacter: Character = {
      ...pulledCharTemplate,
      id: `${pulledCharTemplate.id}_${Date.now()}`,
      constellationLevel: 0,
      baseCharacterId: pulledCharTemplate.id,
    };
    inventory.characters.push(newCharacter);
    resultCharacter = newCharacter;
    
    // Set as active if this is the first character
    if (inventory.characters.length === 1) {
      inventory.activeCharacterId = newCharacter.id;
    }
  } else {
    // Duplicate - convert to constellation item
    addConstellationItem(pulledCharTemplate.id, 1);
    resultCharacter = existingCharacter;
    constellationItem = `${pulledCharTemplate.name}'s Constellation`;
  }

  saveCharacterInventory(inventory);
  saveGachaCurrency(currency);

  addGachaHistoryEntry({
    id: `pull_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    bannerId,
    characterId: pulledCharTemplate.id,
    characterName: pulledCharTemplate.name,
    rarity: pulledCharTemplate.rarity,
    isNew,
  });

  return {
    character: resultCharacter,
    isNew,
    isDuplicate,
    constellationItem,
  };
};

// Level up a character with experience
export const gainCharacterExp = (characterId: string, expAmount: number) => {
  const inventory = getCharacterInventory();
  const character = inventory.characters.find(c => c.id === characterId);

  if (!character) {
    throw new Error('Character not found');
  }

  const levelCap = getLevelCap(character.ascensionLevel);

  character.experience += expAmount;

  // Check for level up (respecting level cap)
  while (character.experience >= character.nextLevelExp && character.level < levelCap) {
    character.experience -= character.nextLevelExp;
    character.level += 1;
    
    // Exp requirement increases each level
    const expIncrease = 50 * character.level; // Progressive increase
    character.nextLevelExp = Math.floor(character.nextLevelExp + expIncrease);
  }

  // If at level cap and has excess XP, convert to books
  if (character.level >= levelCap && character.experience >= character.nextLevelExp) {
    const excessExp = character.experience;
    character.experience = 0; // Reset XP at cap
    
    // Convert excess XP to books based on character rarity
    const starCount = character.rarity.split('⭐').length - 1;
    let bookTier: BookTier;
    
    if (starCount >= 5) {
      bookTier = 3; // 5-star = tier 3 books
    } else if (starCount >= 4) {
      bookTier = 2; // 4-star = tier 2 books
    } else {
      bookTier = 1; // 3-star and below = tier 1 books
    }
    
    // Calculate how many books to give based on excess XP
    const bookExpValue = BOOK_DATA[bookTier].experience;
    const booksToGive = Math.floor(excessExp / bookExpValue);
    
    if (booksToGive > 0) {
      addBooks(bookTier, booksToGive);
    }
  }

  saveCharacterInventory(inventory);
  return character;
};

// Set active character
export const setActiveCharacter = (characterId: string) => {
  const inventory = getCharacterInventory();
  const character = inventory.characters.find(c => c.id === characterId);

  if (!character) {
    throw new Error('Character not found');
  }

  inventory.activeCharacterId = characterId;
  saveCharacterInventory(inventory);
};

// Get active character
export const getActiveCharacter = (): Character => {
  const inventory = getCharacterInventory();
  const activeCharacter = inventory.characters.find(c => c.id === inventory.activeCharacterId);

  if (!activeCharacter) {
    throw new Error('Active character not found');
  }

  return activeCharacter;
};

// Get character by ID
export const getCharacterById = (id: string): Character | undefined => {
  const inventory = getCharacterInventory();
  return inventory.characters.find(c => c.id === id);
};

// Calculate character stats at current level
export const getCharacterStats = (character: Character) => {
  const levelBonus = (character.level - 1) * 0.1; // 10% per level
  const constBonuses = getConstellationBonuses(character);
  
  return {
    hp: Math.floor(character.baseHP * (1 + levelBonus) * constBonuses.hpMultiplier),
    attack: Math.floor(character.baseAttack * (1 + levelBonus) * constBonuses.attackMultiplier),
    defense: Math.floor(character.baseDefense * (1 + levelBonus) * constBonuses.defenseMultiplier),
    speed: Math.floor(character.baseSpeed * (1 + levelBonus) * constBonuses.speedMultiplier),
  };
};

// Fix any characters that have XP >= nextLevelExp but haven't leveled up
export const fixStuckCharacterLevels = () => {
  const inventory = getCharacterInventory();
  let fixed = false;
  
  console.log('[Character Fix] Checking for stuck characters...');
  
  inventory.characters.forEach(character => {
    console.log(`[Character Fix] ${character.name}: Level ${character.level}, XP ${character.experience}/${character.nextLevelExp}, Cap: ${getLevelCap(character.ascensionLevel)}`);
    
    const levelCap = getLevelCap(character.ascensionLevel);
    
    // Process any pending level ups
    while (character.experience >= character.nextLevelExp && character.level < levelCap) {
      character.experience -= character.nextLevelExp;
      character.level += 1;
      fixed = true;
      
      console.log(`[Character Fix] ${character.name} leveled up to ${character.level}!`);
      
      // Exp requirement increases each level
      const expIncrease = 50 * character.level;
      character.nextLevelExp = Math.floor(character.nextLevelExp + expIncrease);
    }
    
    // Handle excess XP at level cap
    if (character.level >= levelCap && character.experience >= character.nextLevelExp) {
      const excessExp = character.experience;
      character.experience = 0;
      
      const starCount = character.rarity.split('⭐').length - 1;
      let bookTier: BookTier;
      
      if (starCount >= 5) {
        bookTier = 3;
      } else if (starCount >= 4) {
        bookTier = 2;
      } else {
        bookTier = 1;
      }
      
      const bookExpValue = BOOK_DATA[bookTier].experience;
      const booksToGive = Math.floor(excessExp / bookExpValue);
      
      if (booksToGive > 0) {
        addBooks(bookTier, booksToGive);
        fixed = true;
        console.log(`[Character Fix] ${character.name} converted ${excessExp} XP to ${booksToGive} tier ${bookTier} books`);
      }
    }
  });
  
  if (fixed) {
    saveCharacterInventory(inventory);
    console.log('[Character Fix] Characters fixed and saved!');
  } else {
    console.log('[Character Fix] No fixes needed.');
  }
  
  return fixed;
};
