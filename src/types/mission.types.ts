export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  target: number;
  progress: number;
  reward: number; // points
  completed: boolean;
  claimed: boolean;
  icon: string;
  category: 'daily' | 'weekly' | 'achievement';
}

export enum MissionType {
  COMPLETE_GAMES = 'complete_games',
  ANSWER_CORRECT = 'answer_correct',
  PERFECT_SCORE = 'perfect_score',
  SPEED_RUN = 'speed_run',
  DIFFICULTY_EASY = 'difficulty_easy',
  DIFFICULTY_MEDIUM = 'difficulty_medium',
  DIFFICULTY_HARD = 'difficulty_hard',
  STREAK = 'streak',
  TOTAL_POINTS = 'total_points',
  TOTAL_GAMES = 'total_games',
  TOTAL_CORRECT = 'total_correct',
  SPEED_DEMON = 'speed_demon',
  MARATHON = 'marathon',
  VARIETY = 'variety',
}

export interface UserProgress {
  totalPoints: number;
  dailyStreak: number;
  lastPlayedDate: string;
  lastWeekReset: string;
  completedDailyMissions: string[];
  completedWeeklyMissions: string[];
  unlockedAchievements: string[];
  claimedDailyMissions: string[];
  claimedWeeklyMissions: string[];
  claimedAchievements: string[];
  stats: {
    // Daily stats (reset daily)
    daily: {
      gamesPlayed: number;
      correctAnswers: number;
      perfectScores: number;
      easyGamesCompleted: number;
      mediumGamesCompleted: number;
      hardGamesCompleted: number;
      fastestGame: number;
    };
    // Weekly stats (reset weekly)
    weekly: {
      gamesPlayed: number;
      correctAnswers: number;
      perfectScores: number;
      totalPlayTime: number;
      difficultiesPlayed: Set<string>;
    };
    // Lifetime stats (never reset)
    lifetime: {
      totalGames: number;
      totalCorrect: number;
      totalPerfectScores: number;
      totalPlayTime: number;
      fastestGame: number;
      longestStreak: number;
    };
  };
}
