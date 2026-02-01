import { useEffect, useMemo, useState } from 'react';
import { addWeeklyBossMaterial, getCharacterInventory } from '@/services/character.service';
import { getWeeklyBossState, recordWeeklyBossCompletion } from '@/services/weeklyBoss.service';
import { WEEKLY_BOSS_MATERIALS } from '@/types/character.types';
import { getProgression } from '@/services/progression.service';
import { activateSkill, getSkillUsageRemaining, resetSkillUsageForSession } from '@/services/skill.service';

interface WeeklyBossModalProps {
  onClose: () => void;
  onComplete?: () => void;
}

type Phase = 'intro' | 'show' | 'input' | 'won' | 'lost' | 'locked';
type BossType = 'grid' | 'sequence' | 'block';

type WeeklyBossDifficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_SETTINGS: Record<WeeklyBossDifficulty, { gridSize: number; sequences: number[]; requiredLevel: number }> = {
  easy: { gridSize: 4, sequences: [3, 4, 5], requiredLevel: 1 },
  medium: { gridSize: 5, sequences: [4, 6, 8], requiredLevel: 10 },
  hard: { gridSize: 6, sequences: [5, 7, 10], requiredLevel: 20 },
};

const SEQUENCE_SETTINGS: Record<WeeklyBossDifficulty, { length: number; rounds: number; requiredLevel: number }> = {
  easy: { length: 4, rounds: 3, requiredLevel: 1 },
  medium: { length: 6, rounds: 3, requiredLevel: 10 },
  hard: { length: 8, rounds: 3, requiredLevel: 20 },
};

const BLOCK_SETTINGS: Record<WeeklyBossDifficulty, { gridSize: number; targetDamage: number; requiredLevel: number }> = {
  easy: { gridSize: 6, targetDamage: 8, requiredLevel: 1 },
  medium: { gridSize: 7, targetDamage: 12, requiredLevel: 10 },
  hard: { gridSize: 8, targetDamage: 16, requiredLevel: 20 },
};

type BlockPiece = {
  id: string;
  cells: Array<{ r: number; c: number }>;
};

const BLOCK_PIECES: BlockPiece[] = [
  { id: 'single', cells: [{ r: 0, c: 0 }] },
  { id: '2h', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }] },
  { id: '2v', cells: [{ r: 0, c: 0 }, { r: 1, c: 0 }] },
  { id: '3h', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }] },
  { id: '3v', cells: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }] },
  { id: '4h', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }] },
  { id: '4v', cells: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }] },
  { id: 'square', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }] },
  { id: 'l', cells: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 2, c: 1 }] },
  { id: 't', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 1 }] },
  { id: 'z', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }] },
  { id: 's', cells: [{ r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 0 }, { r: 1, c: 1 }] },
  { id: 'bigL', cells: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 3, c: 1 }] },
  { id: 'plus', cells: [{ r: 1, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 1 }] },
];

const buildSequence = (length: number, gridSize: number): number[] => {
  const total = gridSize * gridSize;
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, length);
};

