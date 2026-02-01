export enum Difficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

export enum GameState {
    MENU = 'menu',
    PLAYING = 'playing',
    RESULTS = 'results',
}

export interface MathQuestion {
    id: string;
    question: string;
    correctAnswer: number;
    options: number[];
    difficulty: Difficulty;
    explanation?: string;
}

export interface GameConfig {
    difficulty: Difficulty;
    numberOfQuestions: number;
    timeLimit?: number; // in seconds, optional
}

export interface Answer {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
    question?: string;
    correctAnswer?: number;
    explanation?: string;
}

export interface GameResults {
    totalQuestions: number;
    correctAnswers: number;
    totalTime: number;
    score: number;
    answers: Answer[];
}

export interface ApiQuestion {
    question: string;
    answer: number;
    options?: number[];
    explanation?: string;
}
