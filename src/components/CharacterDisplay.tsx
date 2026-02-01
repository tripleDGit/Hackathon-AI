import React, { useState } from 'react';
import { Character } from '@/types/character.types';
import { getCharacterStats, getSkillLevel, getMaxSkillLevel } from '@/services/character.service';
import ConstellationUI from './ConstellationUI';

interface CharacterDisplayProps {
  character: Character;
  compact?: boolean;
  onShowCharacterSelection?: () => void;
  onCharacterUpdate?: () => void;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ character, compact = false, onShowCharacterSelection, onCharacterUpdate }) => {
  const [showConstellation, setShowConstellation] = useState(false);
  const stats = getCharacterStats(character);
  const maxSkillLevel = getMaxSkillLevel(character);

  const expPercentage = Math.min(100, (character.experience / character.nextLevelExp) * 100);
  const skills = character.skills ?? [];

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
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-1 shadow-2xl max-w-2xl">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 border border-white/10">
        {/* Character Sprite Area with Glow */}
        <div className="relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl p-12 text-center mb-8 min-h-64 flex items-center justify-center overflow-hidden border border-indigo-500/30">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/10 to-transparent"></div>
          {character.spriteUrl ? (
            <img
              src={character.spriteUrl}
              alt={character.name}
              className="relative z-10 max-h-72 max-w-full object-contain drop-shadow-2xl"
            />
          ) : (
            <div className="relative z-10">
              <div className="text-[12rem] mb-4 drop-shadow-2xl">{character.icon}</div>
              <p className="text-white/60 text-lg">Character Sprite</p>
            </div>
          )}
          {/* Stars decoration */}
          <div className="absolute top-6 right-6 flex gap-2">
            {character.rarity.split('').map((star, i) => (
              <span key={i} className="text-3xl text-yellow-400 drop-shadow-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>⭐</span>
            ))}
          </div>
        </div>

        {/* Character Info */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">{character.name}</h2>
              <p className="text-purple-300 text-lg font-semibold">{character.rarity}</p>
              {character.constellationLevel > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-400 font-bold text-sm drop-shadow-lg">⭐ C{character.constellationLevel}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-lg break-words">Lv.{character.level}</div>
              <p className="text-sm text-white/60">Level</p>
            </div>
          </div>
          <p className="text-base text-white/80 italic">{character.description}</p>
        </div>

        {/* Experience Bar with Glow */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-white/70 mb-2">
            <span>Experience</span>
            <span className="font-semibold text-cyan-300 truncate ml-2">
              {character.experience}/{character.nextLevelExp}
            </span>
          </div>
          <div className="relative w-full bg-slate-700/50 rounded-full h-4 overflow-hidden border border-cyan-500/30">
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 h-full transition-all duration-500 shadow-lg shadow-cyan-500/50"
              style={{ width: `${expPercentage}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"></div>
          </div>
        </div>

        {/* Quick Stats Summary with Glass Effect */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="backdrop-blur-md bg-red-500/20 rounded-xl p-4 text-center border border-red-400/30 shadow-lg hover:shadow-red-500/50 transition-all">
            <div className="text-3xl font-bold text-red-300 truncate">{stats.hp}</div>
            <div className="text-sm text-red-200">HP</div>
          </div>
          <div className="backdrop-blur-md bg-orange-500/20 rounded-xl p-4 text-center border border-orange-400/30 shadow-lg hover:shadow-orange-500/50 transition-all">
            <div className="text-3xl font-bold text-orange-300 truncate">{stats.attack}</div>
            <div className="text-sm text-orange-200">ATK</div>
          </div>
          <div className="backdrop-blur-md bg-blue-500/20 rounded-xl p-4 text-center border border-blue-400/30 shadow-lg hover:shadow-blue-500/50 transition-all">
            <div className="text-3xl font-bold text-blue-300 truncate">{stats.defense}</div>
            <div className="text-sm text-blue-200">DEF</div>
          </div>
          <div className="backdrop-blur-md bg-purple-500/20 rounded-xl p-4 text-center border border-purple-400/30 shadow-lg hover:shadow-purple-500/50 transition-all">
            <div className="text-3xl font-bold text-purple-300 truncate">{stats.speed}</div>
            <div className="text-sm text-purple-200">SPD</div>
          </div>
        </div>

        {/* Skills Section with Modern Cards */}
        <div className="mb-8">
          <h3 className="font-bold text-white mb-3 text-sm flex items-center gap-2">
            <span>💫</span>
            <span>Skills</span>
          </h3>
          {skills.length > 0 ? (
            <div className="space-y-3">
              {skills.map((skill) => {
                return (
                  <div key={skill.id} className={`backdrop-blur-md rounded-xl p-3 text-xs border transition-all hover:scale-102 ${
                    skill.type === 'passive' 
                      ? 'bg-slate-700/30 border-slate-500/30' 
                      : 'bg-yellow-500/20 border-yellow-400/30'
                  }`}>
                    <div className="font-semibold text-white flex items-center gap-2 justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{skill.icon}</span>
                        <span>{skill.name}</span>
                        <span className="text-[10px] text-white/50">Lv.{getSkillLevel(character, skill.id)}/{maxSkillLevel}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        skill.type === 'passive' 
                          ? 'bg-slate-600/50 text-slate-200' 
                          : 'bg-yellow-500/30 text-yellow-200'
                      }`}>
                        {skill.type === 'passive' ? '∞' : '⚡'}
                      </span>
                    </div>
                    <div className="text-white/70 text-[11px] leading-relaxed">{skill.description}</div>
                    <div className="text-white/50 text-[10px] mt-1 italic">{skill.effect}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-white/50 italic">No skills unlocked yet.</div>
          )}
        </div>

        {/* View Details Buttons with Premium Style */}
        <div className="space-y-4">
          <button
            onClick={() => setShowConstellation(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-5 px-8 rounded-2xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 text-lg"
          >
            <span className="text-2xl">⭐</span>
            <span>Constellations (C{character.constellationLevel})</span>
          </button>
          <button
            onClick={onShowCharacterSelection}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-5 px-8 rounded-2xl shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/70 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 text-lg"
          >
            <span className="text-2xl">👥</span>
            <span>View All Characters</span>
          </button>
        </div>

        {/* Constellation Modal */}
        {showConstellation && (
          <ConstellationUI
            character={character}
            onClose={() => setShowConstellation(false)}
            onUpdate={() => {
              setShowConstellation(false);
              onCharacterUpdate?.();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CharacterDisplay;
