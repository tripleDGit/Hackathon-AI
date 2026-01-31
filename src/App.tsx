import { GameState } from '@/types/game.types';
import { useGameState } from '@/hooks/useGameState';
import StartMenu from '@/components/StartMenu';
import QuestionDisplay from '@/components/QuestionDisplay';
import ResultsScreen from '@/components/ResultsScreen';
import { getActiveCharacter, fixStuckCharacterLevels } from '@/services/character.service';
import { useState, useEffect } from 'react';

function App() {
    const {
        gameState,
        config,
        currentQuestion,
        currentQuestionIndex,
        questions,
        isLoading,
        error,
        battleState,
        lastBattleAction,
        startGame,
        submitAnswer,
        resetGame,
        getResults,
    } = useGameState();

    const [activeCharacter, setActiveCharacter] = useState(() => {
        // Fix stuck characters before loading
        fixStuckCharacterLevels();
        return getActiveCharacter();
    });

    // Refresh character when game state changes
    useEffect(() => {
        setActiveCharacter(getActiveCharacter());
    }, [gameState]);

    return (
        <>
            {error && (
                <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                    {error}
                </div>
            )}

            {gameState === GameState.MENU && (
                <StartMenu onStartGame={startGame} isLoading={isLoading} />
            )}

            {gameState === GameState.PLAYING && currentQuestion && (
                <QuestionDisplay
                    question={currentQuestion}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                    onAnswer={submitAnswer}
                    onForfeit={resetGame}
                    character={activeCharacter}
                    battleState={battleState || undefined}
                    lastBattleAction={lastBattleAction}
                />
            )}

            {gameState === GameState.RESULTS && (
                <ResultsScreen 
                    results={getResults()} 
                    onRestart={resetGame}
                    difficulty={config.difficulty}
                    battleWon={battleState ? battleState.enemy.hp <= 0 : undefined}
                    enemyDefeated={battleState?.enemy.name}
                    enemyLevel={battleState?.enemy.level}
                    isBoss={battleState?.enemy.isBoss}
                />
            )}
        </>
    );
}

export default App;
