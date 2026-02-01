import { useMemo, useState } from 'react';
import { addBooks, addGamePointsAsGems, addPrimogems, addSkillMaterials, addUncapMaterial } from '@/services/character.service';
import { getDailyWheelState, recordDailyWheelSpin } from '@/services/dailyWheel.service';

interface DailyWheelModalProps {
  onClose: () => void;
  onComplete?: () => void;
}

type RewardType = 'gems' | 'primogems' | 'books' | 'skill' | 'uncap' | 'points';

interface WheelReward {
  id: string;
  label: string;
  type: RewardType;
  weight: number;
  apply: () => string;
}

interface WheelSegment extends WheelReward {
  start: number;
  end: number;
  color: string;
}

const DailyWheelModal: React.FC<DailyWheelModalProps> = ({ onClose, onComplete }) => {
  const wheelState = useMemo(() => getDailyWheelState(), []);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [landedId, setLandedId] = useState<string | null>(null);

  const rewards: WheelReward[] = useMemo(() => [
    {
      id: 'points_100',
      label: '⭐ 100 Points',
      type: 'points',
      weight: 25,
      apply: () => {
        addGamePointsAsGems(100);
        return 'You gained 100 Points (converted to Gems)!';
      },
    },
    {
      id: 'gems_50',
      label: '💛 50 Gems',
      type: 'gems',
      weight: 25,
      apply: () => {
        addGamePointsAsGems(50);
        return 'You gained 50 Gems!';
      },
    },
    {
      id: 'books_t1',
      label: '📘 2 Basic Books',
      type: 'books',
      weight: 18,
      apply: () => {
        addBooks(1, 2);
        return 'You gained 2 Basic Training Books!';
      },
    },
    {
      id: 'skill_spark',
      label: '✨ 3 Skill Sparks',
      type: 'skill',
      weight: 15,
      apply: () => {
        addSkillMaterials({ spark: 3 });
        return 'You gained 3 Skill Sparks!';
      },
    },
    {
      id: 'uncap_crystal',
      label: '💎 2 Magic Crystals',
      type: 'uncap',
      weight: 12,
      apply: () => {
        addUncapMaterial('crystal', 2);
        return 'You gained 2 Magic Crystals!';
      },
    },
    {
      id: 'jackpot',
      label: '💜 25 Primogems (Jackpot)',
      type: 'primogems',
      weight: 5,
      apply: () => {
        addPrimogems(25);
        return 'JACKPOT! You gained 25 Primogems!';
      },
    },
  ], []);

  const segments: WheelSegment[] = useMemo(() => {
    const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
    let cursor = 0;
    const colors = ['#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#F97316', '#FACC15'];
    return rewards.map((reward, index) => {
      const start = cursor / totalWeight;
      const end = (cursor + reward.weight) / totalWeight;
      cursor += reward.weight;
      return {
        ...reward,
        start,
        end,
        color: colors[index % colors.length],
      };
    });
  }, [rewards]);

  const pickReward = (): WheelSegment => {
    const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const segment of segments) {
      roll -= segment.weight;
      if (roll <= 0) return segment;
    }
    return segments[0];
  };

  const handleSpin = () => {
    if (!wheelState.isAvailable || isSpinning) return;
    setIsSpinning(true);

    const segment = pickReward();
    const angleWithin = segment.start + Math.random() * (segment.end - segment.start);
    const targetDeg = angleWithin * 360;
    const spins = 4;
    const nextRotation = rotation + spins * 360 + (360 - targetDeg);
    setRotation(nextRotation);
    setLandedId(null);

    setTimeout(() => {
      const message = segment.apply();
      setRewardMessage(message);
      setLandedId(segment.id);
      recordDailyWheelSpin();
      setIsSpinning(false);
      if (onComplete) onComplete();
    }, 3200);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">🎡 Daily Reward Wheel</h2>
            <p className="text-yellow-100 text-sm">Spin once per day for free rewards.</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!wheelState.isAvailable && (
            <div className="text-center text-sm text-gray-600">
              Next spin available in about {wheelState.hoursRemaining} hour{wheelState.hoursRemaining === 1 ? '' : 's'}.
            </div>
          )}

          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="relative">
                <div
                  className="w-64 h-64 rounded-full border-8 border-yellow-200 shadow-lg transition-transform duration-[3000ms] ease-out"
                  style={{
                    background: `conic-gradient(${segments
                      .map((segment) => `${segment.color} ${segment.start * 360}deg ${segment.end * 360}deg`)
                      .join(', ')})`,
                    transform: `rotate(${rotation}deg)`,
                  }}
                />
                {landedId && (() => {
                  const landedSegment = segments.find((segment) => segment.id === landedId);
                  if (!landedSegment) return null;
                  const startAngle = landedSegment.start * 360;
                  const endAngle = landedSegment.end * 360;
                  const startRad = (startAngle - 90) * (Math.PI / 180);
                  const endRad = (endAngle - 90) * (Math.PI / 180);
                  const x1 = 50 + 50 * Math.cos(startRad);
                  const y1 = 50 + 50 * Math.sin(startRad);
                  const x2 = 50 + 50 * Math.cos(endRad);
                  const y2 = 50 + 50 * Math.sin(endRad);
                  return (
                    <div
                      className="absolute inset-0 rounded-full ring-4 ring-emerald-400 pointer-events-none"
                      style={{
                        clipPath: `polygon(50% 50%, ${x1}% ${y1}%, ${x2}% ${y2}%)`,
                        transform: `rotate(${rotation}deg)`,
                      }}
                    />
                  );
                })()}
              </div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="w-0 h-0 border-l-8 border-r-8 border-b-[16px] border-l-transparent border-r-transparent border-b-red-500" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white border-4 border-yellow-300 shadow" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              {segments.map((segment) => {
                const percent = Math.round((segment.weight / rewards.reduce((sum, reward) => sum + reward.weight, 0)) * 100);
                return (
                  <div key={segment.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm font-semibold text-yellow-900 text-center">
                    <div>{segment.label}</div>
                    <div className="text-xs text-yellow-700 mt-1">{percent}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {rewardMessage && (
            <div className="text-center bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700 font-semibold">
              {rewardMessage}
            </div>
          )}

          <button
            onClick={handleSpin}
            disabled={!wheelState.isAvailable || isSpinning}
            className="w-full py-4 rounded-lg font-bold text-lg bg-amber-500 text-white hover:bg-amber-600 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyWheelModal;
