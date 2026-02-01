import { useState } from 'react';
import { MathQuestion } from '@/types/game.types';
import MathRenderer from './MathRenderer';

interface DungeonQuestionDisplayProps {
  question: MathQuestion;
  onSelectOption: (answer: number) => void;
  onForfeit?: () => void;
}

const DungeonQuestionDisplay: React.FC<DungeonQuestionDisplayProps> = ({
  question,
  onSelectOption,
  onForfeit,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleSelectAnswer = (answer: number) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      onSelectOption(selectedAnswer);
      setSelectedAnswer(null);
    }
  };

  const handleForfeit = () => {
    if (onForfeit) {
      onForfeit();
    }
    setShowMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[50000]">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full relative z-10 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
              <h2 className="text-2xl font-bold">Menu</h2>
            </div>
            
            <div className="p-6 space-y-3">
              <button
                onClick={() => setShowMenu(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
              >
                Continue Battle
              </button>
              
              <button
                onClick={handleForfeit}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
              >
                🏳️ Forfeit Battle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
            {question.difficulty.toUpperCase()}
          </span>
          <button
            onClick={() => setShowMenu(true)}
            className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-all"
            title="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="text-3xl font-bold text-center text-gray-800">
          <MathRenderer content={question.question} />
        </div>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelectAnswer(option)}
            className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
              selectedAnswer === option
                ? 'bg-emerald-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
          selectedAnswer === null
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
        }`}
      >
        ✅ Submit Answer
      </button>
    </div>
  );
};

export default DungeonQuestionDisplay;
