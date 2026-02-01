import React, { useState, useMemo } from 'react';
import { performGachaPullForBanner, getGachaCurrency, getCharacterInventory, getGachaBanners, getBannerPoolInfo, getGachaHistory } from '@/services/character.service';
import { GachaResult, GachaBanner, GachaHistoryEntry } from '@/types/character.types';

interface GachaPullUIProps {
  onClose: () => void;
  onPullSuccess?: () => void;
}

const GachaPullUI: React.FC<GachaPullUIProps> = ({ onClose, onPullSuccess }) => {
  const [currency, setCurrency] = useState(getGachaCurrency());
  const [inventory, setInventory] = useState(getCharacterInventory());
  const [pulling, setPulling] = useState(false);
  const [lastResult, setLastResult] = useState<GachaResult | null>(null);
  const [tenPullResults, setTenPullResults] = useState<GachaResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [pullCount, setPullCount] = useState(0);
  const [selectedBannerId, setSelectedBannerId] = useState<GachaBanner['id']>('standard');
  const [history, setHistory] = useState<GachaHistoryEntry[]>(getGachaHistory());

  const banners = useMemo(() => getGachaBanners(), []);
  const bannerInfo = useMemo(() => getBannerPoolInfo(selectedBannerId), [selectedBannerId]);

  const canPull = currency.freeGems >= 160 || currency.wishes > 0;

  const handleSinglePull = async () => {
    if (!canPull) return;

    setPulling(true);
    setShowResult(false);

    // Simulate pull animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const result = performGachaPullForBanner(selectedBannerId);
      setLastResult(result);
      setShowResult(true);
      setPullCount(1);
      setCurrency(getGachaCurrency());
      setInventory(getCharacterInventory());
      setHistory(getGachaHistory());
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
        results.push(performGachaPullForBanner(selectedBannerId));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Store all results
      setTenPullResults(results);
      
      // Show best result as highlight
      const bestResult = results.reduce((best, current) =>
        (current.character.rarity > best.character.rarity) ? current : best
      );

      setLastResult(bestResult);
      setShowResult(true);
      setPullCount(10);
      setCurrency(getGachaCurrency());
      setInventory(getCharacterInventory());
      setHistory(getGachaHistory());
      onPullSuccess?.();
    } catch (error) {
      console.error('10-pull failed:', error);
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-yellow-500/20">
        {/* Header with premium gradient */}
        <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 p-8 text-white shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="relative flex justify-between items-start">
            <div>
              <h2 className="text-5xl font-bold mb-3 drop-shadow-lg">✨ Wish System ✨</h2>
              <p className="text-white/90 text-xl">Summon powerful characters to enhance your team!</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 overflow-y-auto flex-1">
          {!showResult ? (
            <div>
              {/* Banner Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {banners.map((banner) => (
                  <button
                    key={banner.id}
                    onClick={() => setSelectedBannerId(banner.id)}
                    className={`rounded-2xl p-6 border-2 text-left transition-all ${
                      selectedBannerId === banner.id
                        ? 'bg-gradient-to-br from-yellow-500/20 to-pink-500/20 border-yellow-400/40 shadow-xl shadow-yellow-500/20 scale-105'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white mb-1">{banner.name}</div>
                        <div className="text-sm text-white/70">{banner.description}</div>
                      </div>
                      {banner.id === 'limited' && (
                        <div className="text-xs px-3 py-1 rounded-full bg-red-500/30 text-red-200 border border-red-400/30">Limited</div>
                      )}
                    </div>
                    {banner.featuredCharacterId && (
                      <div className="mt-4 text-sm text-yellow-200">⭐ Featured 5★ with boosted chance</div>
                    )}
                    {banner.endDate && (
                      <div className="mt-2 text-xs text-white/60">Ends: {new Date(banner.endDate).toLocaleDateString()}</div>
                    )}
                  </button>
                ))}
              </div>

              {/* Currency Display with Glass Effect */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl p-4 border border-yellow-400/30 shadow-lg hover:shadow-yellow-500/50 transition-all hover:scale-105">
                  <div className="text-3xl mb-2">💛</div>
                  <div className="text-3xl font-bold text-yellow-300 drop-shadow-lg truncate">{currency.freeGems}</div>
                  <div className="text-xs text-yellow-200/80">Free Gems</div>
                </div>
                <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-purple-400/30 shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105">
                  <div className="text-3xl mb-2">💜</div>
                  <div className="text-3xl font-bold text-purple-300 drop-shadow-lg truncate">{currency.primogems}</div>
                  <div className="text-xs text-purple-200/80">Primogems</div>
                </div>
                <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-4 border border-blue-400/30 shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105">
                  <div className="text-3xl mb-2">🎫</div>
                  <div className="text-3xl font-bold text-blue-300 drop-shadow-lg truncate">{currency.wishes}</div>
                  <div className="text-xs text-blue-200/80">Wishes</div>
                </div>
              </div>

              {/* Pull Information */}
              <div className="backdrop-blur-xl bg-indigo-500/20 rounded-2xl p-6 mb-8 border border-indigo-400/30">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Wish Information</span>
                </h3>
                <div className="grid grid-cols-3 gap-5 text-sm">
                  <div className="text-center backdrop-blur-md bg-white/5 rounded-xl p-3 border border-red-400/20">
                    <div className="font-bold text-2xl text-red-400 mb-1">{(bannerInfo.banner.rates.fiveStarRate * 100).toFixed(1)}%</div>
                    <div className="text-xs text-red-300">5-Star Rate</div>
                  </div>
                  <div className="text-center backdrop-blur-md bg-white/5 rounded-xl p-3 border border-purple-400/20">
                    <div className="font-bold text-2xl text-purple-400 mb-1">{(bannerInfo.banner.rates.fourStarRate * 100).toFixed(1)}%</div>
                    <div className="text-xs text-purple-300">4-Star Rate</div>
                  </div>
                  <div className="text-center backdrop-blur-md bg-white/5 rounded-xl p-3 border border-blue-400/20">
                    <div className="font-bold text-2xl text-blue-400 mb-1">{(bannerInfo.banner.rates.threeStarRate * 100).toFixed(1)}%</div>
                    <div className="text-xs text-blue-300">3-Star Rate</div>
                  </div>
                </div>
              </div>

              {/* Banner Pool Info */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
                <div className="font-semibold mb-4 text-white flex items-center gap-2">
                  <span>🧾</span>
                  <span>Character Pool & Chances</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
                  {bannerInfo.characters
                    .sort((a, b) => b.rarity.length - a.rarity.length || b.chance - a.chance)
                    .map((char) => (
                      <div key={char.id} className="flex items-center justify-between backdrop-blur-md bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{char.icon}</span>
                          <div>
                            <div className="text-white font-semibold flex items-center gap-2">
                              <span>{char.name}</span>
                              {char.isFeatured && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/30 text-yellow-200 border border-yellow-400/30">Featured</span>
                              )}
                            </div>
                            <div className="text-xs text-white/60">{char.rarity}</div>
                          </div>
                        </div>
                        <div className="text-sm text-cyan-300 font-bold">{(char.chance * 100).toFixed(2)}%</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Pull Buttons with Premium Style */}
              <div className="space-y-6 mb-10">
                <button
                  onClick={handleSinglePull}
                  disabled={pulling || !canPull}
                  className={`w-full py-7 px-8 font-bold rounded-3xl transition-all duration-300 text-white text-2xl shadow-lg ${
                    !canPull || pulling
                      ? 'bg-slate-700 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 hover:shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105'
                  }`}
                >
                  {pulling ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="animate-spin text-2xl">⏳</span>
                      <span>Summoning...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-2xl">🎲</span>
                      <span>Single Wish - 160 Gems (or 1 Wish)</span>
                    </span>
                  )}
                </button>

                <button
                  onClick={handleTenPull}
                  disabled={pulling || (currency.freeGems < 1600 && currency.wishes < 10)}
                  className={`w-full py-7 px-8 font-bold rounded-3xl transition-all duration-300 text-white text-2xl shadow-lg ${
                    pulling || (currency.freeGems < 1600 && currency.wishes < 10)
                      ? 'bg-slate-700 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105'
                  }`}
                >
                  {pulling ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="animate-spin text-2xl">⏳</span>
                      <span>Summoning 10...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-2xl">🎲✨</span>
                      <span>Ten Wishes - 1600 Gems (or 10 Wishes) + 1 Free</span>
                    </span>
                  )}
                </button>
              </div>

              {/* History + Collection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-sm text-white/80">
                    <div className="font-semibold mb-3 text-white flex items-center gap-2">
                      <span>📚</span>
                      <span>Your Collection</span>
                    </div>
                    <div className="flex justify-between items-center backdrop-blur-md bg-white/5 rounded-xl p-3 border border-white/10">
                      <span>Unique Characters:</span>
                      <span className="font-bold text-cyan-300 text-lg truncate ml-2">{inventory.characters.length}</span>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="font-semibold mb-3 text-white flex items-center gap-2">
                    <span>🕒</span>
                    <span>Wish History</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {history.length === 0 ? (
                      <div className="text-sm text-white/60">No pulls yet.</div>
                    ) : (
                      history.slice(0, 10).map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between text-xs backdrop-blur-md bg-white/5 rounded-lg p-2 border border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="text-white/70">{new Date(entry.timestamp).toLocaleDateString()}</span>
                            <span className="text-white font-semibold">{entry.characterName}</span>
                            <span className="text-white/60">{entry.rarity}</span>
                            {entry.isNew && <span className="text-green-300">NEW</span>}
                          </div>
                          <span className="text-white/40">{entry.bannerId === 'limited' ? 'Limited' : 'Standard'}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : lastResult ? (
            <div className="flex flex-col items-center justify-center min-h-96">
              {/* Result Animation with Glow */}
              <div className="relative mb-8">
                <div className="absolute inset-0 blur-2xl opacity-50 animate-pulse" 
                     style={{ backgroundColor: lastResult.character.rarity === '⭐⭐⭐⭐⭐' ? '#fbbf24' : lastResult.character.rarity === '⭐⭐⭐⭐' ? '#a855f7' : '#3b82f6' }}></div>
                <div className="relative text-8xl animate-bounce drop-shadow-2xl">{lastResult.character.icon}</div>
              </div>

              {/* Rarity Star Burst */}
              <div className="text-5xl mb-6 drop-shadow-lg">
                {lastResult.character.rarity === '⭐⭐⭐⭐⭐' ? (
                  <span className="animate-pulse text-yellow-400">✨✨✨</span>
                ) : lastResult.character.rarity === '⭐⭐⭐⭐' ? (
                  <span className="animate-pulse text-purple-400">✨✨</span>
                ) : (
                  <span className="animate-pulse text-blue-400">✨</span>
                )}
              </div>

              {/* Character Info */}
              <h3 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
                {lastResult.character.name}
              </h3>
              <div className="text-xl text-white/70 mb-8">{lastResult.character.rarity}</div>

              {/* Result Type with Glass Effect */}
              <div className="text-center mb-8 w-full max-w-md">
                {lastResult.isNew ? (
                  <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl p-5 border-2 border-green-400/50 shadow-lg shadow-green-500/30">
                    <div className="text-green-300 font-bold text-xl mb-2 flex items-center justify-center gap-2">
                      <span>🎉</span>
                      <span>NEW CHARACTER!</span>
                    </div>
                    <p className="text-green-200">You've obtained a new hero!</p>
                  </div>
                ) : lastResult.isDuplicate && lastResult.constellationItem ? (
                  <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl p-5 border-2 border-purple-400/50 shadow-lg shadow-purple-500/30">
                    <div className="text-purple-300 font-bold text-xl mb-2 flex items-center justify-center gap-2">
                      <span>⭐</span>
                      <span>CONSTELLATION ITEM!</span>
                    </div>
                    <p className="text-purple-200">{lastResult.constellationItem}</p>
                    <p className="text-purple-300 text-sm mt-2">Unlock powerful perks for this character!</p>
                  </div>
                ) : null}
              </div>

              {/* Pull Count - 10 Pull Results */}
              {pullCount === 10 && tenPullResults.length > 0 && (
                <div className="w-full mb-8">
                  <div className="text-sm text-white/60 mb-5 text-center">
                    All 10 wishes (highlighted = best rarity):
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    {tenPullResults.map((result, index) => (
                      <div
                        key={index}
                        className={`backdrop-blur-xl p-3 rounded-xl text-center transition-all hover:scale-110 ${
                          result.character.id === lastResult.character.id
                            ? 'bg-yellow-500/30 border-2 border-yellow-400 shadow-lg shadow-yellow-500/50'
                            : 'bg-white/10 border-2 border-white/20'
                        }`}
                      >
                        <div className="text-3xl mb-2 drop-shadow-lg">{result.character.icon}</div>
                        <div className="text-xs font-semibold text-white truncate">{result.character.name}</div>
                        <div className="text-[10px] text-white/60 mt-1">{result.character.rarity}</div>
                        {result.isDuplicate && (
                          <div className="text-xs text-purple-400 font-bold mt-1">⭐</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pullCount === 1 && (
                <div className="text-sm text-white/50 mb-6 italic">
                  From single wish
                </div>
              )}

              {/* Continue Button with Premium Style */}
              <button
                onClick={() => {
                  setShowResult(false);
                  setLastResult(null);
                  setTenPullResults([]);
                }}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-2xl hover:shadow-blue-500/50 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <span>✨</span>
                <span>Continue Wishing</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GachaPullUI;
