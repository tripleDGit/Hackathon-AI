import axios from 'axios';
import { Difficulty, MathQuestion, ApiQuestion } from '@/types/game.types';

const API_KEY = import.meta.env.VITE_API_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.openai.com/v1';

const RECENT_QUESTION_CACHE_LIMIT = 200;
const recentQuestionCache = new Set<string>();
const recentQuestionQueue: string[] = [];

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

const normalizeQuestion = (question: string): string => {
    return question.toLowerCase().replace(/\s+/g, ' ').trim();
};

const addToQuestionCache = (question: string) => {
    const key = normalizeQuestion(question);
    if (recentQuestionCache.has(key)) return false;

    recentQuestionCache.add(key);
    recentQuestionQueue.push(key);

    while (recentQuestionQueue.length > RECENT_QUESTION_CACHE_LIMIT) {
        const oldest = recentQuestionQueue.shift();
        if (oldest) {
            recentQuestionCache.delete(oldest);
        }
    }

    return true;
};

const filterUniqueQuestions = (questions: MathQuestion[]): MathQuestion[] => {
    return questions.filter((q) => addToQuestionCache(q.question));
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
                        content: 'You are a quiz teacher creating mixed math and computer science questions. Always respond with valid JSON only, no additional text.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 1.0,
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

        const mappedQuestions = questions.map((q, index) => ({
            id: `q-${Date.now()}-${index}`,
            question: q.question,
            correctAnswer: q.answer,
            options: q.options || generateOptions(q.answer, difficulty),
            difficulty,
            explanation: q.explanation || 'No explanation provided.',
        }));

        const uniqueQuestions = ensureQuestionCount(mappedQuestions, difficulty, count);
        return uniqueQuestions;
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
        const localQuestions = generateLocalQuestions(difficulty, count);
        return ensureQuestionCount(localQuestions, difficulty, count);
    }
};

