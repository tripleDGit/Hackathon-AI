import { Skill } from '@/types/character.types';
import { getCharacterInventory } from './character.service';

export interface SkillUsageTracker {
  [sessionId: string]: {
    [characterId: string]: {
      [skillId: string]: number; // times used in this session
    };
  };
}

// Skill-specific usage limits per boss fight
const SKILL_USAGE_LIMITS: Record<string, number> = {
  // Regular skills: 3 uses per boss fight
  'formula_strike': 3,
  
  // Boss counter skills: 1 use per boss fight (powerful)
  'pattern_lock': 1,
  'echo_chain': 1,
  'chain_reactor': 1,
  
  // Default fallback
  'default': 2,
};

export const getSkillUsageLimit = (skillId: string): number => {
  return SKILL_USAGE_LIMITS[skillId] ?? SKILL_USAGE_LIMITS['default'];
};

export const getSkillUsageTracker = (): SkillUsageTracker => {
  const stored = sessionStorage.getItem('skill_usage_tracker'); // Use sessionStorage for per-session tracking
  if (stored) {
    return JSON.parse(stored);
  }
  return {};
};

export const saveSkillUsageTracker = (tracker: SkillUsageTracker) => {
  sessionStorage.setItem('skill_usage_tracker', JSON.stringify(tracker));
};

export const getSkillUsageRemaining = (sessionId: string, characterId: string, skillId: string): number => {
  const tracker = getSkillUsageTracker();
  const timesUsed = tracker[sessionId]?.[characterId]?.[skillId] ?? 0;
  const limit = getSkillUsageLimit(skillId);
  return Math.max(0, limit - timesUsed);
};

export const resetSkillUsageForSession = (sessionId: string) => {
  const tracker = getSkillUsageTracker();
  delete tracker[sessionId];
  saveSkillUsageTracker(tracker);
};

export const activateSkill = (sessionId: string, characterId: string, skill: Skill): { success: boolean; error?: string; message?: string } => {
  const inventory = getCharacterInventory();
  const character = inventory.characters.find(c => c.id === characterId);
  
  if (!character) {
    return { success: false, error: 'Character not found' };
  }
  
  if (skill.type !== 'active') {
    return { success: false, error: 'This is a passive skill' };
  }
  
  // Check usage limit
  const usageRemaining = getSkillUsageRemaining(sessionId, characterId, skill.id);
  if (usageRemaining <= 0) {
    return { success: false, error: `Skill already used (limit reached this fight)` };
  }
  
  // Record usage
  const tracker = getSkillUsageTracker();
  if (!tracker[sessionId]) {
    tracker[sessionId] = {};
  }
  if (!tracker[sessionId][characterId]) {
    tracker[sessionId][characterId] = {};
  }
  tracker[sessionId][characterId][skill.id] = (tracker[sessionId][characterId][skill.id] ?? 0) + 1;
  saveSkillUsageTracker(tracker);
  
  // Generate effect message based on skill
  const message = `✨ ${skill.name} activated! ${skill.effect}`;
  
  return { success: true, message };
};
