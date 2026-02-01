import React, { useState } from 'react';
import { Character } from '@/types/character.types';
import { CHARACTER_CONSTELLATIONS } from '@/types/constellation.types';
import { getConstellationItemInventory, useConstellationItem, convertConstellationItemToDust } from '@/services/character.service';

interface ConstellationUIProps {
  character: Character;
  onClose: () => void;
  onUpdate?: () => void;
}

const ConstellationUI: React.FC<ConstellationUIProps> = ({ character, onClose, onUpdate }) => {
  const [constInventory, setConstInventory] = useState(getConstellationItemInventory());
  const baseId = character.baseCharacterId || character.id;
  const constellations = CHARACTER_CONSTELLATIONS[baseId] || [];
  const availableItems = constInventory[baseId] || 0;

  const handleActivateConstellation = () => {
    const result = useConstellationItem(character.id);
    if (result.success) {
      onUpdate?.();
      onClose();
    } else {
      alert(result.error || 'Failed to activate constellation');
    }
  };

  const handleConvertToDust = () => {
    if (availableItems <= 0) {
      alert('No constellation items to convert');
      return;
    }
    
    const result = convertConstellationItemToDust(baseId, availableItems);
    if (result.success) {
      setConstInventory(getConstellationItemInventory());
      alert(`✨ Converted ${availableItems} item(s) to ${result.dustGained} Constellation Dust!`);
      onUpdate?.();
    } else {
      alert('Failed to convert to dust');
    }
  };

  const canActivate = availableItems > 0 && character.constellationLevel < 6;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">⭐ Constellations</h2>
              <p className="text-purple-100">{character.name}</p>
              <p className="text-purple-200 text-sm mt-1">
                Level: {character.constellationLevel}/6
              </p>
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
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Available Items */}
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-4 mb-6 border-2 border-purple-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-purple-900">Available Constellation Items</div>
                <div className="text-sm text-purple-700">Obtained from duplicate pulls</div>
              </div>
              <div className="text-3xl font-bold text-purple-600">{availableItems}</div>
            </div>
          </div>

          {/* Activate Button */}
          {canActivate && (
            <div className="mb-6">
              <button
                onClick={handleActivateConstellation}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:shadow-lg text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                ⭐ Activate Next Constellation (Level {character.constellationLevel + 1})
              </button>
            </div>
          )}

          {/* Convert to Dust Button */}
          {availableItems > 0 && character.constellationLevel >= 6 && (
            <div className="mb-6">
              <button
                onClick={handleConvertToDust}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:shadow-lg text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                ✨ Convert {availableItems} Item(s) to Dust
              </button>
            </div>
          )}

          {character.constellationLevel >= 6 && (
            <div className="mb-6 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg p-4 border-2 border-yellow-500 text-center">
              <div className="text-yellow-700 font-bold text-lg">👑 Maximum Constellation Reached!</div>
              <p className="text-yellow-600">This character has unlocked all constellation perks!</p>
              {availableItems > 0 && (
                <p className="text-yellow-700 text-sm mt-2">You have {availableItems} item(s) available to convert to dust</p>
              )}
            </div>
          )}

          {/* Constellation List */}
          <div className="space-y-3">
            {constellations.map((perk, index) => {
              const isUnlocked = index < character.constellationLevel;
              const isNext = index === character.constellationLevel;

              return (
                <div
                  key={perk.level}
                  className={`rounded-xl p-4 border-2 transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-400'
                      : isNext
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400 shadow-lg'
                      : 'bg-gray-50 border-gray-300 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl shrink-0">{perk.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-500">C{perk.level}</span>
                        <span className="text-lg font-bold text-gray-900">{perk.name}</span>
                        {isUnlocked && (
                          <span className="ml-auto text-green-600 font-bold">✓ Unlocked</span>
                        )}
                        {isNext && !isUnlocked && (
                          <span className="ml-auto text-yellow-600 font-bold">⏩ Next</span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{perk.description}</p>
                      <div className="bg-white bg-opacity-70 rounded-lg px-3 py-1 text-sm">
                        <span className="font-semibold text-gray-600">Effect:</span>{' '}
                        <span className="text-gray-800">{perk.effect}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {constellations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">⭐</div>
              <p>No constellation data available for this character.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstellationUI;
