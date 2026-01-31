export interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  icon: string;
  spriteUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isBoss: boolean;
}

export interface BattleState {
  playerHp: number;
  playerMaxHp: number;
  enemy: Enemy;
  turnCount: number;
  lastAction: BattleAction | null;
  isPlayerTurn: boolean;
}

export interface BattleAction {
  type: 'player_attack' | 'enemy_attack' | 'player_miss' | 'critical_hit';
  damage: number;
  message: string;
}

export const ENEMY_POOL: Omit<Enemy, 'id' | 'hp' | 'isBoss'>[] = [
  // Easy enemies
  {
    name: 'Arithmetic Slime',
    level: 1,
    maxHp: 80,
    attack: 8,
    defense: 5,
    speed: 10,
    icon: '🟢',
    difficulty: 'easy',
  },
  {
    name: 'Number Goblin',
    level: 2,
    maxHp: 100,
    attack: 10,
    defense: 6,
    speed: 12,
    icon: '👹',
    difficulty: 'easy',
  },
  {
    name: 'Plus Sign',
    level: 1,
    maxHp: 70,
    attack: 7,
    defense: 4,
    speed: 15,
    icon: '➕',
    difficulty: 'easy',
  },
  // Medium enemies
  {
    name: 'Equation Warrior',
    level: 3,
    maxHp: 150,
    attack: 15,
    defense: 10,
    speed: 18,
    icon: '⚔️',
    difficulty: 'medium',
  },
  {
    name: 'Geometry Beast',
    level: 4,
    maxHp: 180,
    attack: 18,
    defense: 12,
    speed: 16,
    icon: '🔷',
    difficulty: 'medium',
  },
  {
    name: 'Division Dragon',
    level: 4,
    maxHp: 200,
    attack: 20,
    defense: 15,
    speed: 20,
    icon: '🐉',
    difficulty: 'medium',
  },
  // Hard enemies
  {
    name: 'Calculus Demon',
    level: 5,
    maxHp: 250,
    attack: 25,
    defense: 18,
    speed: 22,
    icon: '👿',
    difficulty: 'hard',
  },
  {
    name: 'Algebra Overlord',
    level: 6,
    maxHp: 300,
    attack: 30,
    defense: 20,
    speed: 25,
    icon: '👑',
    difficulty: 'hard',
  },
  {
    name: 'Trigonometry Titan',
    level: 6,
    maxHp: 350,
    attack: 35,
    defense: 25,
    speed: 28,
    icon: '⚡',
    difficulty: 'hard',
  },
];

// Boss enemies for every 10th level
export const BOSS_POOL: Omit<Enemy, 'id' | 'hp' | 'isBoss'>[] = [
  {
    name: 'The Grand Calculator',
    level: 10,
    maxHp: 500,
    attack: 40,
    defense: 30,
    speed: 35,
    icon: '🦹',
    difficulty: 'easy',
  },
  {
    name: 'Prime Number King',
    level: 20,
    maxHp: 800,
    attack: 60,
    defense: 45,
    speed: 50,
    icon: '👑',
    difficulty: 'medium',
  },
  {
    name: 'Infinity Empress',
    level: 30,
    maxHp: 1200,
    attack: 85,
    defense: 60,
    speed: 65,
    icon: '♾️',
    difficulty: 'hard',
  },
];
