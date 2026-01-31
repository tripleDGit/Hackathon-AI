import { useState, useCallback, useEffect } from 'react';
import { GameState, GameConfig, MathQuestion, Answer, GameResults, Difficulty } from '@/types/game.types';
import { BattleState, BattleAction } from '@/types/battle.types';
import { generateMathQuestions } from '@/services/mathApi.service';
import { getActiveCharacter } from '@/services/character.service';
import { initializeBattle, executeBattleTurn, isBattleOver } from '@/services/battle.service';
import { getProgression, getDifficultyForLevel } from '@/services/progression.service';

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.MENU);
    const [config, setConfig] = useState<GameConfig>({
        difficulty: Difficulty.MEDIUM,
        numberOfQuestions: 10,
        timeLimit: 300, // 5 minutes
    });
    const [questions, setQuestions] = useState<MathQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [battleState, setBattleState] = useState<BattleState | null>(null);
    const [lastBattleAction, setLastBattleAction] = useState<BattleAction | null>(null);

    // Reset to menu on mount to prevent stale state issues
    useEffect(() => {
        setGameState(GameState.MENU);
    }, []);

    const startGame = useCallback(async (gameConfig: GameConfig) => {
        console.log('[GameState] Starting game...');
        setIsLoading(true);
        setError(null);
        setConfig(gameConfig);
        setIsSubmitting(false);

        try {
            // Get current progression to determine difficulty
            console.log('[GameState] Getting progression...');
            const progression = getProgression();
            console.log('[GameState] Progression:', progression);
            
            const currentDifficulty = getDifficultyForLevel(progression.currentLevel);
            console.log('[GameState] Difficulty:', currentDifficulty);
            
            // Generate initial batch of questions based on progression difficulty
            const initialBatchSize = 5;
            console.log('[GameState] Generating questions...');
            const generatedQuestions = await generateMathQuestions(
                currentDifficulty,
                initialBatchSize
            );
            console.log('[GameState] Questions generated:', generatedQuestions.length);

            if (!generatedQuestions || generatedQuestions.length === 0) {
                throw new Error('No questions were generated');
            }

            setQuestions(generatedQuestions);
            setAnswers([]);
            setCurrentQuestionIndex(0);
            
            // Initialize battle based on progression
            console.log('[GameState] Initializing battle...');
            const character = getActiveCharacter();
            console.log('[GameState] Character:', character.name);
            
            const initialBattle = initializeBattle(character);
            console.log('[GameState] Battle initialized:', initialBattle.enemy.name);
            
            setBattleState(initialBattle);
            setLastBattleAction(null);
            
            // Set game state LAST to ensure everything is ready
            setGameState(GameState.PLAYING);
            console.log('[GameState] Game started successfully!');
        } catch (err) {
            console.error('[GameState] Error starting game:', err);
            setError('Failed to start game. Using offline mode.');
            setGameState(GameState.MENU);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const submitAnswer = useCallback(async (selectedAnswer: number, timeSpent: number) => {
        // Prevent double submission
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        const newAnswer: Answer = {
            questionId: currentQuestion.id,
            selectedAnswer,
            isCorrect,
            timeSpent,
        };

        setAnswers((prev) => [...prev, newAnswer]);

        // Execute battle turn
        if (battleState) {
            const character = getActiveCharacter();
            const { newState, action } = executeBattleTurn(battleState, character, isCorrect, timeSpent);
            setBattleState(newState);
            setLastBattleAction(action);
            
            // Check if battle is over
            const battleResult = isBattleOver(newState);
            
            if (battleResult.over) {
                // Battle ended, move to results
                setGameState(GameState.RESULTS);
                setIsSubmitting(false);
                return;
            }
        }

        // Move to next question or generate more if needed
        const nextIndex = currentQuestionIndex + 1;
        
        if (nextIndex < questions.length) {
            // We have more questions in the queue
            setCurrentQuestionIndex(nextIndex);
            setIsSubmitting(false);
        } else {
            // Need to generate more questions based on current progression
            try {
                const progression = getProgression();
                const currentDifficulty = getDifficultyForLevel(progression.currentLevel);
                const moreQuestions = await generateMathQuestions(currentDifficulty, 5);
                setQuestions((prev) => [...prev, ...moreQuestions]);
                setCurrentQuestionIndex(nextIndex);
                setIsSubmitting(false);
            } catch (err) {
                setError('Failed to generate more questions');
                console.error('Error generating more questions:', err);
                // If generation fails, end the game
                setGameState(GameState.RESULTS);
                setIsSubmitting(false);
            }
        }
    }, [currentQuestionIndex, questions, battleState, isSubmitting]);

    const resetGame = useCallback(() => {
        setGameState(GameState.MENU);
        setQuestions([]);
        setAnswers([]);
        setCurrentQuestionIndex(0);
        setError(null);
        setBattleState(null);
        setLastBattleAction(null);
        setIsSubmitting(false);
    }, []);

    const getResults = useCallback((): GameResults => {
        const correctAnswers = answers.filter((a) => a.isCorrect).length;
        const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
        // Calculate score based on questions answered, not total questions
        const questionsAnswered = answers.length;
        const score = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

        return {
            totalQuestions: questionsAnswered, // Use actual answered count
            correctAnswers,
            totalTime,
            score,
            answers,
        };
    }, [answers]);

    return {
        gameState,
        config,
        questions,
        currentQuestionIndex,
        currentQuestion: questions[currentQuestionIndex],
        answers,
        isLoading,
        error,
        battleState,
        lastBattleAction,
        startGame,
        submitAnswer,
        resetGame,
        getResults,
    };
};
