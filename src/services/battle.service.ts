import { Enemy, ENEMY_POOL, BOSS_POOL, BattleState, BattleAction } from '@/types/battle.types';
import { Character } from '@/types/character.types';
import { getCharacterStats } from './character.service';
import { getProgression, isBossLevel, getDifficultyForLevel } from './progression.service';

// Generate an enemy based on current progression level
export const generateEnemy = (level: number): Enemy => {
    const isBoss = isBossLevel(level);
    const difficulty = getDifficultyForLevel(level);

    if (isBoss) {
        // Generate a boss
        const bosses = BOSS_POOL.filter(b => b.difficulty === difficulty);
        const template = bosses.length > 0
            ? bosses[Math.floor(Math.random() * bosses.length)]
            : BOSS_POOL[0];

        // Scale boss stats based on level
        const levelMultiplier = 1 + ((level - 10) * 0.15); // 15% increase per 10 levels

        return {
            ...template,
            id: `boss_${Date.now()}_${Math.random()}`,
            level,
            hp: Math.floor(template.maxHp * levelMultiplier),
            maxHp: Math.floor(template.maxHp * levelMultiplier),
            attack: Math.floor(template.attack * levelMultiplier),
            defense: Math.floor(template.defense * levelMultiplier),
            speed: Math.floor(template.speed * levelMultiplier),
            isBoss: true,
        };
    } else {
        // Generate a regular enemy
        const availableEnemies = ENEMY_POOL.filter(e => e.difficulty === difficulty);
        const template = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];

        // Scale enemy stats based on level
        const levelMultiplier = 1 + ((level - 1) * 0.1); // 10% increase per level

        return {
            ...template,
            id: `enemy_${Date.now()}_${Math.random()}`,
            level,
            hp: Math.floor(template.maxHp * levelMultiplier),
            maxHp: Math.floor(template.maxHp * levelMultiplier),
            attack: Math.floor(template.attack * levelMultiplier),
            defense: Math.floor(template.defense * levelMultiplier),
            speed: Math.floor(template.speed * levelMultiplier),
            isBoss: false,
        };
    }
};

// Initialize battle state
export const initializeBattle = (character: Character): BattleState => {
    const stats = getCharacterStats(character);
    const progression = getProgression();
    const enemy = generateEnemy(progression.currentLevel);

    return {
        playerHp: stats.hp,
        playerMaxHp: stats.hp,
        enemy,
        turnCount: 0,
        lastAction: null,
        isPlayerTurn: true,
    };
};

// Calculate damage dealt by player
export const calculatePlayerDamage = (
    character: Character,
    enemy: Enemy,
    answerCorrect: boolean,
    timeBonus: number = 1
): number => {
    const stats = getCharacterStats(character);

    if (!answerCorrect) {
        return 0; // No damage if answer is wrong
    }

    // Base damage calculation
    const baseDamage = stats.attack - (enemy.defense * 0.5);
    const actualDamage = Math.max(baseDamage, 5); // Minimum 5 damage

    // Time bonus multiplier (faster = more damage)
    const finalDamage = Math.floor(actualDamage * timeBonus);

    return finalDamage;
};

// Calculate damage dealt by enemy
export const calculateEnemyDamage = (
    enemy: Enemy,
    character: Character,
    answerCorrect: boolean
): number => {
    if (answerCorrect) {
        return 0; // No damage if player answered correctly
    }

    const stats = getCharacterStats(character);

    // Base damage calculation
    const baseDamage = enemy.attack - (stats.defense * 0.5);
    const actualDamage = Math.max(baseDamage, 3); // Minimum 3 damage

    return Math.floor(actualDamage);
};

// Execute battle turn
export const executeBattleTurn = (
    battleState: BattleState,
    character: Character,
    answerCorrect: boolean,
    timeSpent: number
): { newState: BattleState; action: BattleAction } => {
    const newState = { ...battleState };
    let action: BattleAction;

    // Calculate time bonus (faster = better, max 2x at 3 seconds or less)
    const timeBonus = Math.min(2, Math.max(1, 10 / Math.max(timeSpent, 3)));

    if (answerCorrect) {
        // Player attacks
        const damage = calculatePlayerDamage(character, battleState.enemy, true, timeBonus);
        newState.enemy.hp = Math.max(0, newState.enemy.hp - damage);

        // Check for critical hit (10% chance)
        const isCritical = Math.random() < 0.1;

        action = {
            type: isCritical ? 'critical_hit' : 'player_attack',
            damage: isCritical ? damage * 2 : damage,
            message: isCritical
                ? `Critical hit! ${character.name} dealt ${damage * 2} damage!`
                : `${character.name} attacked for ${damage} damage!`,
        };

        if (isCritical) {
            newState.enemy.hp = Math.max(0, newState.enemy.hp - damage); // Extra damage
        }
    } else {
        // Enemy attacks
        const damage = calculateEnemyDamage(battleState.enemy, character, false);
        newState.playerHp = Math.max(0, newState.playerHp - damage);

        action = {
            type: 'enemy_attack',
            damage,
            message: `${battleState.enemy.name} attacked for ${damage} damage!`,
        };
    }

    newState.lastAction = action;
    newState.turnCount += 1;

    return { newState, action };
};

// Check if battle is over
export const isBattleOver = (battleState: BattleState): { over: boolean; playerWon: boolean } => {
    if (battleState.enemy.hp <= 0) {
        return { over: true, playerWon: true };
    }

    if (battleState.playerHp <= 0) {
        return { over: true, playerWon: false };
    }

    return { over: false, playerWon: false };
};

// Calculate battle rewards
export const calculateBattleRewards = (
    enemy: Enemy,
    playerWon: boolean
): { points: number; gems: number; primogems: number; books: number } => {
    if (!playerWon) {
        return { points: 0, gems: 0, primogems: 0, books: 0 };
    }

    const basePoints = enemy.level * 10;
    const baseGems = enemy.level * 5; // 5 gems per level
    const primogems = enemy.isBoss ? 50 : 0; // 50 premium currency for bosses
    const books = Math.floor(enemy.level / 2); // 1 book per 2 levels

    // Bosses give double rewards
    const multiplier = enemy.isBoss ? 2 : 1;

    return {
        points: basePoints * multiplier,
        gems: baseGems * multiplier,
        primogems,
        books
    };
};
