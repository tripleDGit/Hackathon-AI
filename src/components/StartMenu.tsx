import { useState } from 'react';
import { GameConfig, Difficulty } from '@/types/game.types';
import { Character } from '@/types/character.types';
import MissionsTab from './MissionsTab';
import EventsTab from './EventsTab';
import LearningTab from './LearningTab';
import CharacterDisplay from './CharacterDisplay';
import GachaPullUI from './GachaPullUI';
import CharacterSelectionModal from './CharacterSelectionModal';
import BookUsageUI from './BookUsageUI';
import DungeonModal from './DungeonModal';
import WeeklyBossModal from './WeeklyBossModal';
import InventoryModal from './InventoryModal';
import DailyWheelModal from './DailyWheelModal';
import ShopModal from './ShopModal';
import { loadUserProgress } from '@/services/missions.service';
import { getActiveCharacter, getGachaCurrency, fixStuckCharacterLevels, cleanupDuplicateCharacters, grantDevResources } from '@/services/character.service';
import { getProgression, isBossLevel } from '@/services/progression.service';
import { getWeeklyBossState } from '@/services/weeklyBoss.service';
import { isDevModeEnabled, setDevModeEnabled } from '@/services/devMode.service';

interface StartMenuProps {
    onStartGame: (config: GameConfig) => void;
    isLoading: boolean;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStartGame, isLoading }) => {
    const [showMissions, setShowMissions] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
        const [showLearning, setShowLearning] = useState(false);
    const [showGacha, setShowGacha] = useState(false);
    const [showCharacterSelection, setShowCharacterSelection] = useState(false);
    const [showBookUI, setShowBookUI] = useState(false);
    const [showDungeon, setShowDungeon] = useState(false);
    const [showWeeklyBoss, setShowWeeklyBoss] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [showDailyWheel, setShowDailyWheel] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [devModeEnabled, setDevModeEnabledState] = useState(isDevModeEnabled());
    const [bookCharacter, setBookCharacter] = useState<Character | null>(null);
    const [activeCharacter, setActiveCharacter] = useState(getActiveCharacter());
    const [gachaCurrency, setGachaCurrency] = useState(getGachaCurrency());
    const userProgress = loadUserProgress();
    const progression = getProgression();
    const isNextBoss = isBossLevel(progression.currentLevel);
    const [weeklyBossState, setWeeklyBossState] = useState(getWeeklyBossState());

    const refreshWeeklyBossState = () => {
        setWeeklyBossState(getWeeklyBossState());
    };

    const handleToggleDevMode = () => {
        const next = !devModeEnabled;
        setDevModeEnabled(next);
        setDevModeEnabledState(next);
        refreshWeeklyBossState();
    };

    const handleClearCache = () => {
        localStorage.removeItem('character_inventory');
        fixStuckCharacterLevels();
        setActiveCharacter(getActiveCharacter());
        setShowSettings(false);
        alert('Character cache cleared and reloaded!');
    };

    const handleCleanupDuplicates = () => {
        const result = cleanupDuplicateCharacters();
        if (result.removed > 0) {
            setActiveCharacter(getActiveCharacter());
            alert(`Cleanup complete!\n${result.removed} duplicate character(s) removed.\n${result.itemsAdded} constellation item(s) added.`);
        } else {
            alert('No duplicate characters found. Your collection is already clean!');
        }
    };

    const handleGrantDevResources = (type: 'books' | 'gems' | 'materials' | 'all') => {
        grantDevResources(type);
        setGachaCurrency(getGachaCurrency());
        
        let message = '';
        if (type === 'books') {
            message = 'Granted:\n+50 Tier 1 Books\n+30 Tier 2 Books\n+15 Tier 3 Books';
        } else if (type === 'gems') {
            message = 'Granted:\n+5000 Free Gems\n+1000 Primogems\n+10 Wishes';
        } else if (type === 'materials') {
            message = 'Granted:\n+100 Sparks, +50 Cores, +25 Prisms\n+50 of each Ascension Material\n+20 of each Weekly Boss Material';
        } else {
            message = 'Granted all resources!\nBooks, Gems, and Materials added to inventory.';
        }
        alert(message);
    };

    const handleStart = () => {
        // Config is no longer used for difficulty since it's based on progression
        onStartGame({
            difficulty: Difficulty.MEDIUM, // Placeholder, actual difficulty from progression
            numberOfQuestions: 999, // Not used anymore
            timeLimit: 999, // Not used anymore
        });
    };

    const handleCharacterUpdate = () => {
        const updated = getActiveCharacter();
        if (updated) {
            setActiveCharacter(updated);
        }
    };

    const handleOpenBookUI = (character: Character) => {
        setBookCharacter(character);
        setShowBookUI(true);
    };

    const handleBookUseClose = () => {
        setShowBookUI(false);
        setBookCharacter(null);
        handleCharacterUpdate();
    };

    return (
        <>
            {showMissions && <MissionsTab onClose={() => setShowMissions(false)} />}
            {showEvents && <EventsTab onClose={() => setShowEvents(false)} />}
                {showLearning && <LearningTab onClose={() => setShowLearning(false)} />}
            {showGacha && (
                <GachaPullUI
                    onClose={() => {
                        setShowGacha(false);
                        setActiveCharacter(getActiveCharacter());
                        setGachaCurrency(getGachaCurrency());
                    }}
                    onPullSuccess={() => {
                        setActiveCharacter(getActiveCharacter());
                        setGachaCurrency(getGachaCurrency());
                    }}
                />
            )}
            {showBookUI && bookCharacter && (
                <BookUsageUI
                    character={bookCharacter}
                    onClose={handleBookUseClose}
                    onUseBook={handleBookUseClose}
                />
            )}
            {showCharacterSelection && (
                <CharacterSelectionModal
                    onClose={() => setShowCharacterSelection(false)}
                    onCharacterChange={handleCharacterUpdate}
                    onOpenBookUI={handleOpenBookUI}
                />
            )}
            {showDungeon && (
                <DungeonModal onClose={() => setShowDungeon(false)} />
            )}
            {showWeeklyBoss && (
                <WeeklyBossModal
                    onClose={() => {
                        setShowWeeklyBoss(false);
                        refreshWeeklyBossState();
                    }}
                    onComplete={refreshWeeklyBossState}
                />
            )}
            {showInventory && (
                <InventoryModal onClose={() => setShowInventory(false)} />
            )}
            {showDailyWheel && (
                <DailyWheelModal onClose={() => setShowDailyWheel(false)} />
            )}
            {showShop && (
                <ShopModal
                    onClose={() => setShowShop(false)}
                    onPurchase={() => {
                        setGachaCurrency(getGachaCurrency());
                    }}
                />
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000]">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative z-[10000] overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-bold">⚙️ Settings</h2>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
                                <div>
                                    <div className="font-semibold text-gray-800">Developer Mode</div>
                                    <div className="text-xs text-gray-600">Disables cooldowns (daily/weekly).</div>
                                </div>
                                <button
                                    onClick={handleToggleDevMode}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                        devModeEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-700'
                                    }`}
                                >
                                    {devModeEnabled ? 'ON' : 'OFF'}
                                </button>
                            </div>

                            {/* Developer Resources */}
                            {devModeEnabled && (
                                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4 space-y-2">
                                    <h3 className="font-bold text-emerald-900 text-sm mb-2">🛠️ Developer Resources</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleGrantDevResources('gems')}
                                            className="py-2 px-3 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold rounded-lg transition-all"
                                        >
                                            💎 Gems
                                        </button>
                                        <button
                                            onClick={() => handleGrantDevResources('books')}
                                            className="py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all"
                                        >
                                            📚 Books
                                        </button>
                                        <button
                                            onClick={() => handleGrantDevResources('materials')}
                                            className="py-2 px-3 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-lg transition-all"
                                        >
                                            ✨ Materials
                                        </button>
                                        <button
                                            onClick={() => handleGrantDevResources('all')}
                                            className="py-2 px-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-sm font-bold rounded-lg transition-all"
                                        >
                                            🎁 All
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <button
                                onClick={handleCleanupDuplicates}
                                className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <span>⭐</span>
                                Clean Up Duplicate Characters
                            </button>
                            <p className="text-xs text-gray-600 text-center">
                                Removes duplicate characters and converts them to constellation items
                            </p>
                            
                            <button
                                onClick={handleClearCache}
                                className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <span>🔄</span>
                                Clear Character Cache
                            </button>
                            <p className="text-xs text-gray-600 text-center">
                                Resets character data and fixes level-up issues
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                    <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl w-full relative z-10">
                    {/* Character Display (Left) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-8">
                            {/* Character Card with Glass Effect */}
                            <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                                <CharacterDisplay 
                                    character={activeCharacter}
                                    onShowCharacterSelection={() => setShowCharacterSelection(true)}
                                    onCharacterUpdate={handleCharacterUpdate}
                                />
                            </div>
                            
                            {/* Gacha Button with Premium Style */}
                            <button
                                onClick={() => setShowGacha(true)}
                                className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-300 hover:via-amber-400 hover:to-orange-400 text-white font-bold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-yellow-500/50 flex items-center justify-center gap-3"
                            >
                                <span className="text-2xl">✨</span>
                                <span className="text-lg">Wish System</span>
                                <span className="text-2xl">✨</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Menu (Right) */}
                    <div className="lg:col-span-2">
                        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-10 border border-white/20">
                            {/* Currency Display with Glow Effect */}
                            <div className="grid grid-cols-3 gap-8 mb-12">
                                <div className="backdrop-blur-md bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-3xl p-6 border border-yellow-400/30 text-center shadow-lg hover:shadow-yellow-500/50 transition-all hover:scale-105">
                                    <div className="text-5xl font-bold text-yellow-300 drop-shadow-lg truncate">{gachaCurrency.freeGems}</div>
                                    <div className="text-sm text-yellow-200 font-semibold">💛 Gems</div>
                                </div>
                                <div className="backdrop-blur-md bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-3xl p-6 border border-purple-400/30 text-center shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105">
                                    <div className="text-5xl font-bold text-purple-300 drop-shadow-lg truncate">{gachaCurrency.primogems}</div>
                                    <div className="text-sm text-purple-200 font-semibold">💎 Premium</div>
                                </div>
                                <div className="backdrop-blur-md bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-3xl p-6 border border-blue-400/30 text-center shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105">
                                    <div className="text-5xl font-bold text-blue-300 drop-shadow-lg truncate">{userProgress.totalPoints}</div>
                                    <div className="text-sm text-blue-200 font-semibold">⭐ Points</div>
                                </div>
                            </div>

                            {/* Title with Glow */}
                            <div className="text-center mb-14">
                                <h1 className="text-7xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
                                    Math Quest
                                </h1>
                                <p className="text-white/80 text-2xl font-medium">Challenge your skills and collect heroes!</p>
                            </div>

                            {/* Battle Progression Info with Glass Effect */}
                            <div className="backdrop-blur-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl p-10 mb-10 border border-indigo-400/30 shadow-xl">
                                <h2 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
                                    {isNextBoss ? (
                                        <>
                                            <span className="text-5xl animate-bounce">👑</span>
                                            <span>Boss Battle Ahead!</span>
                                            <span className="text-5xl animate-bounce">👑</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-4xl">⚔️</span>
                                            <span>Next Battle</span>
                                        </>
                                    )}
                                </h2>
                                <div className="grid grid-cols-2 gap-6 text-center">
                                    <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
                                        <div className="text-5xl font-bold text-cyan-300 drop-shadow-lg truncate">Level {progression.currentLevel}</div>
                                        <div className="text-base text-white/70 mt-2">Current Level</div>
                                    </div>
                                    <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
                                        <div className="text-5xl font-bold text-pink-300 drop-shadow-lg truncate">{progression.enemiesDefeated}</div>
                                        <div className="text-base text-white/70 mt-2">Defeated</div>
                                    </div>
                                </div>
                                {progression.bossesDefeated > 0 && (
                                    <div className="mt-6 backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
                                        <div className="text-lg text-white/90">
                                            👑 Bosses Conquered: <span className="font-bold text-yellow-300 text-2xl break-words">{progression.bossesDefeated}</span>
                                        </div>
                                    </div>
                                )}
                                {isNextBoss && (
                                    <div className="mt-6 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-2xl p-6 text-center border border-yellow-400/50 shadow-lg shadow-yellow-500/30">
                                        <p className="text-lg font-bold text-yellow-200">⚠️ Epic Boss Battle!</p>
                                        <p className="text-sm text-yellow-100 mt-1">Defeat to earn Premium Currency!</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Start Button with Enhanced Style */}
                                <button
                                    onClick={handleStart}
                                    disabled={isLoading}
                                    className={`w-full py-7 rounded-3xl font-bold text-2xl transition-all duration-300 transform shadow-2xl ${
                                        isLoading
                                            ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 hover:scale-105 hover:shadow-purple-500/50'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg
                                                className="animate-spin h-6 w-6 mr-3"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Generating Questions...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="text-2xl">{isNextBoss ? '👑' : '⚔️'}</span>
                                            <span>{isNextBoss ? 'Start Boss Battle' : 'Start Battle'}</span>
                                        </span>
                                    )}
                                </button>

                                {/* Grid of Feature Buttons */}
                                <div className="grid grid-cols-2 gap-6">
                                    <button
                                        onClick={() => setShowMissions(true)}
                                        className="py-7 rounded-3xl font-semibold backdrop-blur-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:scale-105"
                                    >
                                        <span className="text-4xl">📋</span>
                                        <span className="text-lg">Daily Missions</span>
                                    </button>

                                    <button
                                        onClick={() => setShowEvents(true)}
                                        className="py-7 rounded-3xl font-semibold backdrop-blur-md bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-400/30 transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:scale-105"
                                    >
                                        <span className="text-4xl">🎪</span>
                                        <span className="text-lg">Events</span>
                                    </button>

                                        <button
                                            onClick={() => setShowLearning(true)}
                                            className="py-7 rounded-3xl font-semibold backdrop-blur-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:scale-105"
                                        >
                                            <span className="text-4xl">📖</span>
                                            <span className="text-lg">Learning</span>
                                        </button>

                                    <button
                                        onClick={() => setShowDungeon(true)}
                                        className="py-7 rounded-3xl font-semibold backdrop-blur-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:scale-105"
                                    >
                                        <span className="text-4xl">🏰</span>
                                        <span className="text-lg">Dungeons</span>
                                    </button>

                                    <button
                                        onClick={() => setShowWeeklyBoss(true)}
                                        className={`py-7 rounded-3xl font-semibold backdrop-blur-md transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                                            weeklyBossState.isAvailable
                                                ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 hover:scale-105'
                                                : 'bg-gray-600/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                                        }`}
                                        disabled={!weeklyBossState.isAvailable}
                                    >
                                        <span className="text-4xl">👑</span>
                                        <span className="text-base">{weeklyBossState.isAvailable ? `Boss • ${weeklyBossState.attemptsLeft} left` : `(${weeklyBossState.daysRemaining}d)`}</span>
                                    </button>

                                    <button
                                        onClick={() => setShowDailyWheel(true)}
                                        className="py-7 rounded-3xl font-semibold backdrop-blur-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:scale-105"
                                    >
                                        <span className="text-4xl">🎡</span>
                                        <span className="text-lg">Daily Wheel</span>
                                    </button>

                                    <button
                                        onClick={() => setShowInventory(true)}
                                        className="py-7 rounded-3xl font-semibold backdrop-blur-md bg-slate-500/20 hover:bg-slate-500/30 text-slate-200 border border-slate-400/30 transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:scale-105"
                                    >
                                        <span className="text-4xl">🎒</span>
                                        <span className="text-lg">Inventory</span>
                                    </button>

                                    <button
                                        onClick={() => setShowShop(true)}
                                        className="py-7 rounded-3xl font-semibold backdrop-blur-md bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-400/30 transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:scale-105"
                                    >
                                        <span className="text-4xl">🏪</span>
                                        <span className="text-lg">Shop</span>
                                    </button>
                                </div>

                                {/* Settings Button */}
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="w-full py-5 rounded-3xl font-semibold backdrop-blur-md bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 border border-gray-400/30 transition-all duration-200 flex items-center justify-center gap-3 text-lg"
                                >
                                    <span className="text-3xl">⚙️</span>
                                    <span>Settings</span>
                                </button>
                            </div>

                            <div className="mt-10 text-center text-base text-white/50">
                                <p>✨ Powered by AI • Gacha Collection System ✨</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StartMenu;
