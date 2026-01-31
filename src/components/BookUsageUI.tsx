import React, { useState } from 'react';
import { Character, BookInventory, BookTier, BOOK_DATA, UncapMaterialInventory, UNCAP_MATERIALS } from '@/types/character.types';
import { useBook as applyBook, getBookInventory, isAtLevelCap, getLevelCap, getUncapRequirements, uncapCharacter, getUncapMaterialInventory, fixStuckCharacterLevels, getBookCost, getUncapCost } from '@/services/character.service';
import { loadUserProgress } from '@/services/missions.service';

interface BookUsageUIProps {
  character: Character;
  onClose: () => void;
  onUseBook: () => void;
}

const BookUsageUI: React.FC<BookUsageUIProps> = ({ character, onClose, onUseBook }) => {
  const [bookInventory, setBookInventory] = useState<BookInventory>(getBookInventory());
  const [materialInventory, setMaterialInventory] = useState<UncapMaterialInventory>(getUncapMaterialInventory());
  const [selectedTier, setSelectedTier] = useState<BookTier | null>(null);
  const [bookAmount, setBookAmount] = useState<number>(1);
  const [showAnimation, setShowAnimation] = useState(false);
  const [totalExpGained, setTotalExpGained] = useState<number>(0);
  const [showUncapSuccess, setShowUncapSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    tier1: number;
    tier2: number;
    tier3: number;
    totalExp: number;
    totalCost: number;
  } | null>(null);

  const userProgress = loadUserProgress();
  const atLevelCap = isAtLevelCap(character);
  const levelCap = getLevelCap(character.ascensionLevel);
  const canUncap = character.ascensionLevel < 9;
  const requiredMaterials = canUncap ? getUncapRequirements(character.ascensionLevel, character.rarity) : 0;
  const materialType = character.uncapMaterial;
  const hasMaterials = materialInventory[materialType] >= requiredMaterials;
  const uncapCost = getUncapCost(character.ascensionLevel, character.rarity);
  const hasUncapPoints = userProgress.totalPoints >= uncapCost;

  const handleUncap = () => {
    if (!hasUncapPoints) {
      setErrorMessage(`Insufficient points! Need ${uncapCost} but have ${userProgress.totalPoints}`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    if (!hasMaterials) {
      setErrorMessage('Insufficient materials!');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    const success = uncapCharacter(character.id);
    if (success) {
      setMaterialInventory(getUncapMaterialInventory());
      setShowUncapSuccess(true);
      setTimeout(() => {
        setShowUncapSuccess(false);
        onUseBook();
      }, 2000);
    } else {
      setErrorMessage('Failed to uncap character');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const getMaxBooks = (tier: BookTier) => {
    return tier === 1 ? bookInventory.tier1 : tier === 2 ? bookInventory.tier2 : bookInventory.tier3;
  };

  const handleUseBook = (tier: BookTier, amount: number) => {
    const cost = getBookCost(tier);
    const totalCost = cost * amount;
    
    if (userProgress.totalPoints < totalCost) {
      setErrorMessage(`Insufficient points! Need ${totalCost} but have ${userProgress.totalPoints}`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    let successCount = 0;
    for (let i = 0; i < amount; i++) {
      const success = applyBook(character.id, tier);
      if (success) {
        successCount++;
      } else {
        break;
      }
    }
    
    if (successCount > 0) {
      // Fix any stuck character levels to ensure proper state
      fixStuckCharacterLevels();
      
      setBookInventory(getBookInventory());
      setSelectedTier(tier);
      setTotalExpGained(BOOK_DATA[tier].experience * successCount);
      setShowAnimation(true);
      setErrorMessage(null);
      
      setTimeout(() => {
        setShowAnimation(false);
        setTotalExpGained(0);
        onUseBook();
      }, 1500);
    } else {
      setErrorMessage('Failed to use book');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleMaxLevel = () => {
    // Use books efficiently to level up as much as possible
    let expNeeded = character.nextLevelExp - character.experience;
    const booksUsed = { tier1: 0, tier2: 0, tier3: 0 };
    let totalExp = 0;

    // Use Expert books first (most efficient)
    while (bookInventory.tier3 > booksUsed.tier3 && expNeeded > 0) {
      booksUsed.tier3++;
      expNeeded -= BOOK_DATA[3].experience;
      totalExp += BOOK_DATA[3].experience;
    }

    // Then Advanced books
    while (bookInventory.tier2 > booksUsed.tier2 && expNeeded > 0) {
      booksUsed.tier2++;
      expNeeded -= BOOK_DATA[2].experience;
      totalExp += BOOK_DATA[2].experience;
    }

    // Finally Basic books
    while (bookInventory.tier1 > booksUsed.tier1 && expNeeded > 0) {
      booksUsed.tier1++;
      expNeeded -= BOOK_DATA[1].experience;
      totalExp += BOOK_DATA[1].experience;
    }

    // Calculate total cost
    const totalCost = 
      booksUsed.tier1 * getBookCost(1) + 
      booksUsed.tier2 * getBookCost(2) + 
      booksUsed.tier3 * getBookCost(3);

    // Show confirmation
    setConfirmationData({
      tier1: booksUsed.tier1,
      tier2: booksUsed.tier2,
      tier3: booksUsed.tier3,
      totalExp,
      totalCost,
    });
    setShowConfirmation(true);
  };

  const handleConfirmUpgrade = () => {
    if (!confirmationData) return;

    const userProgress = loadUserProgress();
    if (userProgress.totalPoints < confirmationData.totalCost) {
      setErrorMessage('Insufficient points!');
      setTimeout(() => setErrorMessage(null), 3000);
      setShowConfirmation(false);
      return;
    }

    // Apply the books
    for (let i = 0; i < confirmationData.tier3; i++) {
      applyBook(character.id, 3);
    }
    for (let i = 0; i < confirmationData.tier2; i++) {
      applyBook(character.id, 2);
    }
    for (let i = 0; i < confirmationData.tier1; i++) {
      applyBook(character.id, 1);
    }

    // Fix any stuck character levels to ensure proper state
    fixStuckCharacterLevels();
    
    setBookInventory(getBookInventory());
    setSelectedTier(null);
    setTotalExpGained(confirmationData.totalExp);
    setShowAnimation(true);
    setShowConfirmation(false);
    setConfirmationData(null);
    setErrorMessage(null);
    
    setTimeout(() => {
      setShowAnimation(false);
      setTotalExpGained(0);
      onUseBook();
    }, 1500);
  };

  return (
    <>
      {/* Confirmation Modal */}
      {showConfirmation && confirmationData && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[10001]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmation(false)} />
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative z-[10001] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold">📚 Confirm Upgrade</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-gray-800 mb-3">Books to Use:</h3>
                {confirmationData.tier3 > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-red-600">📕 Expert Books</span>
                    <span className="font-bold">x{confirmationData.tier3}</span>
                  </div>
                )}
                {confirmationData.tier2 > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-green-600">📗 Advanced Books</span>
                    <span className="font-bold">x{confirmationData.tier2}</span>
                  </div>
                )}
                {confirmationData.tier1 > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600">📘 Basic Books</span>
                    <span className="font-bold">x{confirmationData.tier1}</span>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Total XP Gained:</span>
                  <span className="text-lg font-bold text-blue-600">+{confirmationData.totalExp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Total Points Cost:</span>
                  <span className="text-lg font-bold text-purple-600">{confirmationData.totalCost}⭐</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpgrade}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:-translate-y-1"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-[10000]"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative z-[10000] max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">📚 Level Up Character</h2>
              <p className="text-indigo-100">Use training books to gain experience</p>
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
        <div className="p-6">
          {errorMessage && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-300 text-center">
              <div className="text-lg font-bold text-red-600">⚠️ {errorMessage}</div>
            </div>
          )}

          {showAnimation && (
            <div className="mb-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-300 text-center animate-pulse">
              {selectedTier ? (
                <>
                  <div className="text-4xl mb-2">{BOOK_DATA[selectedTier].icon}</div>
                  <div className="text-lg font-bold text-gray-800">+{totalExpGained} XP!</div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">✨</div>
                  <div className="text-lg font-bold text-gray-800">+{totalExpGained} XP!</div>
                  <div className="text-sm text-gray-600">Multiple books used!</div>
                </>
              )}
            </div>
          )}

          {showUncapSuccess && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-100 rounded-xl p-4 border-2 border-purple-300 text-center animate-pulse">
              <div className="text-4xl mb-2">🌟</div>
              <div className="text-lg font-bold text-gray-800">Level Cap Increased!</div>
              <div className="text-sm text-gray-600">Max Level: {getLevelCap(character.ascensionLevel)}</div>
            </div>
          )}

          {/* Character Info */}
          <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border-2 border-indigo-300">
            <div className="flex items-center gap-3 mb-3">
              {character.spriteUrl ? (
                <img src={character.spriteUrl} alt={character.name} className="w-16 h-16 object-contain" />
              ) : (
                <div className="text-4xl">{character.icon}</div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-800">{character.name}</h3>
                <div className="text-sm text-gray-600">Level {character.level}/{levelCap}</div>
                {character.ascensionLevel > 0 && (
                  <div className="text-xs text-purple-600">⭐ Ascension {character.ascensionLevel}</div>
                )}
              </div>
            </div>

            {atLevelCap && (
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 mb-3">
                <div className="text-sm font-bold text-yellow-800">⚠️ At Level Cap!</div>
                <div className="text-xs text-yellow-700">
                  {canUncap ? 'Uncap to continue leveling' : 'Maximum level reached (100)'}
                </div>
              </div>
            )}

            {!atLevelCap && (
              <>
                <div className="text-xs text-gray-600 mb-1">
                  {character.experience} / {character.nextLevelExp} XP
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500"
                    style={{ width: `${(character.experience / character.nextLevelExp) * 100}%` }}
                  />
                </div>
              </>
            )}

            {/* Skills Display */}
            {character.skills && character.skills.length > 0 && (
              <div className="mt-3 pt-3 border-t border-indigo-300">
                <h4 className="text-xs font-bold text-gray-800 mb-2">🎯 Skills</h4>
                <div className="space-y-2">
                  {character.skills.map((skill) => (
                    <div key={skill.id} className={`p-2 rounded text-xs border ${
                      skill.type === 'passive' 
                        ? 'bg-gray-100 border-gray-300' 
                        : 'bg-yellow-100 border-yellow-300'
                    }`}>
                      <div className="font-semibold text-gray-800 flex items-center gap-2">
                        <span>{skill.icon}</span>
                        {skill.name}
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ml-auto ${
                          skill.type === 'passive' 
                            ? 'bg-gray-300 text-gray-700' 
                            : 'bg-yellow-300 text-yellow-700'
                        }`}>
                          {skill.type === 'passive' ? '∞' : '⚡'}
                        </span>
                      </div>
                      <div className="text-gray-700 mt-0.5">{skill.effect}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Uncap Section */}
          {atLevelCap && canUncap && (
            <div className="mb-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-4 border-2 border-purple-300">
              <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🌟</span>
                Uncap Character (Ascension {character.ascensionLevel + 1})
              </h3>
              
              <div className="bg-white rounded-lg p-3 mb-3 space-y-2">
                <div className="text-sm text-gray-700 font-semibold">Required Resources:</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{UNCAP_MATERIALS[materialType].icon}</span>
                    <div>
                      <div className="text-sm font-semibold">{UNCAP_MATERIALS[materialType].name}</div>
                      <div className="text-xs text-gray-500">{UNCAP_MATERIALS[materialType].description}</div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${hasMaterials ? 'text-green-600' : 'text-red-600'}`}>
                    {materialInventory[materialType]}/{requiredMaterials}
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      <div className="text-sm font-semibold">Points</div>
                    </div>
                    <div className={`text-lg font-bold ${hasUncapPoints ? 'text-green-600' : 'text-red-600'}`}>
                      {userProgress.totalPoints}/{uncapCost}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleUncap}
                disabled={!hasMaterials || !hasUncapPoints}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                  hasMaterials && hasUncapPoints
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {hasMaterials && hasUncapPoints ? `✨ Uncap to Level ${getLevelCap(character.ascensionLevel + 1)}` : '❌ Insufficient Resources'}
              </button>
            </div>
          )}

          {/* Book Selection */}
          {!atLevelCap && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Select Training Book:</h3>
            
            {([1, 2, 3] as BookTier[]).map((tier) => {
              const book = BOOK_DATA[tier];
              const count = getMaxBooks(tier);
              const hasBook = count > 0;
              const bookCost = getBookCost(tier);
              const totalCost = bookCost * bookAmount;
              const hasEnoughPoints = userProgress.totalPoints >= totalCost;

              return (
                <div key={tier} className="space-y-2">
                  <div
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      hasBook && !showAnimation
                        ? 'bg-white border-gray-300'
                        : 'bg-gray-100 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{book.icon}</div>
                        <div className="text-left">
                          <div className="font-bold text-gray-800">{book.name}</div>
                          <div className="text-sm text-gray-600">+{book.experience} XP each • {bookCost}⭐ per book</div>
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${hasBook ? 'text-green-600' : 'text-gray-400'}`}>
                        x{count}
                      </div>
                    </div>
                    
                    {hasBook && !showAnimation && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 whitespace-nowrap">Amount:</span>
                          <input
                            type="range"
                            min="1"
                            max={count}
                            value={bookAmount}
                            onChange={(e) => setBookAmount(parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm font-bold text-gray-800 w-8 text-right">{bookAmount}</span>
                        </div>
                        <div className={`text-sm text-center font-semibold ${hasEnoughPoints ? 'text-green-600' : 'text-red-600'}`}>
                          Cost: {totalCost}⭐ (Have: {userProgress.totalPoints}⭐)
                        </div>
                        <button
                          onClick={() => handleUseBook(tier, bookAmount)}
                          disabled={!hasEnoughPoints}
                          className={`w-full font-bold py-2 px-4 rounded-lg transition-all duration-200 transform ${hasEnoughPoints ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:-translate-y-0.5' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                          Use {bookAmount} {bookAmount === 1 ? 'Book' : 'Books'} (+{book.experience * bookAmount} XP)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          )}

          {!atLevelCap && bookInventory.tier1 === 0 && bookInventory.tier2 === 0 && bookInventory.tier3 === 0 && (
            <div className="mt-4 text-center text-gray-500 text-sm">
              <p>No books available. Play games to earn training books!</p>
            </div>
          )}

          {/* Max Level Button */}
          {!atLevelCap && (bookInventory.tier1 > 0 || bookInventory.tier2 > 0 || bookInventory.tier3 > 0) && !showAnimation && (
            <button
              onClick={handleMaxLevel}
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              ⚡ Use Books to Next Level
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default BookUsageUI;
