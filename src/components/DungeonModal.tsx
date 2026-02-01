import { useEffect, useMemo, useState } from 'react';
import { SkillMaterialInventory, SKILL_MATERIALS, UncapMaterialInventory, UNCAP_MATERIALS, SkillMaterialType, UncapMaterialType, BOOK_DATA } from '@/types/character.types';
import { DungeonDifficulty, DungeonType, DungeonBattle, SharedRewardType } from '@/types/dungeon.types';
import { MathQuestion, Difficulty } from '@/types/game.types';
import { getEnergyConfig, getEnergyState } from '@/services/energy.service';
import { getBookInventory, getSkillMaterialInventory, getUncapMaterialInventory } from '@/services/character.service';
import { loadUserProgress } from '@/services/missions.service';
import { getDungeonDifficultyRequirement, getDungeonEnergyCost, isDungeonDifficultyUnlocked, runDungeon } from '@/services/dungeon.service';
import { generateMathQuestions } from '@/services/mathApi.service';
import DungeonQuestionDisplay from './DungeonQuestionDisplay';
import MathRenderer from './MathRenderer';

interface DungeonModalProps {
  onClose: () => void;
}

const DIFFICULTIES: DungeonDifficulty[] = ['easy', 'medium', 'hard'];
const ROUNDS_PER_DIFFICULTY = {
  easy: 3,
  medium: 5,
  hard: 7,
};

