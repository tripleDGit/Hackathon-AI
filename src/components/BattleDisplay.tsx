import React, { useEffect, useState } from 'react';
import { Character } from '@/types/character.types';
import { BattleState, BattleAction } from '@/types/battle.types';
import { getCharacterStats } from '@/services/character.service';

interface BattleDisplayProps {
  character: Character;
  battleState: BattleState;
  lastAction: BattleAction | null;
  showActionAnimation?: boolean;
}

const BattleDisplay: React.FC<BattleDisplayProps> = ({
  character,
  battleState,
  lastAction,
  showActionAnimation = false,
}) => {
  const [animateAction, setAnimateAction] = useState(false);
  const stats = getCharacterStats(character);

  useEffect(() => {
    if (showActionAnimation && lastAction) {
      setAnimateAction(true);
      const timer = setTimeout(() => setAnimateAction(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [lastAction, showActionAnimation]);

  const playerHpPercent = (battleState.playerHp / battleState.playerMaxHp) * 100;
  const enemyHpPercent = (battleState.enemy.hp / battleState.enemy.maxHp) * 100;

  const getActionAnimationClass = () => {
    if (!animateAction || !lastAction) return '';
    
    switch (lastAction.type) {
      case 'player_attack':
        return 'animate-attack-right';
      case 'critical_hit':
        return 'animate-critical';
      case 'enemy_attack':
        return 'animate-attack-left';
      default:
        return '';
    }
  };

  return (
    <div className="bg-gradient-to-b from-purple-100 to-blue-100 rounded-xl p-6 border-2 border-purple-300 mb-6">
      {/* Battle Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-2">
          <span>⚔️</span>
          <span>{battleState.enemy.isBoss ? 'BOSS BATTLE!' : 'Battle in Progress!'}</span>
          <span>⚔️</span>
        </h3>
        <p className="text-sm text-gray-600">Level {battleState.enemy.level} - Turn {battleState.turnCount}</p>
      </div>

      {/* Battle Arena */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        {/* Player Side */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 mb-2">
            <div className={`text-6xl mb-2 ${getActionAnimationClass()}`}>
              {character.spriteUrl ? (
                <img
                  src={character.spriteUrl}
                  alt={character.name}
                  className="w-20 h-20 mx-auto object-contain"
                />
              ) : (
                <div>{character.icon}</div>
              )}
            </div>
            <div className="text-white font-bold">{character.name}</div>
            <div className="text-xs text-blue-200">Lv.{character.level}</div>
          </div>
          
          {/* Player HP Bar */}
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                playerHpPercent > 50
                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                  : playerHpPercent > 25
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                  : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${playerHpPercent}%` }}
            />
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-1">
            HP: {battleState.playerHp} / {battleState.playerMaxHp}
          </div>
          
          {/* Player Stats */}
          <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
            <div className="bg-white rounded px-2 py-1">
              <span className="text-orange-600 font-bold">ATK:</span> {stats.attack}
            </div>
            <div className="bg-white rounded px-2 py-1">
              <span className="text-blue-600 font-bold">DEF:</span> {stats.defense}
            </div>
          </div>
        </div>

        {/* Enemy Side */}
        <div className="text-center">
          <div className={`${battleState.enemy.isBoss ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gradient-to-br from-red-500 to-rose-600'} rounded-xl p-4 mb-2`}>
            <div className={`text-6xl mb-2 ${getActionAnimationClass()}`}>
              {battleState.enemy.spriteUrl ? (
                <img
                  src={battleState.enemy.spriteUrl}
                  alt={battleState.enemy.name}
                  className="w-20 h-20 mx-auto object-contain"
                />
              ) : (
                <div>{battleState.enemy.icon}</div>
              )}
            </div>
            <div className="text-white font-bold">{battleState.enemy.name}</div>
            <div className="text-xs text-red-200">
              Lv.{battleState.enemy.level} {battleState.enemy.isBoss && '👑 BOSS'}
            </div>
          </div>
          
          {/* Enemy HP Bar */}
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                enemyHpPercent > 50
                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                  : enemyHpPercent > 25
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                  : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${enemyHpPercent}%` }}
            />
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-1">
            HP: {battleState.enemy.hp} / {battleState.enemy.maxHp}
          </div>
          
          {/* Enemy Stats */}
          <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
            <div className="bg-white rounded px-2 py-1">
              <span className="text-orange-600 font-bold">ATK:</span> {battleState.enemy.attack}
            </div>
            <div className="bg-white rounded px-2 py-1">
              <span className="text-blue-600 font-bold">DEF:</span> {battleState.enemy.defense}
            </div>
          </div>
        </div>
      </div>

      {/* Battle Log */}
      {lastAction && (
        <div className={`rounded-lg p-3 text-center font-semibold text-sm ${
          lastAction.type === 'player_attack' || lastAction.type === 'critical_hit'
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {lastAction.type === 'critical_hit' && (
            <span className="text-yellow-500 font-bold mr-1">✨ CRITICAL! ✨</span>
          )}
          {lastAction.message}
        </div>
      )}

      <style>{`
        @keyframes attack-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px) scale(1.1); }
        }
        
        @keyframes attack-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-20px) scale(1.1); }
        }
        
        @keyframes critical {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.3) rotate(-10deg); }
          50% { transform: scale(1.3) rotate(10deg); }
          75% { transform: scale(1.3) rotate(-10deg); }
        }
        
        .animate-attack-right {
          animation: attack-right 0.5s ease-in-out;
        }
        
        .animate-attack-left {
          animation: attack-left 0.5s ease-in-out;
        }
        
        .animate-critical {
          animation: critical 1s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default BattleDisplay;
