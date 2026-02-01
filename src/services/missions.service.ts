import { Mission, MissionType, UserProgress } from '@/types/mission.types';

const STORAGE_KEY = 'math_quiz_progress';

// Get today's date string (YYYY-MM-DD)
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Get current week string (YYYY-Www)
const getCurrentWeek = (): string => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const week = Math.floor(diff / oneWeek);
  return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
};

// Load user progress from localStorage
export const loadUserProgress = (): UserProgress => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Convert Set back from array
    if (parsed.stats?.weekly?.difficultiesPlayed && Array.isArray(parsed.stats.weekly.difficultiesPlayed)) {
      parsed.stats.weekly.difficultiesPlayed = new Set(parsed.stats.weekly.difficultiesPlayed);
    }
    return parsed;
  }
  
  return {
    totalPoints: 0,
    dailyStreak: 0,
    lastPlayedDate: '',
    lastWeekReset: '',
    completedDailyMissions: [],
    completedWeeklyMissions: [],
    unlockedAchievements: [],
    claimedDailyMissions: [],
    claimedWeeklyMissions: [],
    claimedAchievements: [],
    stats: {
      daily: {
        gamesPlayed: 0,
        correctAnswers: 0,
        perfectScores: 0,
        easyGamesCompleted: 0,
        mediumGamesCompleted: 0,
        hardGamesCompleted: 0,
        fastestGame: Infinity,
      },
      weekly: {
        gamesPlayed: 0,
        correctAnswers: 0,
        perfectScores: 0,
        totalPlayTime: 0,
        difficultiesPlayed: new Set(),
      },
      lifetime: {
        totalGames: 0,
        totalCorrect: 0,
        totalPerfectScores: 0,
        totalPlayTime: 0,
        fastestGame: Infinity,
        longestStreak: 0,
      },
    },
  };
};

