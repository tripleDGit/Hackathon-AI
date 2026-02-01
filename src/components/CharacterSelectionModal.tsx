import React, { useState } from 'react';
import { Character } from '@/types/character.types';
import { getCharacterInventory, setActiveCharacter, getCharacterStats, getSkillLevel, getMaxSkillLevel } from '@/services/character.service';
import ConstellationUI from './ConstellationUI';

interface CharacterSelectionModalProps {
  onClose: () => void;
  onCharacterChange: () => void;
  onOpenBookUI?: (character: Character) => void;
}

const CharacterSelectionModal: React.FC<CharacterSelectionModalProps> = ({ onClose, onCharacterChange, onOpenBookUI }) => {
  const inventory = getCharacterInventory();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showConstellation, setShowConstellation] = useState(false);
  const selectedSkills = selectedCharacter?.skills ?? [];
  const maxSkillLevel = selectedCharacter ? getMaxSkillLevel(selectedCharacter) : 1;

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleSetActive = (characterId: string) => {
    setActiveCharacter(characterId);
    onCharacterChange();
    onClose();
  };

  const handleOpenBooks = () => {
    if (selectedCharacter && onOpenBookUI) {
      onOpenBookUI(selectedCharacter);
    }
  };

  const getRarityColor = (rarity: string) => {
    const starCount = rarity.split('⭐').length - 1;
    switch (starCount) {
      case 5: return 'from-yellow-400 to-orange-500';
      case 4: return 'from-purple-400 to-pink-500';
      case 3: return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-300 to-gray-400';
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden relative z-10 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">👥 Character Collection</h2>
              <p className="text-indigo-100 text-sm">You have {inventory.characters.length} character{inventory.characters.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Side - Character Icons Grid */}
            <div className="w-64 bg-gray-50 p-4 overflow-y-auto border-r border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Select Character</h3>
              <div className="grid grid-cols-2 gap-3">
                {inventory.characters.map((character) => {
                  const isActive = character.id === inventory.activeCharacterId;
                  const isSelected = selectedCharacter?.id === character.id;
                  
                  return (
                    <button
                      key={character.id}
                      onClick={() => handleCharacterClick(character)}
                      className={`relative rounded-xl p-3 transition-all duration-200 ${
                        isSelected
                          ? 'ring-4 ring-indigo-500 bg-white shadow-lg scale-105'
                          : 'bg-white hover:shadow-md hover:scale-102'
                      }`}
                    >
                      {/* Active Badge */}
                      {isActive && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold z-10">
                          Active
                        </div>
                      )}
                      
                      {/* Character Icon/Sprite */}
                      <div className={`bg-gradient-to-br ${getRarityColor(character.rarity)} rounded-lg p-2 mb-2`}>
                        {character.spriteUrl ? (
                          <img
                            src={character.spriteUrl}
                            alt={character.name}
                            className="w-full h-16 object-contain"
                          />
                        ) : (
                          <div className="text-4xl text-center">{character.icon}</div>
                        )}
                      </div>
                      
                      {/* Character Info */}
                      <div className="text-xs font-semibold text-gray-800 truncate">{character.name}</div>
                      <div className="text-xs text-gray-500">Lv.{character.level}</div>
                      <div className="text-xs">{character.rarity}</div>
                      {character.constellationLevel > 0 && (
                        <div className="text-xs text-purple-600 font-bold">⭐C{character.constellationLevel}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Character Details */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedCharacter ? (
                <div className="max-w-2xl mx-auto">
                  {/* Character Header */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 mb-6 border-2 border-indigo-300">
                    <div className="flex items-start gap-6">
                      {/* Character Sprite */}
                      <div className={`bg-gradient-to-br ${getRarityColor(selectedCharacter.rarity)} rounded-xl p-4 flex-shrink-0`}>
                        {selectedCharacter.spriteUrl ? (
                          <img
                            src={selectedCharacter.spriteUrl}
                            alt={selectedCharacter.name}
                            className="w-32 h-32 object-contain"
                          />
                        ) : (
                          <div className="text-8xl">{selectedCharacter.icon}</div>
                        )}
                      </div>

                      {/* Character Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-3xl font-bold text-gray-800">{selectedCharacter.name}</h3>
                            <p className="text-sm text-gray-600">{selectedCharacter.rarity}</p>
                            {selectedCharacter.constellationLevel > 0 && (
                              <p className="text-sm text-purple-600 font-bold mt-1">⭐ Constellation Level {selectedCharacter.constellationLevel}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-bold text-indigo-600">Lv.{selectedCharacter.level}</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 italic mb-4">{selectedCharacter.description}</p>
                        
                        {/* Experience Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Experience</span>
                            <span className="font-semibold">
                              {selectedCharacter.experience}/{selectedCharacter.nextLevelExp}
                            </span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500"
                              style={{ width: `${(selectedCharacter.experience / selectedCharacter.nextLevelExp) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">📊 Character Stats</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {(() => {
                        const stats = getCharacterStats(selectedCharacter);
                        return (
                          <>
                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200">
                              <div className="text-3xl font-bold text-red-600">{stats.hp}</div>
                              <div className="text-sm text-gray-600">❤️ HP</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                              <div className="text-3xl font-bold text-orange-600">{stats.attack}</div>
                              <div className="text-sm text-gray-600">⚔️ Attack</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                              <div className="text-3xl font-bold text-blue-600">{stats.defense}</div>
                              <div className="text-sm text-gray-600">🛡️ Defense</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                              <div className="text-3xl font-bold text-purple-600">{stats.speed}</div>
                              <div className="text-sm text-gray-600">⚡ Speed</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Favorability */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">💕 Favorability</h4>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border-2 border-pink-200">
                      <div className="w-full bg-pink-200 rounded-full h-4 overflow-hidden mb-2">
                        <div
                          className="bg-gradient-to-r from-pink-400 to-pink-600 h-full transition-all duration-300"
                          style={{ width: `${Math.min((selectedCharacter.favorability / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-center text-sm text-gray-600">{selectedCharacter.favorability} / 100</div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">🎯 Skills</h4>
                    {selectedSkills.length > 0 ? (
                      <div className="space-y-3">
                        {selectedSkills.map((skill) => {
                          return (
                            <div key={skill.id} className={`rounded-xl p-4 border-2 ${
                              skill.type === 'passive' 
                                ? 'bg-gray-50 border-gray-300' 
                                : 'bg-yellow-50 border-yellow-300'
                            }`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="text-2xl">{skill.icon}</span>
                                  <div>
                                    <div className="font-bold text-gray-800">{skill.name}</div>
                                    <div className="text-xs text-gray-600">{skill.description}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    skill.type === 'passive' 
                                      ? 'bg-gray-300 text-gray-700' 
                                      : 'bg-yellow-300 text-yellow-700'
                                  }`}>
                                    {skill.type === 'passive' ? '∞ Passive' : '⚡ Active'} · Lv.{getSkillLevel(selectedCharacter, skill.id)}/{maxSkillLevel}
                                  </span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-700 italic ml-11">{skill.effect}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No skills unlocked yet.</div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setShowConstellation(true)}
                      className="flex-1 min-w-[120px] bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                      ⭐ Constellations
                    </button>
                    
                    <button
                      onClick={handleOpenBooks}
                      className="flex-1 min-w-[120px] bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                      📚 Use Training Books
                    </button>
                    
                    {selectedCharacter.id !== inventory.activeCharacterId && (
                      <button
                        onClick={() => handleSetActive(selectedCharacter.id)}
                        className="flex-1 min-w-[120px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                      >
                        ✓ Set as Active
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">👈</div>
                    <p className="text-lg">Select a character to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Constellation Modal */}
        {showConstellation && selectedCharacter && (
          <ConstellationUI
            character={selectedCharacter}
            onClose={() => setShowConstellation(false)}
            onUpdate={() => {
              // Refresh inventory after constellation upgrade
              const updated = getCharacterInventory();
              const refreshed = updated.characters.find(c => c.id === selectedCharacter.id);
              if (refreshed) {
                setSelectedCharacter(refreshed);
              }
            }}
          />
        )}
      </div>
    </>
  );
};

export default CharacterSelectionModal;
