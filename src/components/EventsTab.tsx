import { useState, useEffect } from 'react';
import { getDailyHardQuestion, completeDailyQuestion, claimDailyQuestionReward, isNewDay } from '@/services/events.service';
import MathRenderer from './MathRenderer';

interface EventsTabProps {
  onClose: () => void;
}

const EventsTab: React.FC<EventsTabProps> = ({ onClose }) => {
  const [question, setQuestion] = useState(getDailyHardQuestion());
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    // Update time until reset every second
    const interval = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);

      // Check if new day started
      if (isNewDay()) {
        setQuestion(getDailyHardQuestion());
        setSelectedAnswer('');
        setShowResult(false);
        setIsCorrect(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (!selectedAnswer || question.completed) return;

    const correct = completeDailyQuestion(selectedAnswer);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setQuestion(getDailyHardQuestion());
    }
  };

  const handleClaim = () => {
    const claimed = claimDailyQuestionReward();
    if (claimed) {
      setQuestion(getDailyHardQuestion());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-purple-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="relative flex justify-between items-start">
            <div>
              <h2 className="text-5xl font-bold mb-3 drop-shadow-lg">🎪 Daily Events</h2>
              <p className="text-white/90 text-xl">Complete special challenges for premium rewards!</p>
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
          {/* Daily Hard Question Event */}
          <div className="backdrop-blur-xl bg-purple-500/20 rounded-3xl p-8 border border-purple-400/30 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <span className="text-4xl">🧠</span>
                  <span>Daily Hard Question</span>
                </h3>
                <p className="text-purple-200 text-lg">Challenge yourself with a difficult problem!</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 rounded-2xl px-5 py-3 text-center border border-white/20">
                <div className="text-sm text-white/70 mb-1">Resets in</div>
                <div className="text-2xl font-bold text-yellow-300">{timeUntilReset}</div>
              </div>
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="backdrop-blur-md bg-yellow-500/20 rounded-2xl p-5 border border-yellow-400/30 text-center">
                <div className="text-3xl mb-2">💎</div>
                <div className="text-3xl font-bold text-yellow-300">+100</div>
                <div className="text-sm text-yellow-200">Primogems</div>
              </div>
              <div className="backdrop-blur-md bg-yellow-500/20 rounded-2xl p-5 border border-yellow-400/30 text-center">
                <div className="text-3xl mb-2">💛</div>
                <div className="text-3xl font-bold text-yellow-300">+500</div>
                <div className="text-sm text-yellow-200">Free Gems</div>
              </div>
            </div>

            {/* Question */}
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 mb-6 border border-white/20">
              <div className="text-2xl font-semibold text-white mb-6">
                <MathRenderer content={question.question} />
              </div>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !question.completed && setSelectedAnswer(option)}
                    disabled={question.completed}
                    className={`w-full p-5 rounded-xl text-left text-lg font-medium transition-all border-2 ${
                      selectedAnswer === option
                        ? 'bg-purple-500/40 border-purple-400 text-white scale-105'
                        : question.completed
                        ? option === question.answer
                          ? 'bg-green-500/30 border-green-400 text-white'
                          : 'bg-white/5 border-white/10 text-white/50 cursor-not-allowed'
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40 hover:scale-102'
                    }`}
                  >
                    <MathRenderer content={option} />
                  </button>
                ))}
              </div>
            </div>

            {/* Result Message */}
            {showResult && (
              <div className={`backdrop-blur-md rounded-2xl p-6 mb-6 border-2 ${
                isCorrect
                  ? 'bg-green-500/30 border-green-400'
                  : 'bg-red-500/30 border-red-400'
              }`}>
                <div className="text-2xl font-bold text-white mb-2">
                  {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                </div>
                <div className="text-white/90 text-lg mb-3">
                  <MathRenderer content={question.explanation || ''} />
                </div>
                {!isCorrect && (
                  <div className="text-yellow-300 font-semibold">
                    Correct answer: <MathRenderer content={question.answer} />
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!question.completed ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className={`flex-1 py-5 px-8 rounded-2xl font-bold text-xl transition-all ${
                    selectedAnswer
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105'
                      : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Submit Answer
                </button>
              ) : question.claimed ? (
                <div className="flex-1 backdrop-blur-md bg-green-500/30 border-2 border-green-400 text-white py-5 px-8 rounded-2xl text-center font-bold text-xl">
                  ✅ Completed & Claimed!
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transition-all"
                >
                  🎁 Claim Rewards
                </button>
              )}
            </div>

            {/* Status */}
            <div className="mt-6 text-center">
              {question.completed ? (
                <div className="text-green-300 text-lg font-semibold">
                  🏆 Today's challenge completed!
                </div>
              ) : (
                <div className="text-purple-300 text-lg">
                  💪 This is a hard question - pen and paper recommended!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsTab;