// Save user progress to localStorage
export const saveUserProgress = (progress: UserProgress): void => {
  // Convert Set to array for storage
  const toStore = {
    ...progress,
    stats: {
      ...progress.stats,
      weekly: {
        ...progress.stats.weekly,
        difficultiesPlayed: Array.from(progress.stats.weekly.difficultiesPlayed),
      },
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
};

export const addPoints = (amount: number): UserProgress => {
  const progress = loadUserProgress();
  progress.totalPoints += amount;
  saveUserProgress(progress);
  return progress;
};

// Generate daily missions
export const generateDailyMissions = (progress: UserProgress): Mission[] => {
  const missions: Mission[] = [
    {
      id: 'daily_1',
      title: 'Quick Learner',
      description: 'Complete 3 games today',
      type: MissionType.COMPLETE_GAMES,
      target: 3,
      progress: Math.min(progress.stats.daily.gamesPlayed, 3),
      reward: 50,
      completed: progress.completedDailyMissions.includes('daily_1'),
      claimed: progress.claimedDailyMissions.includes('daily_1'),
      icon: '🎯',
      category: 'daily',
    },
    {
      id: 'daily_2',
      title: 'Accuracy Expert',
      description: 'Answer 20 questions correctly',
      type: MissionType.ANSWER_CORRECT,
      target: 20,
      progress: Math.min(progress.stats.daily.correctAnswers, 20),
      reward: 75,
      completed: progress.completedDailyMissions.includes('daily_2'),
      claimed: progress.claimedDailyMissions.includes('daily_2'),
      icon: '✅',
      category: 'daily',
    },
    {
      id: 'daily_3',
      title: 'Perfectionist',
      description: 'Get a perfect score (100%)',
      type: MissionType.PERFECT_SCORE,
      target: 1,
      progress: Math.min(progress.stats.daily.perfectScores, 1),
      reward: 100,
      completed: progress.completedDailyMissions.includes('daily_3'),
      claimed: progress.claimedDailyMissions.includes('daily_3'),
      icon: '⭐',
      category: 'daily',
    },
    {
      id: 'daily_4',
      title: 'Easy Mode Master',
      description: 'Complete 2 Easy games',
      type: MissionType.DIFFICULTY_EASY,
      target: 2,
      progress: Math.min(progress.stats.daily.easyGamesCompleted, 2),
      reward: 30,
      completed: progress.completedDailyMissions.includes('daily_4'),
      claimed: progress.claimedDailyMissions.includes('daily_4'),
      icon: '🟢',
      category: 'daily',
    },
    {
      id: 'daily_5',
      title: 'Medium Challenge',
      description: 'Complete 2 Medium games',
      type: MissionType.DIFFICULTY_MEDIUM,
      target: 2,
      progress: Math.min(progress.stats.daily.mediumGamesCompleted, 2),
      reward: 50,
      claimed: progress.claimedDailyMissions.includes('daily_5'),
      completed: progress.completedDailyMissions.includes('daily_5'),
      icon: '🟡',
      category: 'daily',
    },
    {
      id: 'daily_6',
      title: 'Hard Mode Hero',
      description: 'Complete 1 Hard game',
      type: MissionType.DIFFICULTY_HARD,
      target: 1,
      progress: Math.min(progress.stats.daily.hardGamesCompleted, 1),
      claimed: progress.claimedDailyMissions.includes('daily_6'),
      reward: 75,
      completed: progress.completedDailyMissions.includes('daily_6'),
      icon: '🔴',
      category: 'daily',
    },
    {
      id: 'daily_7',
      title: 'Speed Runner',
      description: 'Complete a game in under 60 seconds',
      type: MissionType.SPEED_RUN,
      target: 1,
      progress: progress.stats.daily.fastestGame < 60 ? 1 : 0,
      claimed: progress.claimedDailyMissions.includes('daily_7'),
      reward: 80,
      completed: progress.completedDailyMissions.includes('daily_7'),
      icon: '⚡',
      category: 'daily',
    },
  ];

  return missions;
};

// Generate weekly missions
export const generateWeeklyMissions = (progress: UserProgress): Mission[] => {
  const missions: Mission[] = [
    {
      id: 'weekly_1',
      title: 'Weekly Warrior',
      description: 'Complete 20 games this week',
      type: MissionType.COMPLETE_GAMES,
      target: 20,
      progress: Math.min(progress.stats.weekly.gamesPlayed, 20),
      claimed: progress.claimedWeeklyMissions.includes('weekly_1'),
      reward: 200,
      completed: progress.completedWeeklyMissions.includes('weekly_1'),
      icon: '💪',
      category: 'weekly',
    },
    {
      id: 'weekly_2',
      title: 'Accuracy Champion',
      description: 'Answer 100 questions correctly this week',
      type: MissionType.ANSWER_CORRECT,
      target: 100,
      progress: Math.min(progress.stats.weekly.correctAnswers, 100),
      claimed: progress.claimedWeeklyMissions.includes('weekly_2'),
      reward: 250,
      completed: progress.completedWeeklyMissions.includes('weekly_2'),
      icon: '🎖️',
      category: 'weekly',
    },
    {
      id: 'weekly_3',
      title: 'Perfect Week',
      description: 'Get 5 perfect scores this week',
      type: MissionType.PERFECT_SCORE,
      target: 5,
      progress: Math.min(progress.stats.weekly.perfectScores, 5),
      claimed: progress.claimedWeeklyMissions.includes('weekly_3'),
      reward: 300,
      completed: progress.completedWeeklyMissions.includes('weekly_3'),
      icon: '🏆',
      category: 'weekly',
    },
    {
      id: 'weekly_4',
      title: 'Marathon Runner',
      description: 'Play for 1 hour total this week',
      type: MissionType.MARATHON,
      target: 3600,
      progress: Math.min(progress.stats.weekly.totalPlayTime, 3600),
      claimed: progress.claimedWeeklyMissions.includes('weekly_4'),
      reward: 150,
      completed: progress.completedWeeklyMissions.includes('weekly_4'),
      icon: '🏃',
      category: 'weekly',
    },
    {
      id: 'weekly_5',
      title: 'Variety Master',
      description: 'Play all 3 difficulty levels this week',
      type: MissionType.VARIETY,
      target: 3,
      progress: progress.stats.weekly.difficultiesPlayed.size,
      claimed: progress.claimedWeeklyMissions.includes('weekly_5'),
      reward: 175,
      completed: progress.completedWeeklyMissions.includes('weekly_5'),
      icon: '🌈',
      category: 'weekly',
    },
  ];

  return missions;
};

// Generate achievements
export const generateAchievements = (progress: UserProgress): Mission[] => {
  const achievements: Mission[] = [
    {
      id: 'achieve_1',
      title: 'First Steps',
      description: 'Complete your first game',
      type: MissionType.TOTAL_GAMES,
      target: 1,
      progress: Math.min(progress.stats.lifetime.totalGames, 1),
      reward: 50,
      completed: progress.unlockedAchievements.includes('achieve_1'),
      claimed: progress.claimedAchievements.includes('achieve_1'),
      icon: '🎮',
      category: 'achievement',
    },
    {
      id: 'achieve_2',
      title: 'Getting Started',
      description: 'Complete 10 games',
      type: MissionType.TOTAL_GAMES,
      target: 10,
      progress: Math.min(progress.stats.lifetime.totalGames, 10),
      reward: 100,
      completed: progress.unlockedAchievements.includes('achieve_2'),
      claimed: progress.claimedAchievements.includes('achieve_2'),
      icon: '🎲',
      category: 'achievement',
    },
    {
      id: 'achieve_3',
      title: 'Veteran Player',
      description: 'Complete 50 games',
      type: MissionType.TOTAL_GAMES,
      target: 50,
      progress: Math.min(progress.stats.lifetime.totalGames, 50),
      reward: 250,
      completed: progress.unlockedAchievements.includes('achieve_3'),
      claimed: progress.claimedAchievements.includes('achieve_3'),
      icon: '🎪',
      category: 'achievement',
    },
    {
      id: 'achieve_4',
      title: 'Math Master',
      description: 'Complete 100 games',
      type: MissionType.TOTAL_GAMES,
      target: 100,
      progress: Math.min(progress.stats.lifetime.totalGames, 100),
      reward: 500,
      completed: progress.unlockedAchievements.includes('achieve_4'),
      claimed: progress.claimedAchievements.includes('achieve_4'),
      icon: '👑',
      category: 'achievement',
    },
    {
      id: 'achieve_5',
      title: 'Correct Answers: 100',
      description: 'Answer 100 questions correctly (lifetime)',
      type: MissionType.TOTAL_CORRECT,
      target: 100,
      progress: Math.min(progress.stats.lifetime.totalCorrect, 100),
      reward: 150,
      completed: progress.unlockedAchievements.includes('achieve_5'),
      claimed: progress.claimedAchievements.includes('achieve_5'),
      icon: '✨',
      category: 'achievement',
    },
    {
      id: 'achieve_6',
      title: 'Correct Answers: 500',
      description: 'Answer 500 questions correctly (lifetime)',
      type: MissionType.TOTAL_CORRECT,
      target: 500,
      progress: Math.min(progress.stats.lifetime.totalCorrect, 500),
      reward: 300,
      completed: progress.unlockedAchievements.includes('achieve_6'),
      claimed: progress.claimedAchievements.includes('achieve_6'),
      icon: '💎',
      category: 'achievement',
    },
    {
      id: 'achieve_7',
      title: 'Perfect Legend',
      description: 'Get 25 perfect scores (lifetime)',
      type: MissionType.PERFECT_SCORE,
      target: 25,
      progress: Math.min(progress.stats.lifetime.totalPerfectScores, 25),
      reward: 400,
      completed: progress.unlockedAchievements.includes('achieve_7'),
      claimed: progress.claimedAchievements.includes('achieve_7'),
      icon: '🌟',
      category: 'achievement',
    },
    {
      id: 'achieve_8',
      title: 'Lightning Fast',
      description: 'Complete a game in under 30 seconds',
      type: MissionType.SPEED_DEMON,
      target: 1,
      progress: progress.stats.lifetime.fastestGame < 30 ? 1 : 0,
      reward: 200,
      completed: progress.unlockedAchievements.includes('achieve_8'),
      claimed: progress.claimedAchievements.includes('achieve_8'),
      icon: '⚡',
      category: 'achievement',
    },
    {
      id: 'achieve_9',
      title: 'Dedicated',
      description: 'Maintain a 7-day streak',
      type: MissionType.STREAK,
      target: 7,
      progress: Math.min(progress.stats.lifetime.longestStreak, 7),
      reward: 250,
      completed: progress.unlockedAchievements.includes('achieve_9'),
      claimed: progress.claimedAchievements.includes('achieve_9'),
      icon: '🔥',
      category: 'achievement',
    },
    {
      id: 'achieve_10',
      title: 'Unstoppable',
      description: 'Maintain a 30-day streak',
      type: MissionType.STREAK,
      target: 30,
      progress: Math.min(progress.stats.lifetime.longestStreak, 30),
      reward: 1000,
      completed: progress.unlockedAchievements.includes('achieve_10'),
      claimed: progress.claimedAchievements.includes('achieve_10'),
      icon: '🏅',
      category: 'achievement',
    },
    {
      id: 'achieve_11',
      title: 'Point Collector',
      description: 'Earn 1000 total points',
      type: MissionType.TOTAL_POINTS,
      target: 1000,
      progress: Math.min(progress.totalPoints, 1000),
      reward: 100,
      completed: progress.unlockedAchievements.includes('achieve_11'),
      claimed: progress.claimedAchievements.includes('achieve_11'),
      icon: '💰',
      category: 'achievement',
    },
    {
      id: 'achieve_12',
      title: 'Point Hoarder',
      description: 'Earn 5000 total points',
      type: MissionType.TOTAL_POINTS,
      target: 5000,
      progress: Math.min(progress.totalPoints, 5000),
      reward: 500,
      completed: progress.unlockedAchievements.includes('achieve_12'),
      claimed: progress.claimedAchievements.includes('achieve_12'),
      icon: '🎁',
      category: 'achievement',
    },
  ];

  return achievements;
};

// Update mission progress based on game results
export const updateMissionProgress = (
  difficulty: string,
  correctAnswers: number,
  score: number,
  gameTime: number
): UserProgress => {
  const progress = loadUserProgress();
  const today = getTodayDate();
  const currentWeek = getCurrentWeek();
  const isNewDay = progress.lastPlayedDate !== today;
  const isNewWeek = progress.lastWeekReset !== currentWeek;

  // Reset daily stats if new day
  if (isNewDay) {
    const yesterday = new Date(new Date(progress.lastPlayedDate).getTime());
    const todayDate = new Date(today);
    const dayDiff = Math.floor((todayDate.getTime() - yesterday.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      progress.dailyStreak += 1;
    } else if (dayDiff > 1) {
      progress.dailyStreak = 1;
    }
    
    if (progress.dailyStreak > progress.stats.lifetime.longestStreak) {
      progress.stats.lifetime.longestStreak = progress.dailyStreak;
    }
    
    progress.lastPlayedDate = today;
    progress.completedDailyMissions = [];
    progress.claimedDailyMissions = [];
    progress.stats.daily = {
      gamesPlayed: 0,
      correctAnswers: 0,
      perfectScores: 0,
      easyGamesCompleted: 0,
      mediumGamesCompleted: 0,
      hardGamesCompleted: 0,
      fastestGame: Infinity,
    };
  }

  // Reset weekly stats if new week
  if (isNewWeek) {
    progress.lastWeekReset = currentWeek;
    progress.claimedWeeklyMissions = [];
    progress.completedWeeklyMissions = [];
    progress.stats.weekly = {
      gamesPlayed: 0,
      correctAnswers: 0,
      perfectScores: 0,
      totalPlayTime: 0,
      difficultiesPlayed: new Set(),
    };
  }

  // Update daily stats
  progress.stats.daily.gamesPlayed += 1;
  progress.stats.daily.correctAnswers += correctAnswers;
  if (score === 100) {
    progress.stats.daily.perfectScores += 1;
  }
  if (gameTime < progress.stats.daily.fastestGame) {
    progress.stats.daily.fastestGame = gameTime;
  }

  // Update weekly stats
  progress.stats.weekly.gamesPlayed += 1;
  progress.stats.weekly.correctAnswers += correctAnswers;
  if (score === 100) {
    progress.stats.weekly.perfectScores += 1;
  }
  progress.stats.weekly.totalPlayTime += gameTime;
  progress.stats.weekly.difficultiesPlayed.add(difficulty);

  // Update lifetime stats
  progress.stats.lifetime.totalGames += 1;
  progress.stats.lifetime.totalCorrect += correctAnswers;
  if (score === 100) {
    progress.stats.lifetime.totalPerfectScores += 1;
  }
  progress.stats.lifetime.totalPlayTime += gameTime;
  if (gameTime < progress.stats.lifetime.fastestGame) {
    progress.stats.lifetime.fastestGame = gameTime;
  }

  // Update difficulty-specific stats
  if (difficulty === 'easy') {
    progress.stats.daily.easyGamesCompleted += 1;
  } else if (difficulty === 'medium') {
    progress.stats.daily.mediumGamesCompleted += 1;
  } else if (difficulty === 'hard') {
    progress.stats.daily.hardGamesCompleted += 1;
  }

  // Check and complete daily missions
  const dailyMissions = generateDailyMissions(progress);
  dailyMissions.forEach(mission => {
    if (!mission.completed && mission.progress >= mission.target) {
      progress.completedDailyMissions.push(mission.id);
      progress.totalPoints += mission.reward;
    }
  });

  // Check and complete weekly missions
  const weeklyMissions = generateWeeklyMissions(progress);
  weeklyMissions.forEach(mission => {
    if (!mission.completed && mission.progress >= mission.target) {
      progress.completedWeeklyMissions.push(mission.id);
      progress.totalPoints += mission.reward;
    }
  });

  // Check and unlock achievements
  const achievements = generateAchievements(progress);
  achievements.forEach(achievement => {
    if (!achievement.completed && achievement.progress >= achievement.target) {
      progress.unlockedAchievements.push(achievement.id);
      progress.totalPoints += achievement.reward;
    }
  });

  saveUserProgress(progress);
  return progress;
};

// Claim a single mission
export const claimMission = (missionId: string): UserProgress => {
  const progress = loadUserProgress();
  
  if (missionId.startsWith('daily_') && !progress.claimedDailyMissions.includes(missionId)) {
    progress.claimedDailyMissions.push(missionId);
  } else if (missionId.startsWith('weekly_') && !progress.claimedWeeklyMissions.includes(missionId)) {
    progress.claimedWeeklyMissions.push(missionId);
  } else if (missionId.startsWith('achieve_') && !progress.claimedAchievements.includes(missionId)) {
    progress.claimedAchievements.push(missionId);
  }
  
  saveUserProgress(progress);
  return progress;
};

// Claim all completable missions in a category
export const claimAllMissions = (category: 'daily' | 'weekly' | 'achievement'): UserProgress => {
  const progress = loadUserProgress();
  let missions: Mission[] = [];
  
  if (category === 'daily') {
    missions = generateDailyMissions(progress);
    missions.forEach(mission => {
      if (mission.completed && !mission.claimed && !progress.claimedDailyMissions.includes(mission.id)) {
        progress.claimedDailyMissions.push(mission.id);
      }
    });
  } else if (category === 'weekly') {
    missions = generateWeeklyMissions(progress);
    missions.forEach(mission => {
      if (mission.completed && !mission.claimed && !progress.claimedWeeklyMissions.includes(mission.id)) {
        progress.claimedWeeklyMissions.push(mission.id);
      }
    });
  } else if (category === 'achievement') {
    missions = generateAchievements(progress);
    missions.forEach(mission => {
      if (mission.completed && !mission.claimed && !progress.claimedAchievements.includes(mission.id)) {
        progress.claimedAchievements.push(mission.id);
      }
    });
  }
  
  saveUserProgress(progress);
  return progress;
};