const buildPrompt = (difficulty: Difficulty, count: number): string => {
    const difficultyDescriptions = {
        [Difficulty.EASY]: 'TUHH CS early modules: Procedural Programming, Discrete Algebraic Structures basics, Mathematics I (Calculus I) - ALL PURELY MENTAL, no pen/paper needed',
        [Difficulty.MEDIUM]: 'TUHH CS core modules: Programming Paradigms, Algorithms & Data Structures, Databases, Networks; Mathematics II & Stochastics - ALL PURELY MENTAL, no pen/paper needed',
        [Difficulty.HARD]: 'TUHH advanced modules: Automata Theory & Formal Languages, Computability & Complexity, Graph Theory & Optimization, Computer Engineering; Mathematics III - CAN require pen/paper for multi-step computations (BOSS LEVEL)',
    };

    const topicGuidelines = {
        [Difficulty.EASY]: `STRICT 50/50 SPLIT - Alternate between CS and Math:
        
        CS (50% of questions - TUHH Procedural Programming + Discrete Algebraic Structures basics):
        - "Which loop runs at least once?" → Options: for, while, do-while, foreach
        - "Array index starts at?" → Options: 0, 1, -1, 2
        - "Function that returns no value is?" → Options: void, int, float, bool
        - "Set with $n$ elements has how many subsets?" → Options: $n$, $2n$, $2^n$, $n^2$
        - "Relation that is reflexive, symmetric, transitive is?" → Options: Equivalence, Partial order, Function, Graph
        
        Math I (50% of questions):
        - "What is $\\frac{d}{dx}(x^3)$?" → Options: $x^2$, $3x^2$, $3x$, $x^3$
        - "What is $\\int 2x \\, dx$?" → Options: $x^2 + C$, $2x + C$, $x + C$, $2 + C$
        - "What is $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$?" → Options: $0$, $1$, $\\infty$, undefined`,
        
        [Difficulty.MEDIUM]: `STRICT 50/50 SPLIT - Alternate between CS and Math:
        
        CS (50% - TUHH Programming Paradigms, Algorithms & Data Structures, Databases, Networks):
        - "Big-O of binary search?" → Options: $O(1)$, $O(\\log n)$, $O(n)$, $O(n^2)$
        - "Merge sort average complexity?" → Options: $O(n)$, $O(n \\log n)$, $O(n^2)$, $O(\\log n)$
        - "SQL selects rows with condition using?" → Options: WHERE, GROUP BY, HAVING, ORDER
        - "TCP provides which property?" → Options: Reliability, Broadcast, Encryption, Compression
        - "Hash table average lookup?" → Options: $O(1)$, $O(\\log n)$, $O(n)$, $O(n^2)$
        
        Math II & Stochastics (50%):
        - "$\\sum_{n=1}^{\\infty} \\frac{1}{n}$ converges or diverges?" → Options: Converges, Diverges, Alternates, Undefined
        - "What is $\\int x e^x \\, dx$?" → Options: $x e^x - e^x + C$, $e^x + C$, $x e^x + C$, $\\frac{e^x}{x} + C$
        - "What is $P(A \\cup B)$?" → Options: $P(A) + P(B) - P(A \\cap B)$, $P(A)P(B)$, $P(A) + P(B)$, $P(A \\cap B)$
        - "What is $E[X]$ for discrete random variable?" → Options: $\\sum x \\cdot P(X=x)$, $\\sum P(X=x)$, $\\sum x^2$, $\\sum \\frac{x}{P(X=x)}$
        - "What is $\\int \\frac{1}{1+x^2} \\, dx$?" → Options: $\\arctan(x) + C$, $\\ln(1+x^2) + C$, $\\frac{1}{1+x} + C$, $\\frac{x}{1+x^2} + C$`,
        
        [Difficulty.HARD]: `STRICT 50/50 SPLIT - Alternate between CS and Math (BOSS LEVEL):
        
        CS (50% - TUHH Automata, Computability, Graph Theory, Computer Engineering):
        - "Language recognized by DFA is?" → Options: Regular, Context-free, Decidable, NP-complete
        - "Floyd-Warshall time complexity?" → Options: $O(V^2)$, $O(V^3)$, $O(E \\log V)$, $O(V \\log V)$
        - "SAT is in which class?" → Options: NP-complete, P, PSPACE-complete, Undecidable
        - "Halting problem is?" → Options: Undecidable, In P, NP-complete, Regular
        - "CPU cache closest to?" → Options: CPU, Disk, Network, GPU
        
        Math III & Optimization (50% - can use pen/paper):
        - "Determinant of $\\begin{bmatrix} 1 & 2 & 0 \\\\ 0 & 1 & 3 \\\\ 2 & 0 & 1 \\end{bmatrix}$?" → Calculate and choose
        - "What is $\\frac{\\partial}{\\partial x}(x^2y)$?" → Options: $2xy$, $x^2y$, $2x$, $xy$
        - "Eigenvalues of $\\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$?" → Options: $1$ and $3$, $2$ and $2$, $0$ and $4$, $1$ and $4$
        - "Min edges for connected graph with $n$ nodes?" → Options: $n-1$, $n$, $n+1$, $2n$`,
    };

    // Add timestamp and random seed to make questions more unique
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 10000);

    const mentalNote = difficulty === Difficulty.HARD 
        ? 'These are BOSS LEVEL questions - computation can require pen/paper (2-3 steps). Make them challenging but solvable.'
        : 'IMPORTANT: Keep ALL questions purely mental - answerable in head without writing. No multi-step calculations.';

    return `Generate exactly ${count} UNIQUE and DIVERSE questions for ${difficulty} difficulty.

CRITICAL: STRICT 50/50 SPLIT - HALF CS, HALF MATH. Alternate: CS question, Math question, CS question, Math question...

${mentalNote}

LATEX FORMATTING REQUIREMENT:
- Use LaTeX for ALL mathematical expressions and formulas
- Inline math: wrap in single dollar signs $...$
- Display math: wrap in double dollar signs $$...$$
- Examples: 
  * "What is $\\frac{d}{dx}(x^3)$?"
  * "Calculate $$\\int_0^1 x^2 dx$$"
  * "Find $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$"
  * "Solve $2x + 3 = 7$"
- Use LaTeX for matrices, fractions, limits, integrals, derivatives, sums, etc.

IMPORTANT: Each question must be COMPLETELY DIFFERENT. Cover different CS and math topics. DO NOT repeat similar patterns. Vary widely.
  
Difficulty focus: ${difficultyDescriptions[difficulty]}
Topic Guidelines with Examples: ${topicGuidelines[difficulty]}

CS TOPICS (MUST BE 50% OF QUESTIONS) - TUHH MODULES:
- Procedural Programming: loops, functions, control flow, basic algorithm tracing
- Programming Paradigms: procedural vs OOP vs functional, immutability, recursion
- Algorithms & Data Structures: complexity, sorting, trees, hashing, graph traversal
- Automata Theory & Formal Languages: DFA/NFA, regex equivalence, CFG basics
- Computability & Complexity: decidability, reductions, P vs NP, NP-complete
- Graph Theory & Optimization: shortest path, MST, connectivity, edge counts
- Computer Networks & Internet Security: TCP/UDP, DNS/HTTP, TLS, CIA triad
- Databases: keys, joins, SQL, normalization
- Computer Engineering: logic gates, binary arithmetic, cache/memory hierarchy

MATH TOPICS (MUST BE 50% OF QUESTIONS) - TUHH MODULES:
- Mathematics I: limits, derivatives, basic integrals
- Mathematics II: series/convergence, integration techniques
- Mathematics III: partial derivatives, double integrals, linear algebra
- Discrete Algebraic Structures: sets, relations, groups, combinatorics
- Stochastics: probability rules, expectation, variance, distributions

ENFORCE ALTERNATION:
Question 1: CS topic
Question 2: Math topic  
Question 3: CS topic
Question 4: Math topic
(continue pattern...)

Request ID: ${timestamp}-${randomSeed}

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "What data structure does BFS use?",
    "answer": "Queue",
    "options": ["Stack", "Queue", "Heap", "Array"],
    "explanation": "BFS (Breadth-First Search) uses a queue to process nodes level by level."
  },
  {
    "question": "What is $\\frac{d}{dx}(x^3)$?",
    "answer": "$3x^2$",
    "options": ["$x^2$", "$3x^2$", "$3x$", "$x^3$"],
    "explanation": "Using power rule: $\\frac{d}{dx}(x^n) = nx^{n-1}$, so $\\frac{d}{dx}(x^3) = 3x^2$."
  }
]
  
Include 4 options for each question, with the correct answer among them. Mix up the position of correct answers.
For EACH question, provide a brief explanation (1-2 sentences).
Use LaTeX formatting for all math expressions.
NO OTHER TEXT.`;
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

function ensureQuestionCount(
    seedQuestions: MathQuestion[],
    difficulty: Difficulty,
    count: number
): MathQuestion[] {
    let uniqueQuestions = filterUniqueQuestions(seedQuestions);

    let attempts = 0;
    while (uniqueQuestions.length < count && attempts < 3) {
        const remaining = count - uniqueQuestions.length;
        const moreQuestions = generateLocalQuestions(difficulty, remaining);
        uniqueQuestions = uniqueQuestions.concat(filterUniqueQuestions(moreQuestions));
        attempts += 1;
    }

    if (uniqueQuestions.length < count) {
        log.warn('Could not reach requested unique question count', {
            requested: count,
            generated: uniqueQuestions.length,
        });
    }

    return uniqueQuestions.slice(0, count);
}

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
