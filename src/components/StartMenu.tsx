import { useState } from 'react';
import { GameConfig, Difficulty } from '@/types/game.types';
import { Character } from '@/types/character.types';
import MissionsTab from './MissionsTab';
import CharacterDisplay from './CharacterDisplay';
import GachaPullUI from './GachaPullUI';
import CharacterSelectionModal from './CharacterSelectionModal';
import BookUsageUI from './BookUsageUI';
import { loadUserProgress } from '@/services/missions.service';
import { getActiveCharacter, getGachaCurrency, fixStuckCharacterLevels } from '@/services/character.service';
import { getProgression, isBossLevel } from '@/services/progression.service';

interface StartMenuProps {
    onStartGame: (config: GameConfig) => void;
    isLoading: boolean;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStartGame, isLoading }) => {
    const [showMissions, setShowMissions] = useState(false);
    const [showGacha, setShowGacha] = useState(false);
    const [showCharacterSelection, setShowCharacterSelection] = useState(false);
    const [showBookUI, setShowBookUI] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [bookCharacter, setBookCharacter] = useState<Character | null>(null);
    const [activeCharacter, setActiveCharacter] = useState(getActiveCharacter());
    const [gachaCurrency, setGachaCurrency] = useState(getGachaCurrency());
    const userProgress = loadUserProgress();
    const progression = getProgression();
    const isNextBoss = isBossLevel(progression.currentLevel);

    const handleClearCache = () => {
        localStorage.removeItem('character_inventory');
        fixStuckCharacterLevels();
        setActiveCharacter(getActiveCharacter());
        setShowSettings(false);
        alert('Character cache cleared and reloaded!');
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

            <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl w-full">
                    {/* Character Display (Left) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <CharacterDisplay 
                                character={activeCharacter}
                                onShowCharacterSelection={() => setShowCharacterSelection(true)}
                            />
                            <button
                                onClick={() => setShowGacha(true)}
                                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:shadow-lg text-white font-bold rounded-lg transition-all duration-200 transform hover:-translate-y-1"
                            >
                                ✨ Gacha Pull
                            </button>
                        </div>
                    </div>

                    {/* Main Menu (Right) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-2xl p-8">
                            {/* Currency Display */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-300 text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{gachaCurrency.freeGems}</div>
                                    <div className="text-xs text-yellow-600">💛 Gems</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-300 text-center">
                                    <div className="text-2xl font-bold text-purple-600">{gachaCurrency.primogems}</div>
                                    <div className="text-xs text-purple-600">💜 Premium</div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{userProgress.totalPoints}</div>
                                    <div className="text-xs text-blue-600">⭐ Points</div>
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                    🧮 Math Quiz Game
                                </h1>
                                <p className="text-gray-600">Challenge your math skills in battle!</p>
                            </div>

                            {/* Battle Progression Info */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl p-6 mb-6 border-2 border-indigo-300">
                                <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">
                                    {isNextBoss ? '👑 Boss Battle Ahead!' : '⚔️ Next Battle'}
                                </h2>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-3xl font-bold text-indigo-600">Level {progression.currentLevel}</div>
                                        <div className="text-xs text-gray-600">Current Level</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-purple-600">{progression.enemiesDefeated}</div>
                                        <div className="text-xs text-gray-600">Enemies Defeated</div>
                                    </div>
                                </div>
                                {progression.bossesDefeated > 0 && (
                                    <div className="mt-3 text-center">
                                        <div className="text-sm text-gray-600">
                                            👑 Bosses Defeated: <span className="font-bold">{progression.bossesDefeated}</span>
                                        </div>
                                    </div>
                                )}
                                {isNextBoss && (
                                    <div className="mt-3 bg-yellow-100 rounded-lg p-2 text-center">
                                        <p className="text-sm font-semibold text-yellow-800">⚠️ This is a Boss Battle!</p>
                                        <p className="text-xs text-yellow-700">Defeat to earn Premium Currency!</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Start Button */}
                                <button
                                    onClick={handleStart}
                                    disabled={isLoading}
                                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
                                        isLoading
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg
                                                className="animate-spin h-5 w-5 mr-3"
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
                                        <span>{isNextBoss ? '⚔️ Start Boss Battle' : '⚔️ Start Battle'}</span>
                                    )}
                                </button>

                                {/* Missions Button */}
                                <button
                                    onClick={() => setShowMissions(true)}
                                    className="w-full py-3 rounded-lg font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <span className="text-xl">📋</span>
                                    Daily Missions
                                </button>

                                {/* Settings Button */}
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="w-full py-3 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <span className="text-xl">⚙️</span>
                                    Settings
                                </button>
                            </div>

                            <div className="mt-6 text-center text-sm text-gray-500">
                                <p>Powered by AI • With Gacha System</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StartMenu;
