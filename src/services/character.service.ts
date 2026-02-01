import { Character, CharacterInventory, GachaResult, Rarity, GachaCurrency, BookInventory, BookTier, BOOK_DATA, UncapMaterialType, UncapMaterialInventory, CHARACTER_SKILLS, SkillMaterialInventory, SkillMaterialType, SKILL_MATERIALS, Skill } from '@/types/character.types';
import { loadUserProgress, saveUserProgress } from '@/services/missions.service';

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
    if (character.skills && character.skills.length > 0) {
      const ensured = ensureSkillLevels(character, character.skills);
      if (ensured.updated) {
        updated = true;
      }
      return ensured.character;
    }

    const skillKey = getSkillKeyFromName(character.name);
    const skills = CHARACTER_SKILLS[skillKey];
    if (skills) {
      updated = true;
      const ensured = ensureSkillLevels({ ...character, skills }, skills);
      if (ensured.updated) {
        updated = true;
      }
      return ensured.character;
    }

    return character;
  });

  if (!updated) {
    return { inventory, updated };
  }

  return { inventory: { ...inventory, characters }, updated };
};

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
    spriteUrl: '/characters/mathematica.png',
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

export const getCharacterInventory = (): CharacterInventory => {
  const stored = localStorage.getItem('character_inventory');
  if (stored) {
    const parsed: CharacterInventory = JSON.parse(stored);
    const hydrated = hydrateInventorySkills(parsed);
    if (hydrated.updated) {
      saveCharacterInventory(hydrated.inventory);
    }
    return hydrated.inventory;
  }

  // Initialize with starter character (Mathematica with sprite)
  const starterChar: Character = {
    ...CHARACTER_POOL[0], // Mathematica instead of Novice Student
    id: `starter_${Date.now()}`,
  };

  const inventory: CharacterInventory = {
    characters: [starterChar],
    activeCharacterId: starterChar.id,
  };

  saveCharacterInventory(inventory);
  return inventory;
};

export const saveCharacterInventory = (inventory: CharacterInventory) => {
  localStorage.setItem('character_inventory', JSON.stringify(inventory));
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
  };

  saveGachaCurrency(currency);
  return currency;
};

export const saveGachaCurrency = (currency: GachaCurrency) => {
  localStorage.setItem('gacha_currency', JSON.stringify(currency));
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

export const getSkillUpgradeCost = (nextLevel: number): { material: SkillMaterialType; amount: number } => {
  if (nextLevel <= 3) {
    return { material: 'spark', amount: 2 + nextLevel };
  }
  if (nextLevel <= 6) {
    return { material: 'core', amount: 1 + (nextLevel - 3) };
  }
  return { material: 'prism', amount: 1 + (nextLevel - 6) };
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

  if (currentLevel >= maxSkillLevel) {
    return { success: false, error: `Skill level capped at Lv.${maxSkillLevel} for current ascension` };
  }

  const nextLevel = currentLevel + 1;
  const cost = getSkillUpgradeCost(nextLevel);
  const materials = getSkillMaterialInventory();
  if (materials[cost.material] < cost.amount) {
    return { success: false, error: `Need ${cost.amount} ${SKILL_MATERIALS[cost.material].name}` };
  }

  const updatedMaterials: SkillMaterialInventory = {
    ...materials,
    [cost.material]: materials[cost.material] - cost.amount,
  };
  saveSkillMaterialInventory(updatedMaterials);

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
  const currency = getGachaCurrency();
  const inventory = getCharacterInventory();

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

  if (rng < GACHA_RATES.fiveStarRate) {
    selectedRarity = '⭐⭐⭐⭐⭐';
  } else if (rng < GACHA_RATES.fiveStarRate + GACHA_RATES.fourStarRate) {
    selectedRarity = '⭐⭐⭐⭐';
  } else {
    selectedRarity = '⭐⭐⭐';
  }

  // Get random character from selected rarity tier
  const availableCharacters = CHARACTER_POOL.filter(c => c.rarity === selectedRarity);
  const pulledCharTemplate = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];

  // Check if character already exists
  const existingCharacter = inventory.characters.find(c => c.id === pulledCharTemplate.id);
  const isNew = !existingCharacter;
  const duplicateCount = existingCharacter ? 1 : 0;

  if (isNew) {
    // New character - add to inventory
    const newCharacter: Character = {
      ...pulledCharTemplate,
      id: `${pulledCharTemplate.id}_${inventory.characters.length}`,
    };
    inventory.characters.push(newCharacter);
    
    // Set as active if this is the first character
    if (inventory.characters.length === 1) {
      inventory.activeCharacterId = newCharacter.id;
    }
  } else {
    // Duplicate - increase level
    existingCharacter.level += 1;
    existingCharacter.favorability += 10;
  }

  saveCharacterInventory(inventory);
  saveGachaCurrency(currency);

  return {
    character: isNew ? { ...pulledCharTemplate, id: `${pulledCharTemplate.id}_${inventory.characters.length - 1}` } : existingCharacter!,
    isNew,
    duplicateCount,
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
  return {
    hp: Math.floor(character.baseHP * (1 + levelBonus)),
    attack: Math.floor(character.baseAttack * (1 + levelBonus)),
    defense: Math.floor(character.baseDefense * (1 + levelBonus)),
    speed: Math.floor(character.baseSpeed * (1 + levelBonus)),
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
