import { useState, useEffect } from 'react';
import { MathQuestion } from '@/types/game.types';
import { Character } from '@/types/character.types';
import { BattleState, BattleAction } from '@/types/battle.types';
import BattleDisplay from './BattleDisplay';
import MathRenderer from './MathRenderer';

interface QuestionDisplayProps {
    question: MathQuestion;
    questionNumber: number;
    totalQuestions: number;
    timeLimit?: number;
    onAnswer: (answer: number, timeSpent: number) => void;
    onForfeit?: () => void;
    character: Character;
    battleState?: BattleState;
    lastBattleAction?: BattleAction | null;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    question,
    questionNumber,
    onAnswer,
    onForfeit,
    character,
    battleState,
    lastBattleAction,
}) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [timeSpent, setTimeSpent] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [showPauseMenu, setShowPauseMenu] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showActionAnimation, setShowActionAnimation] = useState(false);

    // Reset state when question changes
    useEffect(() => {
        setSelectedAnswer(null);
        setTimeSpent(0);
        setStartTime(Date.now());
    }, [question.id]);

    useEffect(() => {
        if (isPaused) return;
        
        const timer = setInterval(() => {
            setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime, isPaused]);

    useEffect(() => {
        // Trigger animation when there's a new battle action
        if (lastBattleAction) {
            setShowActionAnimation(true);
            const timer = setTimeout(() => setShowActionAnimation(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [lastBattleAction]);

    const handleOpenMenu = () => {
        setShowPauseMenu(true);
        setIsPaused(true);
    };

    const handleContinue = () => {
        setShowPauseMenu(false);
        setIsPaused(false);
    };

    const handleForfeit = () => {
        if (onForfeit) {
            onForfeit();
        }
    };

    const handleSelectAnswer = (answer: number) => {
        setSelectedAnswer(answer);
    };

    const handleSubmit = () => {
        if (selectedAnswer !== null) {
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            onAnswer(selectedAnswer, timeTaken);
            setSelectedAnswer(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
            {/* Pause Menu Modal */}
            {showPauseMenu && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={handleContinue}
                    />
                    
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative z-10">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white text-center">
                            <h2 className="text-3xl font-bold mb-2">⏸️ Paused</h2>
                            <p className="text-indigo-100">Game is paused</p>
                        </div>
                        
                        <div className="p-6 space-y-3">
                            <button
                                onClick={handleContinue}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <span className="text-2xl">▶️</span>
                                <span>Continue</span>
                            </button>
                            
                            <button
                                onClick={handleForfeit}
                                className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <span className="text-2xl">🏳️</span>
                                <span>Forfeit & Return to Menu</span>
                            </button>
                            
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-600 mb-2">Battle Progress</p>
                                <p className="text-lg font-bold text-gray-800">
                                    Question #{questionNumber}
                                </p>
                                {battleState && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <div>Your HP: {battleState.playerHp}/{battleState.playerMaxHp}</div>
                                        <div>Enemy HP: {battleState.enemy.hp}/{battleState.enemy.maxHp}</div>
                                    </div>
                                )}
                                <p className="text-sm text-gray-600 mt-1">
                                    Time Elapsed: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
                {/* Battle Display */}
                {battleState && (
                    <BattleDisplay
                        character={character}
                        battleState={battleState}
                        lastAction={lastBattleAction || null}
                        showActionAnimation={showActionAnimation}
                    />
                )}

                {/* Header with Menu Button */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-gray-800">Math Quiz</h1>
                    <button
                        onClick={handleOpenMenu}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Menu
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Question #{questionNumber}</span>
                        <span>Time: {timeSpent}s</span>
                    </div>
                    {/* Battle Progress - Show HP bars instead of question progress */}
                    {battleState && (
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <div className="text-xs text-gray-600 mb-1">Your HP</div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            (battleState.playerHp / battleState.playerMaxHp) * 100 > 50
                                                ? 'bg-green-500'
                                                : (battleState.playerHp / battleState.playerMaxHp) * 100 > 25
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                        }`}
                                        style={{ width: `${(battleState.playerHp / battleState.playerMaxHp) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-sm font-bold text-gray-600">VS</div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-600 mb-1">Enemy HP</div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            (battleState.enemy.hp / battleState.enemy.maxHp) * 100 > 50
                                                ? 'bg-green-500'
                                                : (battleState.enemy.hp / battleState.enemy.maxHp) * 100 > 25
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                        }`}
                                        style={{ width: `${(battleState.enemy.hp / battleState.enemy.maxHp) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Question */}
                <div className="mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <span className="text-sm font-semibold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                            {question.difficulty.toUpperCase()}
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-center text-gray-800 mb-8">
                        <MathRenderer content={question.question} />
                    </div>
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectAnswer(option)}
                            className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${selectedAnswer === option
                                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-102'
                                }`}
                        >
                            <MathRenderer content={String(option)} />
                        </button>
                    ))}
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${selectedAnswer === null
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        }`}
                >
                    Submit Answer
                </button>
            </div>
        </div>
    );
};

export default QuestionDisplay;
