import { useState } from 'react';

interface LearningTabProps {
  onClose: () => void;
}

interface StudyTopic {
  id: string;
  title: string;
  category: 'cs' | 'math';
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  description: string;
  content: {
    concept: string;
    examples: string[];
    tips: string[];
  };
}

const studyTopics: StudyTopic[] = [
  // Mathematics I (Calculus I)
  {
    id: 'math1-limits-continuity',
    title: 'Math I: Limits & Continuity',
    category: 'math',
    difficulty: 'easy',
    icon: '📐',
    description: 'Understand limits and continuity for single-variable functions',
    content: {
      concept: 'Limits describe function behavior near a point. Continuity requires the limit to equal the function value. Master standard limits and algebraic simplification.',
      examples: [
        'lim(x→0) sin(x)/x = 1',
        'lim(x→2) (x^2-4)/(x-2) = 4',
        'A function is continuous at a if lim(x→a) f(x) = f(a)',
        'Discontinuity: jump, infinite, or removable'
      ],
      tips: [
        'Simplify algebraically before substituting',
        'Know standard trig limits',
        'Check left and right limits for continuity',
        'Use L’Hôpital’s rule only for indeterminate forms'
      ]
    }
  },
  {
    id: 'math1-derivatives',
    title: 'Math I: Derivatives',
    category: 'math',
    difficulty: 'easy',
    icon: '📉',
    description: 'Differentiate polynomials, trig, and logs',
    content: {
      concept: 'Derivatives measure instantaneous rate of change. Use power, product, quotient, and chain rules to differentiate common functions.',
      examples: [
        'd/dx[x^3] = 3x^2',
        'd/dx[sin x] = cos x',
        'd/dx[ln x] = 1/x',
        'd/dx[(x^2+1)^3] = 6x(x^2+1)^2'
      ],
      tips: [
        'Power rule: n·x^(n-1)',
        'Chain rule for nested functions',
        'Memorize trig derivatives',
        'Differentiate term-by-term'
      ]
    }
  },
  {
    id: 'math1-integrals',
    title: 'Math I: Basic Integrals',
    category: 'math',
    difficulty: 'easy',
    icon: '∫',
    description: 'Antiderivatives and fundamental theorem of calculus',
    content: {
      concept: 'Integration is the inverse of differentiation. Use basic rules and the fundamental theorem to evaluate definite integrals.',
      examples: [
        '∫x^2 dx = x^3/3 + C',
        '∫2x dx = x^2 + C',
        '∫_0^1 (3x) dx = 3/2',
        '∫cos x dx = sin x + C'
      ],
      tips: [
        'Increase exponent by 1 and divide',
        'Always add +C for indefinite integrals',
        'Use F(b)-F(a) for definite integrals',
        'Check by differentiating'
      ]
    }
  },
  // Mathematics II (Calculus II)
  {
    id: 'math2-series',
    title: 'Math II: Series & Convergence',
    category: 'math',
    difficulty: 'medium',
    icon: '📊',
    description: 'Convergence tests and infinite series',
    content: {
      concept: 'Determine if an infinite series converges using tests like p-series, ratio, root, or comparison.',
      examples: [
        'Σ(1/n^2) converges (p=2)',
        'Σ(1/n) diverges (harmonic)',
        'Ratio test: lim |a_{n+1}/a_n| < 1 → converges',
        'Geometric series: Σ ar^n converges if |r|<1'
      ],
      tips: [
        'Start with the simplest applicable test',
        'Know p-series rule (p>1 converges)',
        'Use comparison with known series',
        'Geometric series is a quick win'
      ]
    }
  },
  {
    id: 'math2-integration-techniques',
    title: 'Math II: Integration Techniques',
    category: 'math',
    difficulty: 'medium',
    icon: '🧪',
    description: 'Substitution, parts, and partial fractions',
    content: {
      concept: 'Use substitution for composite functions, integration by parts for products, and partial fractions for rational functions.',
      examples: [
        '∫x e^x dx = x e^x - e^x + C',
        '∫(2x)/(x^2+1) dx = ln(x^2+1) + C',
        '∫1/(x^2-1) dx via partial fractions',
        '∫sin(2x) dx = -1/2 cos(2x) + C'
      ],
      tips: [
        'Use LIATE to pick u for parts',
        'Substitution when inner derivative appears',
        'Factor denominators for partial fractions',
        'Simplify before integrating'
      ]
    }
  },
  // Mathematics III (Multivariable & Linear Algebra)
  {
    id: 'math3-partials',
    title: 'Math III: Partial Derivatives',
    category: 'math',
    difficulty: 'hard',
    icon: '∂',
    description: 'Differentiate multivariable functions',
    content: {
      concept: 'Partial derivatives treat other variables as constants. Use standard differentiation rules on each variable separately.',
      examples: [
        'f(x,y)=x^2y → ∂f/∂x=2xy, ∂f/∂y=x^2',
        'f(x,y)=x^3y^2+2xy → ∂^2f/∂x∂y=6x^2y+2',
        'Gradient: ∇f = (∂f/∂x, ∂f/∂y)',
        'Chain rule extends to multivariable functions'
      ],
      tips: [
        'Hold other variables constant',
        'Mixed partials often equal if smooth',
        'Gradient points toward steepest increase',
        'Track variables carefully'
      ]
    }
  },
  {
    id: 'math3-multiple-integrals',
    title: 'Math III: Multiple Integrals',
    category: 'math',
    difficulty: 'hard',
    icon: '∬',
    description: 'Evaluate double integrals over regions',
    content: {
      concept: 'Double integrals accumulate values over 2D regions. Compute inner integral first, then outer. Bounds may be constant or variable.',
      examples: [
        '∬(x+y) dA over [0,2]×[0,3] = 15',
        '∬1 dA gives area of region',
        'Switching order can simplify bounds',
        'Use polar coordinates for circular regions'
      ],
      tips: [
        'Sketch the region to set correct bounds',
        'Treat outer variable as constant in inner integral',
        'Consider changing order if messy',
        'Check units and limits'
      ]
    }
  },
  {
    id: 'math3-linear-algebra',
    title: 'Math III: Linear Algebra Basics',
    category: 'math',
    difficulty: 'hard',
    icon: '🧮',
    description: 'Matrices, determinants, eigenvalues',
    content: {
      concept: 'Work with matrices, compute determinants, and find eigenvalues using det(A-λI)=0. Determinant indicates invertibility.',
      examples: [
        'det([[a,b],[c,d]]) = ad-bc',
        'Eigenvalues of [[4,1],[2,3]] are 5 and 2',
        'det=0 → matrix not invertible',
        'Trace = sum of eigenvalues'
      ],
      tips: [
        'Use row operations to simplify det',
        'For 2×2, eigenvalues solve quadratic',
        'Check with trace and determinant',
        'Know identity and diagonal matrices'
      ]
    }
  },
  // Discrete Algebraic Structures
  {
    id: 'discrete-sets-relations',
    title: 'Discrete Algebra: Sets & Relations',
    category: 'math',
    difficulty: 'medium',
    icon: '🧩',
    description: 'Set operations and relation properties',
    content: {
      concept: 'Sets and relations form the foundation of discrete math. Relations can be reflexive, symmetric, and transitive.',
      examples: [
        'Number of subsets of n elements: 2^n',
        'Equivalence relation: reflexive, symmetric, transitive',
        'Partial order: reflexive, antisymmetric, transitive',
        'Power set of {1,2} has 4 subsets'
      ],
      tips: [
        'Memorize relation properties',
        'Use Venn diagrams for set operations',
        'Distinguish equivalence vs partial order',
        'Practice with small sets'
      ]
    }
  },
  {
    id: 'discrete-algebra-structures',
    title: 'Discrete Algebra: Groups & Rings',
    category: 'math',
    difficulty: 'medium',
    icon: '🔷',
    description: 'Algebraic structures and axioms',
    content: {
      concept: 'Groups satisfy closure, associativity, identity, and inverse. Rings add a second operation with distributivity.',
      examples: [
        'Integers under addition form a group',
        'Non-zero rationals under multiplication form a group',
        'Integers under addition and multiplication form a ring',
        'Fields are rings with multiplicative inverses'
      ],
      tips: [
        'Check axioms one by one',
        'Identity and inverses are key',
        'Fields are stronger than rings',
        'Use examples like Z, Q, R'
      ]
    }
  },
  // Stochastics
  {
    id: 'stoch-probability',
    title: 'Stochastics: Probability Rules',
    category: 'math',
    difficulty: 'medium',
    icon: '🎲',
    description: 'Basic probability and conditional probability',
    content: {
      concept: 'Use add/multiply rules for probability. Conditional probability measures likelihood given an event.',
      examples: [
        'P(A∪B)=P(A)+P(B)-P(A∩B)',
        'P(A|B)=P(A∩B)/P(B)',
        'Independent: P(A∩B)=P(A)P(B)',
        'Bayes: P(A|B)=P(B|A)P(A)/P(B)'
      ],
      tips: [
        'Draw probability trees',
        'Check if events are independent',
        'Use complement rule: P(A^c)=1-P(A)',
        'Keep probabilities between 0 and 1'
      ]
    }
  },
  {
    id: 'stoch-random-variables',
    title: 'Stochastics: Random Variables',
    category: 'math',
    difficulty: 'medium',
    icon: '🎯',
    description: 'Expectation, variance, and distributions',
    content: {
      concept: 'Expectation is the average value; variance measures spread. Know binomial and normal distributions.',
      examples: [
        'E[X] = Σ x·P(X=x)',
        'Var(X)=E[X^2]-(E[X])^2',
        'Binomial: P(X=k)=C(n,k)p^k(1-p)^(n-k)',
        'Normal distribution is symmetric around mean'
      ],
      tips: [
        'Compute E[X] before variance',
        'Recognize binomial trials',
        'Mean/variance for binomial: np and np(1-p)',
        'Check distribution assumptions'
      ]
    }
  },
  // Graph Theory & Optimization
  {
    id: 'graph-basics',
    title: 'Graph Theory: Basics',
    category: 'math',
    difficulty: 'hard',
    icon: '🕸️',
    description: 'Vertices, edges, paths, and connectivity',
    content: {
      concept: 'Graphs model relationships. Know degrees, paths, cycles, connectivity, and complete graphs.',
      examples: [
        'Edges in K_n: n(n-1)/2',
        'Connected graph with n nodes has ≥ n-1 edges',
        'Tree: connected and acyclic',
        'Degree sum = 2|E|'
      ],
      tips: [
        'Complete graph formula appears often',
        'Use degree sum to check counts',
        'Tree properties: unique path between nodes',
        'Sketch small graphs to verify'
      ]
    }
  },
  {
    id: 'graph-optimization',
    title: 'Graph Theory: Optimization',
    category: 'math',
    difficulty: 'hard',
    icon: '🧭',
    description: 'Shortest paths and spanning trees',
    content: {
      concept: 'Optimization problems use algorithms like Dijkstra (shortest path) and Kruskal/Prim (MST).',
      examples: [
        'Dijkstra for non-negative weights',
        'Floyd-Warshall: all-pairs shortest paths',
        'MST connects all nodes with minimal total weight',
        'Kruskal sorts edges by weight'
      ],
      tips: [
        'Choose the right algorithm for the graph',
        'MST has exactly n-1 edges',
        'All-pairs shortest path uses dynamic programming',
        'Check edge weights for negative values'
      ]
    }
  },
  // Procedural Programming
  {
    id: 'proc-control-flow',
    title: 'Procedural: Control Flow',
    category: 'cs',
    difficulty: 'easy',
    icon: '🧱',
    description: 'Conditionals and loops',
    content: {
      concept: 'Control flow uses if/else and loops (for, while, do-while) to direct program execution.',
      examples: [
        'do-while executes at least once',
        'for loop best when iteration count is known',
        'while loop repeats while condition is true',
        'if/else selects among branches'
      ],
      tips: [
        'Avoid infinite loops by updating conditions',
        'Use break/continue carefully',
        'Trace loop iterations step-by-step',
        'Check boundary conditions'
      ]
    }
  },
  {
    id: 'proc-functions',
    title: 'Procedural: Functions & Parameters',
    category: 'cs',
    difficulty: 'easy',
    icon: '🧰',
    description: 'Functions, return values, and scope',
    content: {
      concept: 'Functions encapsulate logic. Understand parameters, return types, scope, and pass-by-value/reference.',
      examples: [
        'void function returns no value',
        'Pass-by-value copies the argument',
        'Return statement exits a function',
        'Local variables exist only inside a function'
      ],
      tips: [
        'Keep functions small and focused',
        'Name parameters clearly',
        'Know when arguments are copied vs referenced',
        'Test functions with edge cases'
      ]
    }
  },
  // Functional Programming
  {
    id: 'fp-recursion',
    title: 'Functional: Recursion',
    category: 'cs',
    difficulty: 'medium',
    icon: '🧠',
    description: 'Recursive definitions and base cases',
    content: {
      concept: 'Recursion solves problems by defining them in terms of smaller subproblems. Every recursion needs a base case.',
      examples: [
        'factorial(n)=n*factorial(n-1)',
        'Base case: factorial(0)=1',
        'Fibonacci: F(n)=F(n-1)+F(n-2)',
        'Tree traversal uses recursion'
      ],
      tips: [
        'Always define a base case',
        'Trace recursion with small n',
        'Watch for stack depth',
        'Consider iterative alternatives'
      ]
    }
  },
  {
    id: 'fp-higher-order',
    title: 'Functional: Higher-Order Functions',
    category: 'cs',
    difficulty: 'medium',
    icon: '🧩',
    description: 'Map, filter, and reduce patterns',
    content: {
      concept: 'Higher-order functions take other functions as inputs or outputs. Common patterns: map, filter, reduce.',
      examples: [
        'map(f,[1,2,3]) → [f(1),f(2),f(3)]',
        'filter(isEven,[1,2,3,4]) → [2,4]',
        'reduce(+, [1,2,3]) → 6',
        'Pure functions avoid side effects'
      ],
      tips: [
        'Compose simple functions for clarity',
        'Prefer immutability in functional style',
        'Use reduce for aggregation',
        'Test functions independently'
      ]
    }
  },
  // Programming Paradigms
  {
    id: 'paradigms-oop',
    title: 'Paradigms: Object-Oriented Programming',
    category: 'cs',
    difficulty: 'medium',
    icon: '🏗️',
    description: 'Classes, objects, and encapsulation',
    content: {
      concept: 'OOP models data as objects with state and behavior. Core concepts: encapsulation, inheritance, polymorphism, abstraction.',
      examples: [
        'Class defines fields and methods',
        'Encapsulation hides internal state',
        'Inheritance shares behavior',
        'Polymorphism enables interface-based calls'
      ],
      tips: [
        'Prefer composition over inheritance',
        'Keep classes cohesive',
        'Use interfaces to decouple',
        'Apply SOLID principles'
      ]
    }
  },
  {
    id: 'paradigms-compare',
    title: 'Paradigms: Compare & Contrast',
    category: 'cs',
    difficulty: 'medium',
    icon: '⚖️',
    description: 'Procedural vs OOP vs Functional',
    content: {
      concept: 'Procedural focuses on steps, OOP on objects, functional on expressions and immutability. Each has strengths and tradeoffs.',
      examples: [
        'Procedural: loops and sequences',
        'OOP: classes and inheritance',
        'Functional: map/filter/reduce pipelines',
        'Event-driven: callbacks and handlers'
      ],
      tips: [
        'Choose paradigm based on problem',
        'Functional reduces shared-state bugs',
        'OOP models real-world entities well',
        'Procedural is straightforward for small tasks'
      ]
    }
  },
  // Algorithms & Data Structures
  {
    id: 'ads-complexity',
    title: 'Algorithms: Complexity',
    category: 'cs',
    difficulty: 'medium',
    icon: '⚙️',
    description: 'Big-O and growth rates',
    content: {
      concept: 'Big-O measures how runtime grows with input size. Know common complexities and how to simplify expressions.',
      examples: [
        'Binary search: O(log n)',
        'Linear search: O(n)',
        'Merge sort: O(n log n)',
        'Nested loops often O(n^2)'
      ],
      tips: [
        'Drop constants and lower-order terms',
        'Recognize divide-and-conquer patterns',
        'Count dominant operations',
        'Memorize common complexities'
      ]
    }
  },
  {
    id: 'ads-data-structures',
    title: 'Data Structures: Trees & Heaps',
    category: 'cs',
    difficulty: 'medium',
    icon: '🌳',
    description: 'Binary trees, BSTs, and heaps',
    content: {
      concept: 'Trees represent hierarchical data. BSTs maintain order. Heaps support efficient min/max extraction.',
      examples: [
        'BST search/insert: O(log n) average',
        'Heap supports extract-min in O(log n)',
        'Tree traversal: inorder, preorder, postorder',
        'Complete binary tree has all levels filled except last'
      ],
      tips: [
        'Know traversal orders',
        'Heaps are not sorted trees',
        'Balanced trees avoid worst-case O(n)',
        'Use recursion for tree problems'
      ]
    }
  },
  {
    id: 'ads-hashing-sorting',
    title: 'Data Structures: Hashing & Sorting',
    category: 'cs',
    difficulty: 'medium',
    icon: '🔑',
    description: 'Hash tables and sorting algorithms',
    content: {
      concept: 'Hash tables provide near O(1) lookup with good hashing. Sorting algorithms have different time/space tradeoffs.',
      examples: [
        'Hash table average lookup: O(1)',
        'Chaining resolves collisions',
        'Quick sort average: O(n log n)',
        'Merge sort stable and O(n log n)'
      ],
      tips: [
        'Choose hash functions carefully',
        'Know stable vs unstable sorts',
        'Worst-case quick sort is O(n^2)',
        'Use built-in sort in production'
      ]
    }
  },
  // Automata Theory & Formal Languages
  {
    id: 'automata-regular',
    title: 'Automata: Regular Languages',
    category: 'cs',
    difficulty: 'hard',
    icon: '🤖',
    description: 'DFA/NFA and regular expressions',
    content: {
      concept: 'Regular languages are recognized by DFA/NFA and described by regex. NFAs can be converted to DFAs.',
      examples: [
        'Regex and DFA are equivalent in power',
        'DFA has exactly one transition per symbol',
        'NFA allows ε-transitions',
        'Closure: regular languages closed under union/intersection'
      ],
      tips: [
        'Practice NFA→DFA conversion',
        'Use regex for pattern reasoning',
        'Know closure properties',
        'Use pumping lemma for non-regular proofs'
      ]
    }
  },
  {
    id: 'automata-cfg',
    title: 'Automata: Context-Free Grammars',
    category: 'cs',
    difficulty: 'hard',
    icon: '📜',
    description: 'CFGs and pushdown automata',
    content: {
      concept: 'Context-free grammars generate context-free languages and are recognized by pushdown automata.',
      examples: [
        'CFG rule: S → aSb | ε',
        'Balanced parentheses are context-free',
        'PDA uses a stack',
        'Parse trees represent derivations'
      ],
      tips: [
        'Practice leftmost/rightmost derivations',
        'Use stack intuition for PDAs',
        'Know classic CFG examples',
        'Differentiate regular vs context-free'
      ]
    }
  },
  // Computability & Complexity
  {
    id: 'comp-decidability',
    title: 'Computability: Decidability',
    category: 'cs',
    difficulty: 'hard',
    icon: '⏳',
    description: 'Turing machines and undecidable problems',
    content: {
      concept: 'A language is decidable if a TM halts on all inputs. Some problems like Halting are undecidable.',
      examples: [
        'Halting problem is undecidable',
        'Decidable: membership in a regular language',
        'Semi-decidable: TM halts on yes instances only',
        'Reductions show undecidability'
      ],
      tips: [
        'Use reductions from known undecidable problems',
        'Decidable means always halts',
        'Distinguish decidable vs recognizable',
        'Practice classic undecidable examples'
      ]
    }
  },
  {
    id: 'comp-np',
    title: 'Complexity: P vs NP',
    category: 'cs',
    difficulty: 'hard',
    icon: '🧩',
    description: 'NP-completeness and reductions',
    content: {
      concept: 'P: solvable in polynomial time. NP: verifiable in polynomial time. NP-complete problems are hardest in NP.',
      examples: [
        'SAT is NP-complete',
        'P ⊆ NP (unknown if equal)',
        'Reduction: A ≤p B means A reduces to B in poly time',
        'Clique, Vertex Cover are NP-complete'
      ],
      tips: [
        'Reductions go from known NP-complete to new problem',
        'Verify candidate solutions efficiently for NP',
        'Know classic NP-complete problems',
        'Distinguish decision vs optimization'
      ]
    }
  },
  // Computer Networks & Internet Security
  {
    id: 'net-layers',
    title: 'Networks: Layers & Protocols',
    category: 'cs',
    difficulty: 'medium',
    icon: '🌐',
    description: 'OSI/TCP-IP layers, DNS, HTTP',
    content: {
      concept: 'Networking is layered. Know what each layer does and common protocols like DNS, HTTP, and IP.',
      examples: [
        'TCP/IP layers: Link, Internet, Transport, Application',
        'DNS resolves domain names to IP addresses',
        'HTTP is application-layer protocol',
        'IP handles routing'
      ],
      tips: [
        'Memorize layer order',
        'Know which protocols live at which layer',
        'HTTP vs HTTPS (TLS)',
        'Transport layer: TCP or UDP'
      ]
    }
  },
  {
    id: 'net-tcp-udp',
    title: 'Networks: TCP vs UDP',
    category: 'cs',
    difficulty: 'medium',
    icon: '📡',
    description: 'Reliability and connection models',
    content: {
      concept: 'TCP is reliable and connection-oriented; UDP is connectionless and faster but unreliable.',
      examples: [
        'TCP uses 3-way handshake',
        'UDP suited for streaming and games',
        'TCP ensures ordered delivery',
        'UDP has lower overhead'
      ],
      tips: [
        'Handshake = SYN, SYN-ACK, ACK',
        'TCP: reliability, congestion control',
        'UDP: no retransmissions',
        'Pick protocol based on use case'
      ]
    }
  },
  {
    id: 'net-security',
    title: 'Security: Basic Concepts',
    category: 'cs',
    difficulty: 'medium',
    icon: '🔒',
    description: 'CIA triad and encryption basics',
    content: {
      concept: 'Security focuses on confidentiality, integrity, availability. Learn symmetric vs asymmetric encryption and authentication.',
      examples: [
        'HTTPS uses TLS',
        'Symmetric: same key for encrypt/decrypt',
        'Asymmetric: public/private keys',
        'Hashing provides integrity'
      ],
      tips: [
        'CIA triad is foundational',
        'Encryption ≠ hashing',
        'Authentication verifies identity',
        'Integrity detects tampering'
      ]
    }
  },
  // Databases
  {
    id: 'db-sql',
    title: 'Databases: SQL Basics',
    category: 'cs',
    difficulty: 'medium',
    icon: '🗄️',
    description: 'SELECT, WHERE, JOIN',
    content: {
      concept: 'SQL retrieves and manipulates relational data. Know SELECT, WHERE, JOIN, GROUP BY.',
      examples: [
        'SELECT * FROM students WHERE grade > 2.0;',
        'JOIN combines rows from multiple tables',
        'GROUP BY aggregates by a column',
        'HAVING filters groups'
      ],
      tips: [
        'Always check join conditions',
        'WHERE filters rows, HAVING filters groups',
        'Use aliases for readability',
        'Index columns used in filters'
      ]
    }
  },
  {
    id: 'db-normalization',
    title: 'Databases: Normalization',
    category: 'cs',
    difficulty: 'medium',
    icon: '📚',
    description: '1NF, 2NF, 3NF and keys',
    content: {
      concept: 'Normalization reduces redundancy. 1NF: atomic values; 2NF: no partial dependency; 3NF: no transitive dependency.',
      examples: [
        'Primary key uniquely identifies a row',
        'Foreign key references another table',
        '2NF removes partial dependencies',
        '3NF removes transitive dependencies'
      ],
      tips: [
        'Identify candidate keys first',
        'Normalize step-by-step',
        'Balance normalization with performance',
        'Know when denormalization is acceptable'
      ]
    }
  },
  // Software Engineering
  {
    id: 'se-requirements',
    title: 'Software Eng: Requirements & Design',
    category: 'cs',
    difficulty: 'medium',
    icon: '🛠️',
    description: 'From requirements to architecture',
    content: {
      concept: 'Requirements capture what to build; design defines how. Use user stories, use cases, and architectural patterns.',
      examples: [
        'User story: "As a user, I want..."',
        'Use case diagram models interactions',
        'MVC separates model, view, controller',
        'Architecture choices affect maintainability'
      ],
      tips: [
        'Clarify requirements early',
        'Design for modularity',
        'Document key decisions',
        'Avoid overengineering'
      ]
    }
  },
  {
    id: 'se-testing',
    title: 'Software Eng: Testing',
    category: 'cs',
    difficulty: 'medium',
    icon: '✅',
    description: 'Unit, integration, and system testing',
    content: {
      concept: 'Testing ensures quality. Unit tests validate small pieces; integration tests validate interactions; system tests validate end-to-end behavior.',
      examples: [
        'Unit test checks a function output',
        'Integration test checks API + DB',
        'Regression test prevents old bugs',
        'CI runs tests automatically'
      ],
      tips: [
        'Test critical paths first',
        'Automate in CI/CD',
        'Keep tests deterministic',
        'Use mocks for external dependencies'
      ]
    }
  },
  // Computer Engineering
  {
    id: 'ce-logic',
    title: 'Computer Eng: Logic & Binary',
    category: 'cs',
    difficulty: 'hard',
    icon: '🧠',
    description: 'Logic gates and binary arithmetic',
    content: {
      concept: 'Digital logic uses gates (AND, OR, NOT). Binary arithmetic underlies CPU operations.',
      examples: [
        'AND: 1∧1=1, otherwise 0',
        'Binary 1010 + 0011 = 1101',
        'XOR is 1 if inputs differ',
        'Two’s complement represents negatives'
      ],
      tips: [
        'Memorize truth tables',
        'Practice binary addition',
        'Know XOR properties',
        'Two’s complement range: -2^(n-1) to 2^(n-1)-1'
      ]
    }
  },
  {
    id: 'ce-cpu-memory',
    title: 'Computer Eng: CPU & Memory',
    category: 'cs',
    difficulty: 'hard',
    icon: '💾',
    description: 'Instruction cycle and memory hierarchy',
    content: {
      concept: 'CPU executes instructions via fetch-decode-execute. Memory hierarchy: registers → cache → RAM → storage.',
      examples: [
        'Cache is faster than main memory',
        'Pipeline improves instruction throughput',
        'Registers are fastest storage',
        'Instruction cycle: fetch → decode → execute'
      ],
      tips: [
        'Know relative speeds of memory levels',
        'Caches reduce average access time',
        'Pipeline hazards can stall execution',
        'CPU performance depends on clock and CPI'
      ]
    }
  }
];

