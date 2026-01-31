import axios from 'axios';
import { Difficulty, MathQuestion, ApiQuestion } from '@/types/game.types';

const API_KEY = import.meta.env.VITE_API_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.openai.com/v1';

// Terminal logger - sends logs to Vite dev server (non-blocking)
const logToTerminal = (level: string, message: string, data?: unknown) => {
    // Fire and forget - don't await to avoid blocking execution
    fetch('/__api_log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            level,
            message,
            data,
            timestamp: new Date().toISOString(),
        }),
    }).catch(() => {
        // Silently fail if logging endpoint not available
    });
};

const log = {
    info: (message: string, data?: unknown) => {
        logToTerminal('INFO', message, data);
    },
    error: (message: string, error?: unknown) => {
        logToTerminal('ERROR', message, error);
    },
    success: (message: string, data?: unknown) => {
        logToTerminal('SUCCESS', message, data);
    },
    warn: (message: string, data?: unknown) => {
        logToTerminal('WARN', message, data);
    },
};

// Generate math questions using OpenAI API
export const generateMathQuestions = async (
    difficulty: Difficulty,
    count: number
): Promise<MathQuestion[]> => {
    const startTime = Date.now();
    
    log.info(`Starting question generation`, {
        difficulty,
        count,
        apiKey: API_KEY ? 'Present' : 'Missing',
        endpoint: API_BASE_URL,
    });

    try {
        const prompt = buildPrompt(difficulty, count);
        
        log.info('Sending API request', {
            model: 'gpt-3.5-turbo',
            promptLength: prompt.length,
        });

        const response = await axios.post(
            `${API_BASE_URL}/chat/completions`,
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a math teacher creating quiz questions. Always respond with valid JSON only, no additional text.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
                timeout: 10000, // 10 second timeout
            }
        );

        const requestTime = Date.now() - startTime;
        
        log.success('API request completed', {
            status: response.status,
            requestTime: `${requestTime}ms`,
            tokensUsed: response.data.usage,
        });

        const content = response.data.choices[0].message.content;
        log.info('Parsing API response', {
            contentLength: content.length,
        });
        
        const questions: ApiQuestion[] = JSON.parse(content);
        
        log.success(`Successfully generated ${questions.length} questions`, {
            difficulty,
            totalTime: `${Date.now() - startTime}ms`,
        });

        return questions.map((q, index) => ({
            id: `q-${Date.now()}-${index}`,
            question: q.question,
            correctAnswer: q.answer,
            options: q.options || generateOptions(q.answer, difficulty),
            difficulty,
        }));
    } catch (error) {
        const requestTime = Date.now() - startTime;
        
        if (axios.isAxiosError(error)) {
            log.error('API request failed', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                message: error.message,
                requestTime: `${requestTime}ms`,
                data: error.response?.data,
            });
        } else {
            log.error('Unexpected error during question generation', {
                error: error instanceof Error ? error.message : String(error),
                requestTime: `${requestTime}ms`,
            });
        }
        
        log.warn('Falling back to local question generation', {
            difficulty,
            count,
        });
        
        // Fallback to local generation if API fails
        return generateLocalQuestions(difficulty, count);
    }
};

const buildPrompt = (difficulty: Difficulty, count: number): string => {
    const difficultyDescriptions = {
        [Difficulty.EASY]: 'simple addition and subtraction (single digit numbers)',
        [Difficulty.MEDIUM]: 'multiplication, division, and multi-digit arithmetic',
        [Difficulty.HARD]: 'complex problems with fractions, decimals, and multi-step operations',
    };

    return `Generate ${count} math questions for ${difficulty} difficulty. 
  Difficulty description: ${difficultyDescriptions[difficulty]}
  
  Return a JSON array with this exact structure:
  [
    {
      "question": "What is 5 + 3?",
      "answer": 8,
      "options": [6, 7, 8, 9]
    }
  ]
  
  Include 4 options for each question, with the correct answer among them. Mix up the position of correct answers.`;
};

// Generate answer options around the correct answer
const generateOptions = (correctAnswer: number, difficulty: Difficulty): number[] => {
    const options = new Set<number>([correctAnswer]);
    const range = difficulty === Difficulty.EASY ? 5 : difficulty === Difficulty.MEDIUM ? 10 : 20;

    while (options.size < 4) {
        const offset = Math.floor(Math.random() * range * 2) - range;
        const option = correctAnswer + offset;
        if (option >= 0 || difficulty === Difficulty.HARD) {
            options.add(option);
        }
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
};

// Fallback local question generation
export const generateLocalQuestions = (
    difficulty: Difficulty,
    count: number
): MathQuestion[] => {
    log.info('Generating questions locally (offline mode)', {
        difficulty,
        count,
    });
    
    const startTime = Date.now();
    const questions: MathQuestion[] = [];

    for (let i = 0; i < count; i++) {
        const question = generateLocalQuestion(difficulty, i);
        questions.push(question);
    }

    log.success(`Local generation complete`, {
        questionsGenerated: questions.length,
        generationTime: `${Date.now() - startTime}ms`,
    });

    return questions;
};

const generateLocalQuestion = (difficulty: Difficulty, index: number): MathQuestion => {
    let a: number, b: number, operation: string, correctAnswer: number, question: string;

    switch (difficulty) {
        case Difficulty.EASY:
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            operation = Math.random() > 0.5 ? '+' : '-';
            correctAnswer = operation === '+' ? a + b : a - b;
            question = `What is ${a} ${operation} ${b}?`;
            break;

        case Difficulty.MEDIUM:
            a = Math.floor(Math.random() * 12) + 1;
            b = Math.floor(Math.random() * 12) + 1;
            operation = Math.random() > 0.5 ? '×' : '÷';
            if (operation === '×') {
                correctAnswer = a * b;
                question = `What is ${a} × ${b}?`;
            } else {
                correctAnswer = a;
                const dividend = a * b;
                question = `What is ${dividend} ÷ ${b}?`;
            }
            break;

        case Difficulty.HARD: {
            a = Math.floor(Math.random() * 20) + 10;
            b = Math.floor(Math.random() * 15) + 5;
            const c = Math.floor(Math.random() * 10) + 1;
            correctAnswer = a * b - c;
            question = `What is ${a} × ${b} - ${c}?`;
            break;
        }

        default:
            a = 1;
            b = 1;
            correctAnswer = 2;
            question = 'What is 1 + 1?';
    }

    return {
        id: `local-q-${Date.now()}-${index}`,
        question,
        correctAnswer,
        options: generateOptions(correctAnswer, difficulty),
        difficulty,
    };
};