const DungeonModal: React.FC<DungeonModalProps> = ({ onClose }) => {
  const [dungeonType, setDungeonType] = useState<DungeonType>('skill');
  const [difficulty, setDifficulty] = useState<DungeonDifficulty>('easy');
  const [selectedSkillMaterial, setSelectedSkillMaterial] = useState<SkillMaterialType>('spark');
  const [selectedUncapMaterial, setSelectedUncapMaterial] = useState<UncapMaterialType>('crystal');
  const [selectedSharedReward, setSelectedSharedReward] = useState<SharedRewardType>('points');
  const [energyState, setEnergyState] = useState(getEnergyState());
  const [skillInventory, setSkillInventory] = useState<SkillMaterialInventory>(getSkillMaterialInventory());
  const [uncapInventory, setUncapInventory] = useState<UncapMaterialInventory>(getUncapMaterialInventory());
  const [bookInventory, setBookInventory] = useState(getBookInventory());
  const [points, setPoints] = useState(loadUserProgress().totalPoints);
  const [message, setMessage] = useState<string | null>(null);
  
  // Battle state
  const [battle, setBattle] = useState<DungeonBattle | null>(null);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const energyConfig = useMemo(() => getEnergyConfig(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyState(getEnergyState());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const startBattle = async () => {
    // Check energy first
    const energyCost = getDungeonEnergyCost(difficulty);
    if (energyState.energy < energyCost) {
      setMessage('Not enough energy!');
      setTimeout(() => setMessage(null), 2500);
      return;
    }

    setLoading(true);
    try {
      const totalRounds = ROUNDS_PER_DIFFICULTY[difficulty];
      // Convert DungeonDifficulty string to Difficulty enum
      const difficultyEnum = difficulty === 'easy' ? Difficulty.EASY : difficulty === 'medium' ? Difficulty.MEDIUM : Difficulty.HARD;
      const generatedQuestions = await generateMathQuestions(difficultyEnum, totalRounds);
      
      setQuestions(generatedQuestions);
      setBattle({
        currentRound: 1,
        totalRounds,
        correctAnswers: 0,
        incorrectAnswers: 0,
        wrongAnswerIndices: [],
        status: 'in-progress',
      });
      setCurrentQuestionIndex(0);
    } catch (error) {
      setMessage('Failed to load questions');
      setTimeout(() => setMessage(null), 2500);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selectedOption: number) => {
    if (!battle || currentQuestionIndex >= questions.length) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    const updatedBattle = { ...battle };
    if (isCorrect) {
      updatedBattle.correctAnswers++;
    } else {
      updatedBattle.incorrectAnswers++;
      updatedBattle.wrongAnswerIndices.push(currentQuestionIndex);
    }

    // Check if battle is over
    if (currentQuestionIndex === questions.length - 1) {
      // Determine win/loss
      const successThreshold = Math.ceil(questions.length * 0.6); // Need 60% correct
      updatedBattle.status = updatedBattle.correctAnswers >= successThreshold ? 'won' : 'lost';
      
      if (updatedBattle.status === 'won') {
        // Complete the dungeon run and give rewards
        const material = dungeonType === 'skill'
          ? selectedSkillMaterial
          : dungeonType === 'ascension'
            ? selectedUncapMaterial
            : selectedSharedReward;
        const result = runDungeon(dungeonType, difficulty, material);
        if (result.success && result.result) {
          if (result.result.skillMaterials) {
            const [key, value] = Object.entries(result.result.skillMaterials)[0];
            setMessage(`+${value} ${SKILL_MATERIALS[key as SkillMaterialType].name}`);
          } else if (result.result.uncapMaterials) {
            const [key, value] = Object.entries(result.result.uncapMaterials)[0];
            setMessage(`+${value} ${UNCAP_MATERIALS[key as UncapMaterialType].name}`);
          } else if (result.result.pointsReward) {
            setMessage(`+${result.result.pointsReward} Points`);
          } else if (result.result.booksReward) {
            const [key, value] = Object.entries(result.result.booksReward)[0];
            const tier = Number(key) as 1 | 2 | 3;
            setMessage(`+${value} ${BOOK_DATA[tier].name}`);
          } else {
            setMessage(`✨ Victory! Rewards earned!`);
          }

          setEnergyState(getEnergyState());
          setSkillInventory(getSkillMaterialInventory());
          setUncapInventory(getUncapMaterialInventory());
          setBookInventory(getBookInventory());
          setPoints(loadUserProgress().totalPoints);
        }
      }
      
      setTimeout(() => setMessage(null), 2500);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }

    setBattle(updatedBattle);
  };

  const handleForfeit = () => {
    setMessage('❌ Battle forfeited!');
    setTimeout(() => {
      closeBattle();
      setMessage(null);
    }, 1500);
  };

  const closeBattle = () => {
    setBattle(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
  };

  // During battle
  if (battle) {
    const currentQuestion = questions[currentQuestionIndex];
    const successThreshold = Math.ceil(questions.length * 0.6);

    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000]">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={battle.status !== 'in-progress' ? closeBattle : undefined} />
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden">
          {/* Header with battle stats */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">⚔️ Dungeon Battle</h2>
              {battle.status === 'in-progress' && (
                <div className="text-sm font-semibold">Round {battle.currentRound}/{battle.totalRounds}</div>
              )}
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
              />
            </div>
            {/* Score */}
            <div className="mt-3 flex gap-4 text-sm">
              <div>✅ Correct: {battle.correctAnswers}</div>
              <div>❌ Wrong: {battle.incorrectAnswers}</div>
              <div className="ml-auto">Need: {successThreshold}/{questions.length}</div>
            </div>
          </div>

          <div className="p-6">
            {battle.status === 'in-progress' && currentQuestion && (
              <DungeonQuestionDisplay
                question={currentQuestion}
                onSelectOption={handleAnswer}
                onForfeit={handleForfeit}
              />
            )}

            {battle.status === 'won' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-emerald-600 mb-2">Victory!</h3>
                <p className="text-gray-600 mb-4">
                  You answered {battle.correctAnswers}/{questions.length} correctly!
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Materials have been added to your inventory.
                </p>
                {message && (
                  <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-300 inline-block mb-4">
                    {message}
                  </div>
                )}
                {battle.wrongAnswerIndices.length > 0 && (
                  <div className="mt-6 text-left bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <h4 className="font-bold text-yellow-800 mb-3">📚 Wrong Answers Review:</h4>
                    {battle.wrongAnswerIndices.map((idx) => (
                      <div key={idx} className="mb-4 pb-4 border-b border-yellow-200 last:border-b-0">
                        <div className="font-semibold text-gray-800 mb-2">
                          Q{idx + 1}: <MathRenderer content={questions[idx].question} />
                        </div>
                        <p className="text-sm text-gray-700 bg-white p-2 rounded mb-2">
                          <span className="font-semibold">Correct Answer:</span>{' '}
                          <MathRenderer content={String(questions[idx].correctAnswer)} />
                        </p>
                        <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                          <span className="font-semibold">💡 Explanation:</span>{' '}
                          <MathRenderer content={questions[idx].explanation || ''} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={closeBattle}
                  className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                >
                  Continue
                </button>
              </div>
            )}

            {battle.status === 'lost' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">💔</div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">Defeated!</h3>
                <p className="text-gray-600 mb-4">
                  You answered {battle.correctAnswers}/{questions.length} correctly. Need {successThreshold}!
                </p>
                {message && (
                  <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold border border-red-300 inline-block mb-4">
                    {message}
                  </div>
                )}
                <div className="mt-6 text-left bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h4 className="font-bold text-yellow-800 mb-3">📚 Wrong Answers Review:</h4>
                  {battle.wrongAnswerIndices.map((idx) => (
                    <div key={idx} className="mb-4 pb-4 border-b border-yellow-200 last:border-b-0">
                      <div className="font-semibold text-gray-800 mb-2">
                        Q{idx + 1}: <MathRenderer content={questions[idx].question} />
                      </div>
                      <p className="text-sm text-gray-700 bg-white p-2 rounded mb-2">
                        <span className="font-semibold">Correct Answer:</span>{' '}
                        <MathRenderer content={String(questions[idx].correctAnswer)} />
                      </p>
                      <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                        <span className="font-semibold">💡 Explanation:</span>{' '}
                        <MathRenderer content={questions[idx].explanation || ''} />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={closeBattle}
                  className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Setup screen
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full relative z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">🏰 Material Dungeon</h2>
            <p className="text-emerald-100 text-sm">Answer questions to farm upgrade materials!</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Energy */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-emerald-700">Energy</div>
              <div className="text-2xl font-bold text-emerald-800">
                {energyState.energy}/{energyConfig.maxEnergy}
              </div>
              <div className="text-xs text-emerald-600">+{energyConfig.regenAmount} every {energyConfig.regenIntervalMinutes} min</div>
            </div>
            {message && (
              <div className="px-3 py-2 bg-white text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-200">
                {message}
              </div>
            )}
          </div>

          {/* Shared Rewards */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
            <div className="text-sm font-semibold text-slate-700 mb-3">Shared Rewards</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-slate-800">{points}</div>
                <div className="text-xs text-slate-600">⭐ Points</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-600">📘 {bookInventory.tier1} • 📗 {bookInventory.tier2} • 📕 {bookInventory.tier3}</div>
                <div className="text-xs text-slate-600 mt-1">EXP Books</div>
              </div>
            </div>
          </div>

          {/* Type Toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setDungeonType('skill')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                dungeonType === 'skill'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              ✨ Skill Materials
            </button>
            <button
              onClick={() => setDungeonType('ascension')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                dungeonType === 'ascension'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              🌟 Ascension Materials
            </button>
            <button
              onClick={() => setDungeonType('shared')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                dungeonType === 'shared'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              🎁 Utility Farm
            </button>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Difficulty</h3>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((item) => {
                const unlocked = isDungeonDifficultyUnlocked(item);
                const requirement = getDungeonDifficultyRequirement(item);
                const cost = getDungeonEnergyCost(item);
                const rounds = ROUNDS_PER_DIFFICULTY[item];

                return (
                  <button
                    key={item}
                    onClick={() => unlocked && setDifficulty(item)}
                    className={`rounded-lg p-3 text-sm font-semibold border transition-all ${
                      difficulty === item && unlocked
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : unlocked
                          ? 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                          : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <div className="capitalize">{item}</div>
                    <div className="text-xs mt-1">⚡ {cost} | ❓ {rounds} Q</div>
                    {!unlocked && (
                      <div className="text-[10px] mt-1">Unlock at Lv.{requirement}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material Selection */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">
              {dungeonType === 'shared' ? 'Select Utility' : 'Select Material'}
            </h3>
            {dungeonType === 'skill' ? (
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(SKILL_MATERIALS) as SkillMaterialType[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSkillMaterial(key)}
                    className={`rounded-lg p-3 border text-sm font-semibold transition-all ${
                      selectedSkillMaterial === key
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-xl">{SKILL_MATERIALS[key].icon}</div>
                    <div>{SKILL_MATERIALS[key].name}</div>
                    <div className="text-xs text-gray-500">Owned: {skillInventory[key]}</div>
                  </button>
                ))}
              </div>
            ) : dungeonType === 'ascension' ? (
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(UNCAP_MATERIALS) as UncapMaterialType[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedUncapMaterial(key)}
                    className={`rounded-lg p-3 border text-sm font-semibold transition-all ${
                      selectedUncapMaterial === key
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-xl">{UNCAP_MATERIALS[key].icon}</div>
                    <div>{UNCAP_MATERIALS[key].name}</div>
                    <div className="text-xs text-gray-500">Owned: {uncapInventory[key]}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedSharedReward('points')}
                  className={`rounded-lg p-4 border text-sm font-semibold transition-all ${
                    selectedSharedReward === 'points'
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xl">⭐</div>
                  <div>Points</div>
                  <div className="text-xs text-gray-500">Used for upgrades</div>
                </button>
                <button
                  onClick={() => setSelectedSharedReward('books')}
                  className={`rounded-lg p-4 border text-sm font-semibold transition-all ${
                    selectedSharedReward === 'books'
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xl">📘</div>
                  <div>EXP Books</div>
                  <div className="text-xs text-gray-500">Tier scales with difficulty</div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={startBattle}
            disabled={loading}
            className="w-full py-4 rounded-lg font-bold text-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Loading Questions...' : 'Start Dungeon Run'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DungeonModal;
