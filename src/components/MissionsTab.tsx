import { useState, useEffect } from 'react';
import { Mission } from '@/types/mission.types';
import { generateDailyMissions, generateWeeklyMissions, generateAchievements, loadUserProgress, claimMission, claimAllMissions } from '@/services/missions.service';

interface MissionsTabProps {
  onClose: () => void;
}

type TabType = 'daily' | 'weekly' | 'achievements';
type MissionCategory = 'daily' | 'weekly' | 'achievement';

const MissionsTab: React.FC<MissionsTabProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<Mission[]>([]);
  const [achievements, setAchievements] = useState<Mission[]>([]);
  const [userProgress, setUserProgress] = useState(loadUserProgress());

  const refreshMissions = () => {
    try {
      const progress = loadUserProgress();
      setUserProgress(progress);
      setDailyMissions(generateDailyMissions(progress));
      setWeeklyMissions(generateWeeklyMissions(progress));
      setAchievements(generateAchievements(progress));
    } catch (error) {
      console.error('Error loading missions:', error);
    }
  };

  useEffect(() => {
    refreshMissions();
  }, []);

  const handleClaimMission = (missionId: string) => {
    claimMission(missionId);
    refreshMissions();
  };

  const handleClaimAll = () => {
    const category: MissionCategory = activeTab === 'achievements' ? 'achievement' : activeTab;
    claimAllMissions(category);
    refreshMissions();
  };

  const getCurrentMissions = () => {
    switch (activeTab) {
      case 'daily':
        return dailyMissions;
      case 'weekly':
        return weeklyMissions;
      case 'achievements':
        return achievements;
    }
  };

  const missions = getCurrentMissions();

  const getProgressPercentage = (mission: Mission) => {
    return Math.min((mission.progress / mission.target) * 100, 100);
  };

  const completedMissionsCount = missions?.filter(m => m.completed).length || 0;
  const claimableMissionsCount = missions?.filter(m => m.completed && !m.claimed).length || 0;
  const totalRewards = missions?.reduce((sum, m) => sum + m.reward, 0) || 0;
  const earnedRewards = missions?.filter(m => m.completed).reduce((sum, m) => sum + m.reward, 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">🎯 Missions & Achievements</h2>
              <p className="text-primary-100">Complete challenges to earn rewards!</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'daily'
                  ? 'bg-white text-primary-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              📅 Daily
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'weekly'
                  ? 'bg-white text-primary-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              📆 Weekly
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'achievements'
                  ? 'bg-white text-primary-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              🏆 Achievements
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-2xl font-bold">{userProgress.totalPoints}</div>
              <div className="text-sm text-primary-100">Total Points</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-2xl font-bold">{completedMissionsCount}/{missions?.length || 0}</div>
              <div className="text-sm text-primary-100">Completed</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-2xl font-bold">{userProgress.dailyStreak} 🔥</div>
              <div className="text-sm text-primary-100">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Missions List */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {missions && missions.length > 0 ? (
              missions.map((mission) => (
                <div
                  key={mission.id}
                  className={`border-2 rounded-xl p-5 transition-all duration-300 ${
                    mission.completed
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-4xl">{mission.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-800">{mission.title}</h3>
                          {mission.completed && (
                            <span className="text-green-500 text-xl">✓</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{mission.description}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-primary-600">+{mission.reward}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold">
                        {mission.progress}/{mission.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          mission.completed ? 'bg-green-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${getProgressPercentage(mission)}%` }}
                      />
                    </div>
                  </div>

                  {/* Claim Button */}
                  {mission.completed && !mission.claimed && (
                    <button
                      onClick={() => handleClaimMission(mission.id)}
                      className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Claim +{mission.reward} points
                    </button>
                  )}
                  {mission.claimed && (
                    <div className="text-center py-2 px-4 bg-gray-100 rounded-lg text-gray-600 text-sm font-semibold">
                      ✓ Claimed
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No missions to display</p>
              </div>
            )}

            {/* Claim All Button */}
            {claimableMissionsCount > 0 && (
              <button
                onClick={handleClaimAll}
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ✨ Claim All ({claimableMissionsCount}) - +{missions?.filter(m => m.completed && !m.claimed).reduce((sum, m) => sum + m.reward, 0) || 0} points
              </button>
            )}

            {/* Summary */}
            <div className="mt-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-5 border border-primary-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold text-gray-800">
                    {activeTab === 'daily' ? 'Daily' : activeTab === 'weekly' ? 'Weekly' : 'Lifetime'} Progress
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Earned {earnedRewards} of {totalRewards} points
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary-600">
                  {totalRewards > 0 ? Math.round((earnedRewards / totalRewards) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionsTab;