const LearningTab: React.FC<LearningTabProps> = ({ onClose }) => {
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'cs' | 'math'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filteredTopics = studyTopics.filter(topic => {
    if (filterCategory !== 'all' && topic.category !== filterCategory) return false;
    if (filterDifficulty !== 'all' && topic.difficulty !== filterDifficulty) return false;
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-300';
      case 'medium': return 'text-yellow-300';
      case 'hard': return 'text-red-300';
      default: return 'text-white';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 border-green-400/30';
      case 'medium': return 'bg-yellow-500/20 border-yellow-400/30';
      case 'hard': return 'bg-red-500/20 border-red-400/30';
      default: return 'bg-white/10 border-white/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-purple-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="relative flex justify-between items-start">
            <div>
              <h2 className="text-5xl font-bold mb-3 drop-shadow-lg">📖 Learning Center</h2>
              <p className="text-white/90 text-xl">Study topics and prepare for challenges</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 overflow-y-auto max-h-[calc(90vh-180px)]">
          {!selectedTopic ? (
            <>
              {/* Filters */}
              <div className="mb-8 space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterCategory('all')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        filterCategory === 'all'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'backdrop-blur-md bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      All Subjects
                    </button>
                    <button
                      onClick={() => setFilterCategory('cs')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        filterCategory === 'cs'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                          : 'backdrop-blur-md bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      💻 Computer Science
                    </button>
                    <button
                      onClick={() => setFilterCategory('math')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        filterCategory === 'math'
                          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                          : 'backdrop-blur-md bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      🔢 Mathematics
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterDifficulty('all')}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      filterDifficulty === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    All Levels
                  </button>
                  <button
                    onClick={() => setFilterDifficulty('easy')}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      filterDifficulty === 'easy'
                        ? 'bg-green-500/30 text-green-300 border border-green-400/30'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => setFilterDifficulty('medium')}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      filterDifficulty === 'medium'
                        ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/30'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setFilterDifficulty('hard')}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      filterDifficulty === 'hard'
                        ? 'bg-red-500/30 text-red-300 border border-red-400/30'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    Hard
                  </button>
                </div>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-5xl group-hover:scale-110 transition-transform">{topic.icon}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getDifficultyBg(topic.difficulty)} ${getDifficultyColor(topic.difficulty)}`}>
                        {topic.difficulty}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{topic.title}</h3>
                    <p className="text-white/70 text-sm mb-3">{topic.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        topic.category === 'cs'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                          : 'bg-orange-500/20 text-orange-300 border border-orange-400/30'
                      }`}>
                        {topic.category === 'cs' ? 'Computer Science' : 'Mathematics'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {filteredTopics.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-white/70 text-xl">No topics match your filters</p>
                </div>
              )}
            </>
          ) : (
            // Topic Detail View
            <div className="space-y-6">
              <button
                onClick={() => setSelectedTopic(null)}
                className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Topics
              </button>

              <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-8 border border-purple-400/30">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-7xl">{selectedTopic.icon}</span>
                    <div>
                      <h3 className="text-4xl font-bold text-white mb-2">{selectedTopic.title}</h3>
                      <p className="text-white/80 text-lg">{selectedTopic.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase ${getDifficultyBg(selectedTopic.difficulty)} ${getDifficultyColor(selectedTopic.difficulty)}`}>
                      {selectedTopic.difficulty}
                    </span>
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                      selectedTopic.category === 'cs'
                        ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
                        : 'bg-orange-500/30 text-orange-200 border border-orange-400/30'
                    }`}>
                      {selectedTopic.category === 'cs' ? 'CS' : 'Math'}
                    </span>
                  </div>
                </div>

                {/* Concept */}
                <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 mb-6 border border-white/20">
                  <h4 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
                    <span>💡</span> Core Concept
                  </h4>
                  <p className="text-white text-lg whitespace-pre-line leading-relaxed">{selectedTopic.content.concept}</p>
                </div>

                {/* Examples */}
                <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 mb-6 border border-white/20">
                  <h4 className="text-2xl font-bold text-green-300 mb-4 flex items-center gap-2">
                    <span>📝</span> Examples
                  </h4>
                  <div className="space-y-3">
                    {selectedTopic.content.examples.map((example, idx) => (
                      <div key={idx} className="backdrop-blur-sm bg-black/30 rounded-xl p-4 border border-white/10">
                        <p className="text-white font-mono text-base">{example}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
                  <h4 className="text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                    <span>✨</span> Pro Tips
                  </h4>
                  <ul className="space-y-3">
                    {selectedTopic.content.tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-3 text-white/90 text-base">
                        <span className="text-yellow-400 text-xl flex-shrink-0">→</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningTab;
