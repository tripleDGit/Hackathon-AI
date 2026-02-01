// Constellation System Types

export interface ConstellationPerk {
  level: number;
  name: string;
  description: string;
  icon: string;
  effect: string;
}

export interface ConstellationItemInventory {
  [characterBaseId: string]: number; // baseCharacterId -> count of constellation items
}

// Define constellation perks for each character
export const CHARACTER_CONSTELLATIONS: Record<string, ConstellationPerk[]> = {
  'char_001': [ // Mathematica
    { level: 1, name: 'Equation Solver', description: 'ATK +15%', icon: '➕', effect: '+15% Attack' },
    { level: 2, name: 'Quick Calculation', description: 'SPD +10%', icon: '⚡', effect: '+10% Speed' },
    { level: 3, name: 'Skill Enhancement', description: 'Skill levels +3', icon: '📈', effect: '+3 Skill levels' },
    { level: 4, name: 'Perfect Answer', description: 'HP +20%', icon: '❤️', effect: '+20% HP' },
    { level: 5, name: 'Master Formula', description: 'Skill levels +3', icon: '📊', effect: '+3 Skill levels' },
    { level: 6, name: 'Mathematical God', description: 'All stats +25%', icon: '👑', effect: '+25% All Stats' },
  ],
  'char_002': [ // Arithmetica
    { level: 1, name: 'Speed Calc', description: 'SPD +12%', icon: '⚡', effect: '+12% Speed' },
    { level: 2, name: 'Sharp Mind', description: 'ATK +10%', icon: '🎯', effect: '+10% Attack' },
    { level: 3, name: 'Skill Boost', description: 'Skill levels +3', icon: '📈', effect: '+3 Skill levels' },
    { level: 4, name: 'Endurance', description: 'HP +15%', icon: '💪', effect: '+15% HP' },
    { level: 5, name: 'Skill Master', description: 'Skill levels +3', icon: '📊', effect: '+3 Skill levels' },
    { level: 6, name: 'Perfect Arithmetic', description: 'All stats +20%', icon: '⭐', effect: '+20% All Stats' },
  ],
  'char_003': [ // Geometry
    { level: 1, name: 'Precise Angles', description: 'ATK +12%', icon: '📐', effect: '+12% Attack' },
    { level: 2, name: 'Shape Defense', description: 'DEF +15%', icon: '🛡️', effect: '+15% Defense' },
    { level: 3, name: 'Skill Boost', description: 'Skill levels +3', icon: '📈', effect: '+3 Skill levels' },
    { level: 4, name: 'Geometric Form', description: 'HP +18%', icon: '🔷', effect: '+18% HP' },
    { level: 5, name: 'Skill Master', description: 'Skill levels +3', icon: '📊', effect: '+3 Skill levels' },
    { level: 6, name: 'Perfect Geometry', description: 'All stats +20%', icon: '✨', effect: '+20% All Stats' },
  ],
  'char_004': [ // Algebra
    { level: 1, name: 'Variable Power', description: 'ATK +10%', icon: '✖️', effect: '+10% Attack' },
    { level: 2, name: 'Balance', description: 'DEF +12%', icon: '⚖️', effect: '+12% Defense' },
    { level: 3, name: 'Skill Boost', description: 'Skill levels +3', icon: '📈', effect: '+3 Skill levels' },
    { level: 4, name: 'Equation Shield', description: 'HP +15%', icon: '🛡️', effect: '+15% HP' },
    { level: 5, name: 'Skill Master', description: 'Skill levels +3', icon: '📊', effect: '+3 Skill levels' },
    { level: 6, name: 'Algebraic Mastery', description: 'All stats +18%', icon: '🌟', effect: '+18% All Stats' },
  ],
  'char_005': [ // Counter
    { level: 1, name: 'Quick Count', description: 'SPD +15%', icon: '⚡', effect: '+15% Speed' },
    { level: 2, name: 'Number Power', description: 'ATK +10%', icon: '💥', effect: '+10% Attack' },
    { level: 3, name: 'Skill Boost', description: 'Skill levels +3', icon: '📈', effect: '+3 Skill levels' },
    { level: 4, name: 'Stamina', description: 'HP +12%', icon: '❤️', effect: '+12% HP' },
    { level: 5, name: 'Skill Master', description: 'Skill levels +3', icon: '📊', effect: '+3 Skill levels' },
    { level: 6, name: 'Counting Master', description: 'All stats +18%', icon: '👑', effect: '+18% All Stats' },
  ],
  'char_006': [ // Novice Student
    { level: 1, name: 'Eager Learner', description: 'All stats +5%', icon: '📚', effect: '+5% All Stats' },
    { level: 2, name: 'Study Hard', description: 'All stats +5%', icon: '✏️', effect: '+5% All Stats' },
    { level: 3, name: 'Skill Boost', description: 'Skill levels +3', icon: '📈', effect: '+3 Skill levels' },
    { level: 4, name: 'Determination', description: 'All stats +8%', icon: '💪', effect: '+8% All Stats' },
    { level: 5, name: 'Skill Master', description: 'Skill levels +3', icon: '📊', effect: '+3 Skill levels' },
    { level: 6, name: 'Graduated Student', description: 'All stats +15%', icon: '🎓', effect: '+15% All Stats' },
  ],
  'char_007': [ // Memoria
    { level: 1, name: 'Perfect Recall', description: 'ATK +15%', icon: '🧠', effect: '+15% Attack' },
    { level: 2, name: 'Memory Shield', description: 'DEF +12%', icon: '🛡️', effect: '+12% Defense' },
    { level: 3, name: 'Skill Boost', description: 'Skill levels +3', icon: '📈', effect: '+3 Skill levels' },
    { level: 4, name: 'Mental Fortitude', description: 'HP +18%', icon: '💙', effect: '+18% HP' },
    { level: 5, name: 'Skill Master', description: 'Skill levels +3', icon: '📊', effect: '+3 Skill levels' },
    { level: 6, name: 'Memory God', description: 'All stats +25%, Grid boss damage x2', icon: '👑', effect: '+25% All Stats, x2 Memory Grid damage' },
  ],
  'char_008': [ // Sequenzia
    { level: 1, name: 'Sequence Flow', description: 'SPD +15%', icon: '🌊', effect: '+15% Speed' },
    { level: 2, name: 'Chain Reaction', description: 'ATK +12%', icon: '⛓️', effect: '+12% Attack' },
    { level: 3, name: 'Skill Boost', description: 'Skill levels +3', icon: '📈', effect: '+3 Skill levels' },
    { level: 4, name: 'Pattern Endurance', description: 'HP +18%', icon: '💚', effect: '+18% HP' },
    { level: 5, name: 'Skill Master', description: 'Skill levels +3', icon: '📊', effect: '+3 Skill levels' },
    { level: 6, name: 'Sequence Master', description: 'All stats +25%, Sequence boss damage x2', icon: '👑', effect: '+25% All Stats, x2 Memory Sequence damage' },
  ],
  'char_009': [ // Blocksmith
    { level: 1, name: 'Block Power', description: 'ATK +15%', icon: '🧱', effect: '+15% Attack' },
    { level: 2, name: 'Solid Build', description: 'DEF +15%', icon: '🏗️', effect: '+15% Defense' },
    { level: 3, name: 'Skill Boost', description: 'Skill levels +3', icon: '📈', effect: '+3 Skill levels' },
    { level: 4, name: 'Block Shield', description: 'HP +20%', icon: '💛', effect: '+20% HP' },
    { level: 5, name: 'Skill Master', description: 'Skill levels +3', icon: '📊', effect: '+3 Skill levels' },
    { level: 6, name: 'Block Master', description: 'All stats +25%, Block boss damage x2', icon: '👑', effect: '+25% All Stats, x2 Block Blast damage' },
  ],
};
