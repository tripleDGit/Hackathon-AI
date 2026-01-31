import React, { useState } from 'react';
import { performGachaPull, getGachaCurrency, getCharacterInventory } from '@/services/character.service';
import { GachaResult } from '@/types/character.types';

interface GachaPullUIProps {
  onClose: () => void;
  onPullSuccess?: () => void;
}

const GachaPullUI: React.FC<GachaPullUIProps> = ({ onClose, onPullSuccess }) => {
  const [currency, setCurrency] = useState(getGachaCurrency());
  const [inventory, setInventory] = useState(getCharacterInventory());
  const [pulling, setPulling] = useState(false);
  const [lastResult, setLastResult] = useState<GachaResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [pullCount, setPullCount] = useState(0);

  const canPull = currency.freeGems >= 160 || currency.wishes > 0;

  const handleSinglePull = async () => {
    if (!canPull) return;

    setPulling(true);
    setShowResult(false);

    // Simulate pull animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const result = performGachaPull();
      setLastResult(result);
      setShowResult(true);
      setPullCount(1);
      setCurrency(getGachaCurrency());
      setInventory(getCharacterInventory());
      onPullSuccess?.();
    } catch (error) {
      console.error('Pull failed:', error);
    } finally {
      setPulling(false);
    }
  };

  const handleTenPull = async () => {
    const requiredGems = 160 * 10;
    if (currency.freeGems < requiredGems && currency.wishes < 10) {
      console.error('Insufficient currency for 10 pull');
      return;
    }

    setPulling(true);
    setShowResult(false);

    // Simulate pull animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(performGachaPull());
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Show last result or best result
      const bestResult = results.reduce((best, current) =>
        (current.character.rarity > best.character.rarity) ? current : best
      );

      setLastResult(bestResult);
      setShowResult(true);
      setPullCount(10);
      setCurrency(getGachaCurrency());
      setInventory(getCharacterInventory());
      onPullSuccess?.();
    } catch (error) {
      console.error('10-pull failed:', error);
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">✨ Gacha Pull ✨</h2>
              <p className="text-yellow-100">Summon powerful characters to enhance your team!</p>
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
          {!showResult ? (
            <div>
              {/* Currency Display */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-4 border-2 border-yellow-400">
                  <div className="text-2xl mb-1">💛</div>
                  <div className="text-2xl font-bold text-yellow-700">{currency.freeGems}</div>
                  <div className="text-xs text-yellow-600">Free Gems</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 border-2 border-purple-400">
                  <div className="text-2xl mb-1">💜</div>
                  <div className="text-2xl font-bold text-purple-700">{currency.primogems}</div>
                  <div className="text-xs text-purple-600">Primogems</div>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 border-2 border-blue-400">
                  <div className="text-2xl mb-1">🎫</div>
                  <div className="text-2xl font-bold text-blue-700">{currency.wishes}</div>
                  <div className="text-xs text-blue-600">Wishes</div>
                </div>
              </div>

              {/* Pull Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 mb-6 border-2 border-blue-300">
                <h3 className="font-bold text-gray-800 mb-3">🎯 Gacha Information</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="font-semibold text-red-600">3%</div>
                    <div className="text-xs text-gray-600">5-Star Rate</div>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600">10%</div>
                    <div className="text-xs text-gray-600">4-Star Rate</div>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-600">87%</div>
                    <div className="text-xs text-gray-600">3-Star Rate</div>
                  </div>
                </div>
              </div>

              {/* Pull Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleSinglePull}
                  disabled={pulling || !canPull}
                  className={`w-full py-4 px-4 font-bold rounded-lg transition-all duration-200 text-white text-lg ${
                    !canPull || pulling
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:shadow-lg transform hover:-translate-y-1'
                  }`}
                >
                  {pulling ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Summoning...
                    </span>
                  ) : (
                    <span>🎲 Single Pull - 160 Gems (or 1 Wish)</span>
                  )}
                </button>

                <button
                  onClick={handleTenPull}
                  disabled={pulling || (currency.freeGems < 1600 && currency.wishes < 10)}
                  className={`w-full py-4 px-4 font-bold rounded-lg transition-all duration-200 text-white text-lg ${
                    pulling || (currency.freeGems < 1600 && currency.wishes < 10)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transform hover:-translate-y-1'
                  }`}
                >
                  {pulling ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Summoning 10...
                    </span>
                  ) : (
                    <span>🎲✨ Ten Pull - 1600 Gems (or 10 Wishes) + 1 Free</span>
                  )}
                </button>
              </div>

              {/* Collection Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-700">
                  <div className="font-semibold mb-2">📚 Your Collection</div>
                  <div className="flex justify-between">
                    <span>Unique Characters:</span>
                    <span className="font-bold">{inventory.characters.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : lastResult ? (
            <div className="flex flex-col items-center justify-center min-h-96">
              {/* Result Animation */}
              <div className="text-6xl mb-4 animate-bounce">{lastResult.character.icon}</div>

              {/* Rarity Star Burst */}
              <div className="text-4xl mb-4">
                {lastResult.character.rarity === '⭐⭐⭐⭐⭐' ? '✨✨✨' : lastResult.character.rarity === '⭐⭐⭐⭐' ? '✨✨' : '✨'}
              </div>

              {/* Character Info */}
              <h3 className="text-3xl font-bold text-center mb-2">{lastResult.character.name}</h3>
              <div className="text-lg text-gray-600 mb-4">{lastResult.character.rarity}</div>

              {/* Result Type */}
              <div className="text-center mb-6">
                {lastResult.isNew ? (
                  <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-4 border-2 border-green-500 mb-3">
                    <div className="text-green-700 font-bold text-lg">🎉 NEW CHARACTER!</div>
                    <p className="text-green-600">You've obtained a new hero!</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-4 border-2 border-blue-500 mb-3">
                    <div className="text-blue-700 font-bold text-lg">⬆️ DUPLICATE</div>
                    <p className="text-blue-600">Character level increased!</p>
                  </div>
                )}
              </div>

              {/* Pull Count */}
              <div className="text-sm text-gray-600 mb-6">
                From {pullCount === 1 ? 'single pull' : `10-pull (showing best result)`}
              </div>

              {/* Continue Button */}
              <button
                onClick={() => {
                  setShowResult(false);
                  setLastResult(null);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                ✨ Continue Pulling
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GachaPullUI;
