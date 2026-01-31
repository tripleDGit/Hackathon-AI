import { GameResults } from '@/types/game.types';
import { updateMissionProgress } from '@/services/missions.service';
import { addGamePointsAsGems, addBooks, addPrimogems } from '@/services/character.service';
import { advanceLevel } from '@/services/progression.service';
import { calculateBattleRewards } from '@/services/battle.service';
import { useEffect, useState } from 'react';

interface ResultsScreenProps {
    results: GameResults;
    onRestart: () => void;
    difficulty: string;
    battleWon?: boolean;
    enemyDefeated?: string;
    enemyLevel?: number;
    isBoss?: boolean;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
    results,
    onRestart,
    difficulty,
    battleWon = true,
    enemyDefeated,
    enemyLevel = 1,
    isBoss = false,
}) => {
    const { totalQuestions, correctAnswers, totalTime, score } = results;
    const [pointsEarned, setPointsEarned] = useState(0);
    const [gemsEarned, setGemsEarned] = useState(0);
    const [primogemsEarned, setPrimogemsEarned] = useState(0);
    const [booksEarned, setBooksEarned] = useState({ tier1: 0, tier2: 0, tier3: 0 });
    const [newMissionsCompleted, setNewMissionsCompleted] = useState<string[]>([]);
    const [newLevel, setNewLevel] = useState(0);
    const [rewardsProcessed, setRewardsProcessed] = useState(false);

    useEffect(() => {
        // Only process rewards once
        if (rewardsProcessed || !battleWon) return;

        setRewardsProcessed(true);

        // Advance to next level and get rewards
        const progression = advanceLevel();
        setNewLevel(progression.currentLevel);

        // Calculate battle rewards
        const enemyObject = {
            id: 'temp',
            name: enemyDefeated || 'Enemy',
            level: enemyLevel,
            hp: 100,
            maxHp: 100,
            attack: 10,
            defense: 5,
            speed: 10,
            icon: '👾',
            difficulty: difficulty as 'easy' | 'medium' | 'hard',
            isBoss: isBoss
        };
        const rewards = calculateBattleRewards(
            enemyObject,
            battleWon
        );

        setPointsEarned(rewards.points);
        setGemsEarned(rewards.gems);
        setPrimogemsEarned(rewards.primogems);

        // Award currency
        addGamePointsAsGems(rewards.gems);
        if (rewards.primogems > 0) {
            addPrimogems(rewards.primogems);
        }

        // Award books based on score
        let t1 = 0, t2 = 0, t3 = 0;
        if (score >= 90) {
            t3 = 2;
            t2 = 1;
        } else if (score >= 75) {
            t2 = 2;
            t1 = 1;
        } else if (score >= 60) {
            t2 = 1;
            t1 = 2;
        } else {
            t1 = Math.floor(score / 20);
        }

        addBooks(1, t1);
        addBooks(2, t2);
        addBooks(3, t3);
        setBooksEarned({ tier1: t1, tier2: t2, tier3: t3 });

        // Update mission progress
        const oldProgress = { ...updateMissionProgress(difficulty, 0, 0, 0) };
        const oldCompletedDaily = [...oldProgress.completedDailyMissions];
        const oldCompletedWeekly = [...oldProgress.completedWeeklyMissions];
        const oldUnlocked = [...oldProgress.unlockedAchievements];

        const newProgress = updateMissionProgress(difficulty, correctAnswers, score, totalTime);

        // Check which missions/achievements were just completed
        const newlyCompleted = [
            ...newProgress.completedDailyMissions.filter(id => !oldCompletedDaily.includes(id)),
            ...newProgress.completedWeeklyMissions.filter(id => !oldCompletedWeekly.includes(id)),
            ...newProgress.unlockedAchievements.filter(id => !oldUnlocked.includes(id)),
        ];
        setNewMissionsCompleted(newlyCompleted);
    }, [battleWon, correctAnswers, difficulty, enemyDefeated, enemyLevel, isBoss, rewardsProcessed, score, totalTime]); // Run only once on mount

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getPerformanceMessage = () => {
        if (score >= 90) return { message: 'Outstanding! 🏆', color: 'text-yellow-500' };
        if (score >= 75) return { message: 'Great Job! 🌟', color: 'text-green-500' };
        if (score >= 60) return { message: 'Good Effort! 👍', color: 'text-blue-500' };
        if (score >= 40) return { message: 'Keep Practicing! 💪', color: 'text-orange-500' };
        return { message: 'Try Again! 📚', color: 'text-red-500' };
    };

    const performance = getPerformanceMessage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
                {/* Battle Result Banner */}
                {battleWon !== undefined && (
                    <div className={`${battleWon ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'} rounded-xl p-6 mb-6 text-white text-center`}>
                        <div className="text-4xl mb-2">{battleWon ? '⚔️ VICTORY! ⚔️' : '💀 DEFEATED 💀'}</div>
                        {enemyDefeated && (
                            <>
                                <p className="text-lg font-semibold mb-1">
                                    You {battleWon ? 'defeated' : 'were defeated by'} {enemyDefeated}!
                                </p>
                                {isBoss && <p className="text-sm text-yellow-200">🏆 BOSS DEFEATED! 🏆</p>}
                            </>
                        )}
                        {battleWon && newLevel > 0 && (
                            <p className="text-sm mt-2">Advanced to Level {newLevel}!</p>
                        )}
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className={`text-5xl font-bold mb-2 ${performance.color}`}>
                        {performance.message}
                    </h1>
                    <p className="text-gray-600">Here's how you did</p>
                </div>

                {/* Score Circle */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <svg className="transform -rotate-90 w-48 h-48">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                className="text-gray-200"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 88}`}
                                strokeDashoffset={`${2 * Math.PI * 88 * (1 - score / 100)}`}
                                className="text-primary-500 transition-all duration-1000"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-gray-800">{score}%</div>
                                <div className="text-sm text-gray-600">Score</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                        <div className="text-sm text-gray-600">Correct</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">
                            {totalQuestions - correctAnswers}
                        </div>
                        <div className="text-sm text-gray-600">Wrong</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{formatTime(totalTime)}</div>
                        <div className="text-sm text-gray-600">Time</div>
                    </div>
                </div>

                {/* Rewards Section */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border-2 border-yellow-300 text-center">
                        <div className="text-2xl mb-1">💛</div>
                        <div className="text-2xl font-bold text-yellow-600">+{gemsEarned}</div>
                        <div className="text-xs text-yellow-600">Gems</div>
                    </div>
                    {primogemsEarned > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-300 text-center">
                            <div className="text-2xl mb-1">💜</div>
                            <div className="text-2xl font-bold text-purple-600">+{primogemsEarned}</div>
                            <div className="text-xs text-purple-600">Premium</div>
                        </div>
                    )}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-300 text-center">
                        <div className="text-2xl mb-1">⭐</div>
                        <div className="text-2xl font-bold text-blue-600">+{pointsEarned}</div>
                        <div className="text-xs text-blue-600">Points</div>
                    </div>
                </div>

                {/* Books Earned */}
                {(booksEarned.tier1 > 0 || booksEarned.tier2 > 0 || booksEarned.tier3 > 0) && (
                    <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border-2 border-blue-300">
                        <h3 className="font-bold text-gray-800 mb-3 text-center">📚 Training Books Earned</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {booksEarned.tier1 > 0 && (
                                <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                                    <div className="text-3xl mb-1">📘</div>
                                    <div className="text-xl font-bold text-blue-600">+{booksEarned.tier1}</div>
                                    <div className="text-xs text-gray-600">Basic Book</div>
                                    <div className="text-xs text-gray-500">(100 XP)</div>
                                </div>
                            )}
                            {booksEarned.tier2 > 0 && (
                                <div className="bg-white rounded-lg p-3 text-center border border-green-200">
                                    <div className="text-3xl mb-1">📗</div>
                                    <div className="text-xl font-bold text-green-600">+{booksEarned.tier2}</div>
                                    <div className="text-xs text-gray-600">Advanced Book</div>
                                    <div className="text-xs text-gray-500">(250 XP)</div>
                                </div>
                            )}
                            {booksEarned.tier3 > 0 && (
                                <div className="bg-white rounded-lg p-3 text-center border border-red-200">
                                    <div className="text-3xl mb-1">📕</div>
                                    <div className="text-xl font-bold text-red-600">+{booksEarned.tier3}</div>
                                    <div className="text-xs text-gray-600">Expert Book</div>
                                    <div className="text-xs text-gray-500">(500 XP)</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Mission Progress Notification */}
                {pointsEarned > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">🎉</span>
                            <div>
                                <div className="text-lg font-bold text-gray-800">
                                    Mission Progress!
                                </div>
                                <div className="text-sm text-gray-600">
                                    You earned <span className="font-bold text-yellow-600">+{pointsEarned} points</span>
                                </div>
                            </div>
                        </div>
                        {newMissionsCompleted.length > 0 && (
                            <div className="mt-2 text-sm text-green-600 font-semibold">
                                ✓ {newMissionsCompleted.length} mission{newMissionsCompleted.length > 1 ? 's' : ''} completed!
                            </div>
                        )}
                    </div>
                )}

                {/* Question Review */}
                <div className="mb-8 max-h-64 overflow-y-auto">
                    <h3 className="font-semibold text-gray-800 mb-3">Question Review</h3>
                    <div className="space-y-2">
                        {results.answers.map((answer, index) => (
                            <div
                                key={answer.questionId}
                                className={`flex items-center justify-between p-3 rounded-lg ${answer.isCorrect ? 'bg-green-50' : 'bg-red-50'
                                    }`}
                            >
                                <span className="text-sm font-medium text-gray-700">
                                    Question {index + 1}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">
                                        {answer.timeSpent}s
                                    </span>
                                    <span className="text-lg">
                                        {answer.isCorrect ? '✅' : '❌'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={onRestart}
                        className="w-full py-4 rounded-lg font-bold text-lg bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                    >
                        Play Again
                    </button>
                    <button
                        onClick={onRestart}
                        className="w-full py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultsScreen;
