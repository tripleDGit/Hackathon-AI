import React from 'react';
import { Character } from '@/types/character.types';
import { getCharacterStats } from '@/services/character.service';

interface CharacterDisplayProps {
  character: Character;
  compact?: boolean;
  onShowCharacterSelection?: () => void;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ character, compact = false, onShowCharacterSelection }) => {
  const stats = getCharacterStats(character);

  const expPercentage = Math.min(100, (character.experience / character.nextLevelExp) * 100);

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-3 border-2 border-indigo-300">
        <div className="flex items-center gap-3">
          {character.spriteUrl ? (
            <img
              src={character.spriteUrl}
              alt={character.name}
              className="w-16 h-16 object-contain"
            />
          ) : (
            <div className="text-5xl">{character.icon}</div>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">{character.name}</h3>
            <div className="text-xs text-gray-600">Level {character.level}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-20 bg-gray-300 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${expPercentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">{character.rarity}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-indigo-300 max-w-md">
      {/* Character Sprite Area */}
      <div className="bg-gradient-to-br from-indigo-200 to-blue-200 rounded-xl p-8 text-center mb-4 min-h-40 flex items-center justify-center overflow-hidden relative">
        {character.spriteUrl ? (
          <img
            src={character.spriteUrl}
            alt={character.name}
            className="max-h-48 max-w-full object-contain"
          />
        ) : (
          <div>
            <div className="text-8xl mb-3">{character.icon}</div>
            <p className="text-gray-600 text-sm">Character Sprite</p>
          </div>
        )}
      </div>

      {/* Character Info */}
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{character.name}</h2>
            <p className="text-gray-600 text-sm">{character.rarity}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600">Lv.{character.level}</div>
            <p className="text-xs text-gray-600">Level</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 italic">{character.description}</p>
      </div>

      {/* Experience Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Experience</span>
          <span className="font-semibold">
            {character.experience}/{character.nextLevelExp}
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500"
            style={{ width: `${expPercentage}%` }}
          />
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-lg p-2 text-center border border-indigo-200">
          <div className="text-lg font-bold text-red-500">{stats.hp}</div>
          <div className="text-xs text-gray-600">HP</div>
        </div>
        <div className="bg-white rounded-lg p-2 text-center border border-indigo-200">
          <div className="text-lg font-bold text-orange-500">{stats.attack}</div>
          <div className="text-xs text-gray-600">ATK</div>
        </div>
        <div className="bg-white rounded-lg p-2 text-center border border-indigo-200">
          <div className="text-lg font-bold text-blue-500">{stats.defense}</div>
          <div className="text-xs text-gray-600">DEF</div>
        </div>
        <div className="bg-white rounded-lg p-2 text-center border border-indigo-200">
          <div className="text-lg font-bold text-purple-500">{stats.speed}</div>
          <div className="text-xs text-gray-600">SPD</div>
        </div>
      </div>

      {/* Skills Section */}
      {character.skills && character.skills.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold text-gray-800 mb-2 text-sm">Skills</h3>
          <div className="space-y-2">
            {character.skills.map((skill) => (
              <div key={skill.id} className={`p-2 rounded-lg text-xs border-2 ${
                skill.type === 'passive' 
                  ? 'bg-gray-50 border-gray-300' 
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  <span>{skill.icon}</span>
                  {skill.name}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    skill.type === 'passive' 
                      ? 'bg-gray-300 text-gray-700' 
                      : 'bg-yellow-300 text-yellow-700'
                  }`}>
                    {skill.type === 'passive' ? '∞' : '⚡'}
                  </span>
                </div>
                <div className="text-gray-700 mt-1">{skill.description}</div>
                <div className="text-gray-600 text-xs mt-1 italic">{skill.effect}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Details Button */}
      <button
        onClick={onShowCharacterSelection}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <span>👥</span>
        <span>View All Characters</span>
      </button>
    </div>
  );
};

export default CharacterDisplay;