const WeeklyBossModal: React.FC<WeeklyBossModalProps> = ({ onClose, onComplete }) => {
  const bossState = useMemo(() => getWeeklyBossState(), []);
  const progression = useMemo(() => getProgression(), []);
  const inventory = useMemo(() => getCharacterInventory(), []);
  const activeCharacter = useMemo(() => 
    inventory.characters.find(c => c.id === inventory.activeCharacterId),
    [inventory]
  );
  const [bossSessionId] = useState(() => `boss_${Date.now()}`); // Unique session ID for this boss fight
  const [difficulty, setDifficulty] = useState<WeeklyBossDifficulty>('easy');
  const [phase, setPhase] = useState<Phase>(bossState.isAvailable ? 'intro' : 'locked');
  const [bossType, setBossType] = useState<BossType>('grid');
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [showIndex, setShowIndex] = useState(0);
  const [showValue, setShowValue] = useState<number | null>(null);
  const [blockGrid, setBlockGrid] = useState<boolean[][]>([]);
  const [blockPieces, setBlockPieces] = useState<BlockPiece[]>([]);
  const [selectedBlockPiece, setSelectedBlockPiece] = useState(0);
  const [blockDamage, setBlockDamage] = useState(0);
  const [draggedPieceIndex, setDraggedPieceIndex] = useState<number | null>(null);
  const [hoverCellIndex, setHoverCellIndex] = useState<number | null>(null);
  const [skillMessage, setSkillMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(null);

  // Reset skill usage when component mounts (new boss fight)
  useEffect(() => {
    resetSkillUsageForSession(bossSessionId);
  }, [bossSessionId]);

  const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;

  const applySkillEffect = (skillId: string) => {
    // Formula Strike - works on all bosses
    if (skillId === 'formula_strike') {
      if (bossType === 'block') {
        const bonusDamage = 15;
        const nextDamage = blockDamage + bonusDamage;
        setBlockDamage(nextDamage);
        if (nextDamage >= BLOCK_SETTINGS[difficulty].targetDamage) {
          setPhase('won');
          setMessage('Weekly Boss defeated! Rewards claimed.');
          grantWeeklyBossRewards();
          recordWeeklyBossCompletion();
          if (onComplete) onComplete();
        }
        return { message: `⚡ Formula Strike! Dealt ${bonusDamage} damage!`, type: 'success' as const };
      }
      // For grid and sequence, just give a helpful hint
      return { message: `⚡ Formula Strike! Focus granted!`, type: 'success' as const };
    }

    if (bossType === 'grid' && skillId === 'pattern_lock') {
      // Reveal 3 tiles in the sequence
      const tilesToReveal = 3;
      let revealed = 0;
      Array.from({ length: DIFFICULTY_SETTINGS[difficulty].gridSize * DIFFICULTY_SETTINGS[difficulty].gridSize }).forEach((_, index) => {
        if (revealed < tilesToReveal && sequence.includes(index) && !input.includes(index)) {
          const nextExpected = sequence[input.length];
          if (index === nextExpected) {
            handleCellClick(index);
            revealed++;
          }
        }
      });
      return { message: `✨ Pattern Lock! Automatically solved 3 tiles!`, type: 'success' as const };
    }

    if (bossType === 'sequence' && skillId === 'echo_chain') {
      // Give 2 free correct inputs
      let corrected = 0;
      while (corrected < 2 && input.length < sequence.length) {
        const nextExpected = sequence[input.length];
        const nextInput = [...input, nextExpected];
        setInput(nextInput);
        corrected++;
      }
      // Check if completed
      if (input.length + corrected >= sequence.length) {
        setPhase('won');
        setMessage('Weekly Boss defeated! Rewards claimed.');
        grantWeeklyBossRewards();
        recordWeeklyBossCompletion();
        if (onComplete) onComplete();
      }
      return { message: `🔗 Echo Chain! Automatically repeated 2 numbers!`, type: 'success' as const };
    }

    if (bossType === 'block' && skillId === 'chain_reactor') {
      // Deal massive bonus damage
      const bonusDamage = 20;
      const nextDamage = blockDamage + bonusDamage;
      setBlockDamage(nextDamage);

      if (nextDamage >= BLOCK_SETTINGS[difficulty].targetDamage) {
        setPhase('won');
        setMessage('Weekly Boss defeated! Rewards claimed.');
        grantWeeklyBossRewards();
        recordWeeklyBossCompletion();
        if (onComplete) onComplete();
      }
      return { message: `💥 Chain Reactor! Dealt ${bonusDamage} bonus damage!`, type: 'success' as const };
    }

    return { message: '✨ Skill activated!', type: 'success' as const };
  };

  const handleSkillActivation = (skillId: string) => {
    if (!activeCharacter) return;
    if (messageTimeout) clearTimeout(messageTimeout);
    
    const skill = activeCharacter.skills?.find(s => s.id === skillId);
    if (!skill) return;
    
    const result = activateSkill(bossSessionId, activeCharacter.id, skill);
    
    if (result.success) {
      // Apply actual skill effect
      const effectResult = applySkillEffect(skillId);
      setSkillMessage({ text: effectResult.message, type: effectResult.type });
    } else {
      setSkillMessage({ text: result.error || 'Failed to activate skill', type: 'error' });
    }
    
    const timeout = setTimeout(() => setSkillMessage(null), 3000);
    setMessageTimeout(timeout);
  };

  const grantWeeklyBossRewards = () => {
    if (bossType === 'grid') {
      addWeeklyBossMaterial('memory', 2 * difficultyMultiplier);
      addWeeklyBossMaterial('sigil', 3 * difficultyMultiplier);
    } else if (bossType === 'sequence') {
      addWeeklyBossMaterial('crown', 1 * difficultyMultiplier);
      addWeeklyBossMaterial('sigil', 2 * difficultyMultiplier);
    } else {
      addWeeklyBossMaterial('glyph', 2 * difficultyMultiplier);
      addWeeklyBossMaterial('sigil', 2 * difficultyMultiplier);
    }
  };

  useEffect(() => {
    if (phase !== 'show') return;

    if (bossType === 'grid') {
      const showDuration = 1200 + sequence.length * 450;
      const timer = setTimeout(() => {
        setPhase('input');
      }, showDuration);

      return () => clearTimeout(timer);
    }

    // sequence boss: show one number at a time
    setShowIndex(0);
    setShowValue(sequence[0] ?? null);

    const interval = setInterval(() => {
      setShowIndex((prev) => {
        const next = prev + 1;
        if (next >= sequence.length) {
          clearInterval(interval);
          setShowValue(null);
          setPhase('input');
          return prev;
        }
        setShowValue(sequence[next]);
        return next;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [phase, sequence, bossType]);

  const createEmptyGrid = (size: number) => Array.from({ length: size }, () => Array.from({ length: size }, () => false));

  const randomPieces = (): BlockPiece[] => {
    const pool = difficulty === 'easy'
      ? BLOCK_PIECES.slice(0, 7)
      : difficulty === 'medium'
        ? BLOCK_PIECES.slice(0, 11)
        : BLOCK_PIECES;
    const picks = [] as BlockPiece[];
    for (let i = 0; i < 3; i += 1) {
      const piece = pool[Math.floor(Math.random() * pool.length)];
      picks.push(piece);
    }
    return picks;
  };

  const canPlace = (grid: boolean[][], piece: BlockPiece, row: number, col: number) => {
    const size = grid.length;
    return piece.cells.every((cell) => {
      const r = row + cell.r;
      const c = col + cell.c;
      return r >= 0 && c >= 0 && r < size && c < size && !grid[r][c];
    });
  };

  const placePiece = (grid: boolean[][], piece: BlockPiece, row: number, col: number) => {
    const next = grid.map((r) => [...r]);
    piece.cells.forEach((cell) => {
      next[row + cell.r][col + cell.c] = true;
    });
    return next;
  };

  const clearLines = (grid: boolean[][]) => {
    const size = grid.length;
    const rowsToClear = new Set<number>();
    const colsToClear = new Set<number>();

    for (let r = 0; r < size; r += 1) {
      if (grid[r].every(Boolean)) rowsToClear.add(r);
    }
    for (let c = 0; c < size; c += 1) {
      let filled = true;
      for (let r = 0; r < size; r += 1) {
        if (!grid[r][c]) {
          filled = false;
          break;
        }
      }
      if (filled) colsToClear.add(c);
    }

    if (rowsToClear.size === 0 && colsToClear.size === 0) {
      return { grid, cleared: 0 };
    }

    const next = grid.map((row, r) => row.map((cell, c) => {
      if (rowsToClear.has(r) || colsToClear.has(c)) return false;
      return cell;
    }));

    return { grid: next, cleared: rowsToClear.size + colsToClear.size };
  };

  const anyPieceFits = (grid: boolean[][], pieces: BlockPiece[]) => {
    const size = grid.length;
    return pieces.some((piece) => {
      for (let r = 0; r < size; r += 1) {
        for (let c = 0; c < size; c += 1) {
          if (canPlace(grid, piece, r, c)) return true;
        }
      }
      return false;
    });
  };

  const startRound = (roundIndex: number) => {
    if (bossType === 'grid') {
      const settings = DIFFICULTY_SETTINGS[difficulty];
      const nextSequence = buildSequence(settings.sequences[roundIndex], settings.gridSize);
      setSequence(nextSequence);
    } else {
      const settings = SEQUENCE_SETTINGS[difficulty];
      const digits = Array.from({ length: 9 }, (_, i) => i + 1);
      const nextSequence = Array.from({ length: settings.length }, () => digits[Math.floor(Math.random() * digits.length)]);
      setSequence(nextSequence);
    }

    setInput([]);
    setPhase('show');
  };

  const handleStart = () => {
    const settings = bossType === 'grid'
      ? DIFFICULTY_SETTINGS[difficulty]
      : bossType === 'sequence'
        ? SEQUENCE_SETTINGS[difficulty]
        : BLOCK_SETTINGS[difficulty];
    if (progression.currentLevel < settings.requiredLevel) {
      setMessage(`Unlocks at player level ${settings.requiredLevel}.`);
      return;
    }
    setMessage(null);
    setRound(0);

    if (bossType === 'block') {
      const grid = createEmptyGrid(BLOCK_SETTINGS[difficulty].gridSize);
      setBlockGrid(grid);
      setBlockPieces(randomPieces());
      setSelectedBlockPiece(0);
      setBlockDamage(0);
      setPhase('input');
      return;
    }

    startRound(0);
  };

  const handleCellClick = (cellIndex: number) => {
    if (phase !== 'input') return;

    if (bossType === 'block') {
      const size = BLOCK_SETTINGS[difficulty].gridSize;
      const row = Math.floor(cellIndex / size);
      const col = cellIndex % size;
      const piece = blockPieces[selectedBlockPiece];
      if (!piece || !canPlace(blockGrid, piece, row, col)) {
        return;
      }

      let nextGrid = placePiece(blockGrid, piece, row, col);
      const clearedResult = clearLines(nextGrid);
      nextGrid = clearedResult.grid;

      const damageGained = clearedResult.cleared * 2;
      const nextDamage = blockDamage + damageGained;
      setBlockDamage(nextDamage);

      const nextPieces = blockPieces.filter((_, index) => index !== selectedBlockPiece);
      const refreshedPieces = nextPieces.length === 0 ? randomPieces() : nextPieces;
      setBlockPieces(refreshedPieces);
      setSelectedBlockPiece(0);
      setBlockGrid(nextGrid);

      if (nextDamage >= BLOCK_SETTINGS[difficulty].targetDamage) {
        setPhase('won');
        setMessage('Weekly Boss defeated! Rewards claimed.');
        grantWeeklyBossRewards();
        recordWeeklyBossCompletion();
        if (onComplete) onComplete();
        return;
      }

      if (!anyPieceFits(nextGrid, refreshedPieces)) {
        setPhase('lost');
        setMessage('No moves left! The blocks overwhelm you.');
      }

      return;
    }

    const nextExpected = sequence[input.length];
    if (cellIndex !== nextExpected) {
      setPhase('lost');
      setMessage('Wrong tile! The boss overwhelms you.');
      return;
    }

    const nextInput = [...input, cellIndex];
    setInput(nextInput);

    if (nextInput.length === sequence.length) {
      let maxRounds = 0;
      if (bossType === 'grid') {
        maxRounds = DIFFICULTY_SETTINGS[difficulty].sequences.length;
      } else {
        maxRounds = SEQUENCE_SETTINGS[difficulty].rounds;
      }
      if (round + 1 >= maxRounds) {
        setPhase('won');
        setMessage('Weekly Boss defeated! Rewards claimed.');
        grantWeeklyBossRewards();
        recordWeeklyBossCompletion();
        if (onComplete) onComplete();
        return;
      }

      const nextRound = round + 1;
      setRound(nextRound);
      startRound(nextRound);
    }
  };

  const handleDropPiece = (cellIndex: number) => {
    if (bossType !== 'block' || phase !== 'input') return;
    const pieceIndex = draggedPieceIndex ?? selectedBlockPiece;
    setDraggedPieceIndex(null);
    setSelectedBlockPiece(pieceIndex);
    setHoverCellIndex(null);
    handleCellClick(cellIndex);
  };

  const renderGridCell = (index: number) => {
    const isSequenceCell = sequence.includes(index);
    const sequenceIndex = sequence.indexOf(index);
    const isRevealed = phase === 'show' && isSequenceCell;
    const isSelected = input.includes(index);

    return (
      <button
        key={index}
        onClick={() => handleCellClick(index)}
        className={`aspect-square rounded-lg font-bold text-lg border transition-all duration-200 ${
          isSelected
            ? 'bg-emerald-500 text-white border-emerald-500'
            : isRevealed
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-white border-gray-200 hover:border-emerald-300'
        }`}
      >
        {isRevealed ? sequenceIndex + 1 : ''}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full relative z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">👑 Weekly Boss: Memory Grid</h2>
            <p className="text-indigo-100 text-sm">Memorize the numbers and tap in order.</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {phase === 'locked' && (
            <div className="text-center space-y-4">
              <div className="text-4xl">⏳</div>
              <h3 className="text-xl font-bold text-gray-800">Weekly Boss attempts used</h3>
              <p className="text-gray-600">
                Next attempt available in {bossState.daysRemaining} day{bossState.daysRemaining === 1 ? '' : 's'}.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold"
              >
                Close
              </button>
            </div>
          )}

          {phase === 'intro' && (
            <div className="text-center space-y-4">
              <div className="text-4xl">🧠</div>
              <h3 className="text-xl font-bold text-gray-800">Weekly Boss Challenge</h3>
              <p className="text-gray-600">Choose a boss type and difficulty.</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setBossType('grid')}
                  className={`rounded-lg p-3 text-sm font-semibold border transition-all ${
                    bossType === 'grid'
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  🧩 Memory Grid
                </button>
                <button
                  onClick={() => setBossType('sequence')}
                  className={`rounded-lg p-3 text-sm font-semibold border transition-all ${
                    bossType === 'sequence'
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  🔢 Memory Sequence
                </button>
                <button
                  onClick={() => setBossType('block')}
                  className={`rounded-lg p-3 text-sm font-semibold border transition-all ${
                    bossType === 'block'
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  🧩 Block Blast
                </button>
              </div>
              <p className="text-sm text-gray-500">Attempts left this week: {bossState.attemptsLeft}</p>
              <div className="grid grid-cols-3 gap-3 text-left">
                {(Object.keys(DIFFICULTY_SETTINGS) as WeeklyBossDifficulty[]).map((key) => {
                  const setting = bossType === 'grid'
                    ? DIFFICULTY_SETTINGS[key]
                    : bossType === 'sequence'
                      ? SEQUENCE_SETTINGS[key]
                      : BLOCK_SETTINGS[key];
                  const unlocked = progression.currentLevel >= setting.requiredLevel;
                  return (
                    <button
                      key={key}
                      onClick={() => unlocked && setDifficulty(key)}
                      className={`rounded-lg p-3 text-sm font-semibold border transition-all ${
                        difficulty === key && unlocked
                          ? 'bg-purple-500 text-white border-purple-500'
                          : unlocked
                            ? 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                            : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <div className="capitalize">{key}</div>
                      {bossType === 'grid' ? (
                        <div className="text-[10px] mt-1">Grid {(setting as typeof DIFFICULTY_SETTINGS.easy).gridSize}x{(setting as typeof DIFFICULTY_SETTINGS.easy).gridSize}</div>
                      ) : bossType === 'sequence' ? (
                        <div className="text-[10px] mt-1">Length {(setting as typeof SEQUENCE_SETTINGS.easy).length}</div>
                      ) : (
                        <div className="text-[10px] mt-1">Grid {(setting as typeof BLOCK_SETTINGS.easy).gridSize}x{(setting as typeof BLOCK_SETTINGS.easy).gridSize}</div>
                      )}
                      {!unlocked && (
                        <div className="text-[10px] mt-1">Unlock at Lv.{setting.requiredLevel}</div>
                      )}
                    </button>
                  );
                })}
              </div>
              {message && (
                <div className="text-sm text-red-600 font-semibold">{message}</div>
              )}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
                Rewards (scaled by difficulty): {bossType === 'grid'
                  ? `${WEEKLY_BOSS_MATERIALS.memory.icon} ${WEEKLY_BOSS_MATERIALS.memory.name} x${2 * difficultyMultiplier}, ${WEEKLY_BOSS_MATERIALS.sigil.icon} ${WEEKLY_BOSS_MATERIALS.sigil.name} x${3 * difficultyMultiplier}`
                  : bossType === 'sequence'
                    ? `${WEEKLY_BOSS_MATERIALS.crown.icon} ${WEEKLY_BOSS_MATERIALS.crown.name} x${1 * difficultyMultiplier}, ${WEEKLY_BOSS_MATERIALS.sigil.icon} ${WEEKLY_BOSS_MATERIALS.sigil.name} x${2 * difficultyMultiplier}`
                    : `${WEEKLY_BOSS_MATERIALS.glyph.icon} ${WEEKLY_BOSS_MATERIALS.glyph.name} x${2 * difficultyMultiplier}, ${WEEKLY_BOSS_MATERIALS.sigil.icon} ${WEEKLY_BOSS_MATERIALS.sigil.name} x${2 * difficultyMultiplier}`}
              </div>
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700"
              >
                Start Weekly Boss
              </button>
            </div>
          )}

          {(phase === 'show' || phase === 'input') && bossType === 'grid' && (
            <div className="space-y-4">
              {/* Active Skills Panel */}
              {activeCharacter?.skills && activeCharacter.skills.filter(s => s.type === 'active').length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-bold text-blue-900 mb-3">⚡ Active Skills</div>
                  {skillMessage && (
                    <div className={`mb-3 p-2 rounded text-xs font-semibold text-center ${
                      skillMessage.type === 'success'
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                      {skillMessage.text}
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {activeCharacter.skills
                      .filter(skill => skill.type === 'active')
                      .map(skill => {
                        const usageRemaining = getSkillUsageRemaining(bossSessionId, activeCharacter.id, skill.id);
                        const isUsedUp = usageRemaining <= 0;
                        return (
                          <button
                            key={skill.id}
                            onClick={() => handleSkillActivation(skill.id)}
                            disabled={isUsedUp}
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                              isUsedUp
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 cursor-pointer'
                            }`}
                            title={isUsedUp ? 'Used up this fight' : skill.description}
                          >
                            {skill.icon} {isUsedUp ? 'Used' : `${usageRemaining}x`}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Round {round + 1}/{DIFFICULTY_SETTINGS[difficulty].sequences.length}
                </div>
                <div className="text-sm text-gray-600">
                  {phase === 'show' ? 'Memorize...' : 'Tap in order'}
                </div>
              </div>
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${DIFFICULTY_SETTINGS[difficulty].gridSize}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: DIFFICULTY_SETTINGS[difficulty].gridSize * DIFFICULTY_SETTINGS[difficulty].gridSize }, (_, index) => renderGridCell(index))}
              </div>
            </div>
          )}

          {(phase === 'show' || phase === 'input') && bossType === 'sequence' && (
            <div className="space-y-4">
              {/* Active Skills Panel */}
              {activeCharacter?.skills && activeCharacter.skills.filter(s => s.type === 'active').length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-bold text-blue-900 mb-3">⚡ Active Skills</div>
                  {skillMessage && (
                    <div className={`mb-3 p-2 rounded text-xs font-semibold text-center ${
                      skillMessage.type === 'success'
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                      {skillMessage.text}
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {activeCharacter.skills
                      .filter(skill => skill.type === 'active')
                      .map(skill => {
                        const usageRemaining = getSkillUsageRemaining(bossSessionId, activeCharacter.id, skill.id);
                        const isUsedUp = usageRemaining <= 0;
                        return (
                          <button
                            key={skill.id}
                            onClick={() => handleSkillActivation(skill.id)}
                            disabled={isUsedUp}
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                              isUsedUp
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 cursor-pointer'
                            }`}
                            title={isUsedUp ? 'Used up this fight' : skill.description}
                          >
                            {skill.icon} {isUsedUp ? 'Used' : `${usageRemaining}x`}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Round {round + 1}/{SEQUENCE_SETTINGS[difficulty].rounds}
                </div>
                <div className="text-sm text-gray-600">
                  {phase === 'show' ? 'Watch the sequence...' : 'Repeat the sequence'}
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
                <div className="text-5xl font-bold text-indigo-700">
                  {phase === 'show' ? (showValue ?? '•') : '•'}
                </div>
              </div>
              {phase === 'input' && (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((value) => (
                    <button
                      key={value}
                      onClick={() => handleCellClick(value)}
                      className="py-4 rounded-lg font-bold text-lg bg-white border border-gray-200 hover:border-indigo-300"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {phase === 'input' && bossType === 'block' && (
            <div className="space-y-4">
              {/* Active Skills Panel */}
              {activeCharacter?.skills && activeCharacter.skills.filter(s => s.type === 'active').length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-bold text-blue-900 mb-3">⚡ Active Skills</div>
                  {skillMessage && (
                    <div className={`mb-3 p-2 rounded text-xs font-semibold text-center ${
                      skillMessage.type === 'success'
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                      {skillMessage.text}
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {activeCharacter.skills
                      .filter(skill => skill.type === 'active')
                      .map(skill => {
                        const usageRemaining = getSkillUsageRemaining(bossSessionId, activeCharacter.id, skill.id);
                        const isUsedUp = usageRemaining <= 0;
                        return (
                          <button
                            key={skill.id}
                            onClick={() => handleSkillActivation(skill.id)}
                            disabled={isUsedUp}
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                              isUsedUp
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 cursor-pointer'
                            }`}
                            title={isUsedUp ? 'Used up this fight' : skill.description}
                          >
                            {skill.icon} {isUsedUp ? 'Used' : `${usageRemaining}x`}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Block Blast</div>
                <div className="text-sm text-gray-600">
                  Damage {blockDamage}/{BLOCK_SETTINGS[difficulty].targetDamage}
                </div>
              </div>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${BLOCK_SETTINGS[difficulty].gridSize}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: BLOCK_SETTINGS[difficulty].gridSize * BLOCK_SETTINGS[difficulty].gridSize }, (_, index) => {
                  const size = BLOCK_SETTINGS[difficulty].gridSize;
                  const row = Math.floor(index / size);
                  const col = index % size;
                  const filled = blockGrid[row]?.[col];
                  const activePieceIndex = draggedPieceIndex ?? selectedBlockPiece;
                  const activePiece = blockPieces[activePieceIndex];
                  const hoverRow = hoverCellIndex != null ? Math.floor(hoverCellIndex / size) : null;
                  const hoverCol = hoverCellIndex != null ? hoverCellIndex % size : null;
                  const isPreview =
                    activePiece && hoverRow != null && hoverCol != null &&
                    activePiece.cells.some((cell) => hoverRow + cell.r === row && hoverCol + cell.c === col);
                  const canPreviewPlace =
                    activePiece && hoverRow != null && hoverCol != null
                      ? canPlace(blockGrid, activePiece, hoverRow, hoverCol)
                      : false;
                  return (
                    <div
                      key={index}
                      onClick={() => handleCellClick(index)}
                      onMouseEnter={() => setHoverCellIndex(index)}
                      onMouseLeave={() => setHoverCellIndex(null)}
                      onDragEnter={() => setHoverCellIndex(index)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setHoverCellIndex(index);
                      }}
                      onDrop={() => handleDropPiece(index)}
                      className={`aspect-square rounded-md border transition-all ${
                        filled
                          ? 'bg-indigo-500 border-indigo-500'
                          : isPreview
                            ? canPreviewPlace
                              ? 'bg-emerald-200 border-emerald-400'
                              : 'bg-red-200 border-red-400'
                            : 'bg-white border-gray-200 hover:border-indigo-300'
                      }`}
                    />
                  );
                })}
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-2">Pieces</div>
                <div className="grid grid-cols-3 gap-3">
                  {blockPieces.map((piece, index) => (
                    <button
                      key={`${piece.id}-${index}`}
                      onClick={() => setSelectedBlockPiece(index)}
                      draggable
                      onDragStart={() => setDraggedPieceIndex(index)}
                      onDragEnd={() => setDraggedPieceIndex(null)}
                      className={`rounded-lg border p-2 transition-all ${
                        selectedBlockPiece === index
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                        {Array.from({ length: 16 }, (_, cellIndex) => {
                          const r = Math.floor(cellIndex / 4);
                          const c = cellIndex % 4;
                          const active = piece.cells.some((cell) => cell.r === r && cell.c === c);
                          return (
                            <div
                              key={cellIndex}
                              className={`aspect-square rounded-sm ${active ? 'bg-indigo-500' : 'bg-transparent'}`}
                            />
                          );
                        })}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">Clear full rows/columns to deal damage. Lose if no moves remain.</div>
              </div>
            </div>
          )}

          {phase === 'won' && (
            <div className="text-center space-y-4">
              <div className="text-5xl">🏆</div>
              <h3 className="text-2xl font-bold text-emerald-600">Victory!</h3>
              <p className="text-gray-600">You conquered the Weekly Boss.</p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
                Rewards added to your inventory.
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          )}

          {phase === 'lost' && (
            <div className="text-center space-y-4">
              <div className="text-5xl">💥</div>
              <h3 className="text-2xl font-bold text-red-600">Defeat</h3>
              <p className="text-gray-600">{message || 'Try again next week.'}</p>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-bold"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyBossModal;
