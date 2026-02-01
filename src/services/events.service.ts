interface DailyHardQuestion {
  id: string;
  question: string;
  answer: string;
  options: string[];
  explanation: string;
  date: string;
  completed: boolean;
  claimed: boolean;
}

const STORAGE_KEY = 'daily_hard_question';

// Generate a daily hard question (resets at midnight)
export const getDailyHardQuestion = (): DailyHardQuestion => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.date === today) {
      return parsed;
    }
  }

  // Generate new question for today
  const seed = hashString(today);
  const question = generateQuestionFromSeed(seed);
  
  const newQuestion: DailyHardQuestion = {
    id: `daily_hard_${today}`,
    date: today,
    completed: false,
    claimed: false,
    ...question,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newQuestion));
  return newQuestion;
};

// Mark question as completed
export const completeDailyQuestion = (answer: string): boolean => {
  const question = getDailyHardQuestion();
  
  if (question.completed) {
    return false; // Already completed
  }

  const isCorrect = answer.toLowerCase().trim() === question.answer.toLowerCase().trim();
  
  if (isCorrect) {
    question.completed = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(question));
  }
  
  return isCorrect;
};

// Claim rewards
export const claimDailyQuestionReward = (): boolean => {
  const question = getDailyHardQuestion();
  
  if (!question.completed || question.claimed) {
    return false;
  }

  question.claimed = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(question));

  // Award rewards
  const gachaCurrencyStr = localStorage.getItem('gachaCurrency');
  if (gachaCurrencyStr) {
    const currency = JSON.parse(gachaCurrencyStr);
    currency.primogems += 100; // Premium reward for hard question
    currency.freeGems += 500;
    localStorage.setItem('gachaCurrency', JSON.stringify(currency));
  }

  return true;
};

// Hash function for deterministic randomness
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate question based on seed
function generateQuestionFromSeed(seed: number): { question: string; answer: string; options: string[]; explanation: string } {
  const questions = [
    // Linear Algebra
    {
      question: "Calculate the determinant of the matrix [[2,3,1],[1,4,2],[3,1,5]]",
      answer: "26",
      options: ["26", "-26", "18", "32"],
      explanation: "Use cofactor expansion: det = 2(20-2) - 3(5-6) + 1(1-12) = 36 + 3 - 11 = 26"
    },
    {
      question: "Find the eigenvalues of [[4,1],[2,3]]",
      answer: "5 and 2",
      options: ["5 and 2", "4 and 3", "6 and 1", "3 and 4"],
      explanation: "Characteristic equation: (4-λ)(3-λ) - 2 = 0 → λ² - 7λ + 10 = 0 → (λ-5)(λ-2) = 0"
    },
    {
      question: "What is the rank of [[1,2,3],[2,4,6],[1,1,1]]?",
      answer: "2",
      options: ["1", "2", "3", "0"],
      explanation: "Row 2 is 2×Row 1, so rank is 2 (two independent rows)"
    },
    // Calculus 3
    {
      question: "Evaluate ∫∫(x+y)dA over R=[0,2]×[0,3]",
      answer: "15",
      options: ["12", "15", "18", "21"],
      explanation: "∫₀²∫₀³(x+y)dydx = ∫₀²[xy + y²/2]₀³dx = ∫₀²(3x + 9/2)dx = [3x²/2 + 9x/2]₀² = 6 + 9 = 15"
    },
    {
      question: "Find ∂²f/∂x∂y for f(x,y) = x³y² + 2xy",
      answer: "6x²y + 2",
      options: ["6xy²", "6x²y + 2", "3x²y", "x³y"],
      explanation: "∂f/∂x = 3x²y² + 2y, then ∂²f/∂x∂y = 6x²y + 2"
    },
    {
      question: "Calculate the gradient magnitude of f(x,y) = x² + y² at point (3,4)",
      answer: "10",
      options: ["7", "10", "5", "25"],
      explanation: "∇f = (2x, 2y) = (6, 8) at (3,4). |∇f| = √(36+64) = √100 = 10"
    },
    // Differential Equations
    {
      question: "Solve dy/dx = 3y with initial condition y(0) = 2",
      answer: "y = 2e^(3x)",
      options: ["y = 2e^(3x)", "y = 3e^(2x)", "y = e^(3x) + 2", "y = 6e^x"],
      explanation: "Separable equation: dy/y = 3dx → ln|y| = 3x + C. With y(0)=2: C=ln(2), so y=2e^(3x)"
    },
    {
      question: "What is the general solution to d²y/dx² + 4y = 0?",
      answer: "y = c₁cos(2x) + c₂sin(2x)",
      options: ["y = c₁e^(2x) + c₂e^(-2x)", "y = c₁cos(2x) + c₂sin(2x)", "y = c₁x + c₂", "y = c₁e^(4x)"],
      explanation: "Characteristic equation: r² + 4 = 0 → r = ±2i. Complex roots give sinusoidal solution."
    },
    // Advanced CS
    {
      question: "How many edges in a complete graph K₇?",
      answer: "21",
      options: ["14", "21", "28", "42"],
      explanation: "Complete graph with n vertices has n(n-1)/2 edges. For n=7: 7×6/2 = 21"
    },
    {
      question: "What is the time complexity of Floyd-Warshall algorithm?",
      answer: "O(V³)",
      options: ["O(V²)", "O(V³)", "O(V²logV)", "O(VE)"],
      explanation: "Floyd-Warshall uses three nested loops over all vertices, giving O(V³) time complexity"
    },
    {
      question: "Minimum spanning tree for 10 nodes has how many edges?",
      answer: "9",
      options: ["8", "9", "10", "45"],
      explanation: "Any spanning tree of n nodes has exactly n-1 edges. For 10 nodes: 9 edges"
    },
    {
      question: "What is 0x2A in decimal?",
      answer: "42",
      options: ["26", "32", "42", "52"],
      explanation: "0x2A = 2×16¹ + 10×16⁰ = 32 + 10 = 42 (A in hex = 10 in decimal)"
    },
  ];

  const index = seed % questions.length;
  return questions[index];
}

// Check if new day has started
export const isNewDay = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (!stored) return true;
  
  const parsed = JSON.parse(stored);
  return parsed.date !== today;
};
