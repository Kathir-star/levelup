// LevelUp Comprehensive Gamification & Winter Arc Engine

export const XP_CONFIG = {
  WORKOUT_COMPLETED: 100,
  SET_COMPLETED: 20,
  DAILY_QUEST_COMPLETED: 50,
  DAILY_ALL_QUESTS_BONUS: 150,
  CHALLENGE_MILESTONE: 150,
  CHALLENGE_COMPLETED: 1000,
  PERSONAL_RECORD: 150,
  STREAK_7_DAY: 500,
  STREAK_30_DAY: 1500,
  HABIT_LOGGED: 25,
  WATER_GOAL_MET: 50,
  STEP_GOAL_MET: 50,
  WINTER_ARC_STARTED: 200,
  WINTER_ARC_FINISHER: 2500,
} as const;

export interface LevelInfo {
  level: number;
  title: string;
  totalXp: number;
  currentLevelBaseXp: number;
  nextLevelBaseXp: number;
  xpInLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
}

export function calculateLevel(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  
  // Dynamic scaling: Level N requires approx 100 * N XP (Level 1: 0-100, Level 2: 100-250, etc.)
  let level = 1;
  let accumulated = 0;
  let nextThreshold = 100;

  while (safeXp >= accumulated + nextThreshold) {
    accumulated += nextThreshold;
    level++;
    nextThreshold = Math.floor(100 * Math.pow(level, 1.15));
  }

  const xpInLevel = safeXp - accumulated;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInLevel / nextThreshold) * 100)));

  let title = "BEGINNER";
  if (level >= 50) title = "IMMORTAL";
  else if (level >= 40) title = "MYTHIC";
  else if (level >= 30) title = "LEGEND";
  else if (level >= 25) title = "MASTER";
  else if (level >= 20) title = "ELITE";
  else if (level >= 15) title = "WARRIOR";
  else if (level >= 10) title = "CONSISTENT";
  else if (level >= 5) title = "GRINDER";
  else if (level >= 3) title = "ROOKIE";

  return {
    level,
    title,
    totalXp: safeXp,
    currentLevelBaseXp: accumulated,
    nextLevelBaseXp: accumulated + nextThreshold,
    xpInLevel,
    xpNeededForNext: nextThreshold,
    progressPercent,
  };
}

// ---------------- DAILY QUESTS ----------------
export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  type: 'workout' | 'water' | 'steps' | 'mobility' | 'mastery';
  icon: string;
}

export const DEFAULT_DAILY_QUEST_TEMPLATES: Omit<DailyQuest, 'completed'>[] = [
  {
    id: 'quest_workout',
    title: 'Complete Workout',
    description: 'Crush today’s scheduled training session or home workout',
    xpReward: XP_CONFIG.WORKOUT_COMPLETED,
    type: 'workout',
    icon: '🏋️'
  },
  {
    id: 'quest_water',
    title: 'Hydration Target',
    description: 'Drink at least 2.0L (8 glasses) of clean water',
    xpReward: XP_CONFIG.WATER_GOAL_MET,
    type: 'water',
    icon: '💧'
  },
  {
    id: 'quest_steps',
    title: 'Active Step Goal',
    description: 'Log or accumulate 6,000+ daily steps',
    xpReward: XP_CONFIG.STEP_GOAL_MET,
    type: 'steps',
    icon: '👟'
  },
  {
    id: 'quest_mobility',
    title: '10-Min Mobility / Stretch',
    description: 'Perform active stretching, foam rolling, or posture work',
    xpReward: XP_CONFIG.DAILY_QUEST_COMPLETED,
    type: 'mobility',
    icon: '🧘'
  },
  {
    id: 'quest_mastery',
    title: 'Mind Mastery & Focus',
    description: 'Complete box breathing exercise or avoid doomscrolling',
    xpReward: XP_CONFIG.HABIT_LOGGED,
    type: 'mastery',
    icon: '🛡️'
  }
];

export function getDailyQuests(dateStr: string, completedIds: string[] = []): DailyQuest[] {
  return DEFAULT_DAILY_QUEST_TEMPLATES.map(template => ({
    ...template,
    completed: completedIds.includes(template.id)
  }));
}

// ---------------- WINTER ARC SYSTEM ----------------
export interface WinterArcPath {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  accentBg: string;
  recommendedFocus: string;
  recommendedFrequency: string;
}

export const WINTER_ARC_PATHS: WinterArcPath[] = [
  {
    id: 'STRENGTH',
    title: 'STRENGTH ARC',
    tagline: 'Heavy Iron & Raw Power',
    description: 'Master heavy compound lifts (Squat, Bench, Deadlift, OHP) with progressive overload and power PR breakthroughs.',
    icon: '🏋️',
    color: '#ef4444',
    accentBg: 'rgba(239, 68, 68, 0.15)',
    recommendedFocus: 'Push / Pull / Legs with heavy 4-6 rep strength focus',
    recommendedFrequency: '4-5 days / week'
  },
  {
    id: 'MUSCLE',
    title: 'MUSCLE BUILD ARC',
    tagline: 'Aesthetic Hypertrophy & Density',
    description: 'Target optimal muscle hypertrophy with high time-under-tension, pump volume, and balanced muscular symmetry.',
    icon: '💪',
    color: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.15)',
    recommendedFocus: 'Upper / Lower or Muscle Group Isolation (8-12 rep range)',
    recommendedFrequency: '5 days / week'
  },
  {
    id: 'FAT_LOSS',
    title: 'FAT LOSS ARC',
    tagline: 'Metabolic Conditioning & Lean Shred',
    description: 'Sustain a disciplined caloric deficit, metabolic conditioning, and high-intensity resistance training to burn fat while preserving muscle.',
    icon: '🔥',
    color: '#ec4899',
    accentBg: 'rgba(236, 72, 153, 0.15)',
    recommendedFocus: 'Full Body Circuits, HIIT finish & daily step accumulation',
    recommendedFrequency: '4-6 days / week'
  },
  {
    id: 'BEGINNER',
    title: 'BEGINNER ARC',
    tagline: 'Foundation, Form & Habit Mastery',
    description: 'Build indestructible exercise habits, learn pristine movement mechanics, and establish lifelong gym confidence without burnout.',
    icon: '🔰',
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.15)',
    recommendedFocus: 'Full Body Fundamentals (3 days/week with form focus)',
    recommendedFrequency: '3-4 days / week'
  },
  {
    id: 'ATHLETIC',
    title: 'ATHLETIC ARC',
    tagline: 'Explosiveness, Agility & Speed',
    description: 'Develop functional kinetic chain power, jumping capability, core rotation, and unmatched movement fluency.',
    icon: '⚡',
    color: '#06b6d4',
    accentBg: 'rgba(6, 182, 212, 0.15)',
    recommendedFocus: 'Plyometrics, compound acceleration, and core stability',
    recommendedFrequency: '4 days / week'
  },
  {
    id: 'ENDURANCE',
    title: 'ENDURANCE ARC',
    tagline: 'Stamina, VO2 Max & Engine Building',
    description: 'Elevate cardiovascular threshold, running/rowing pace, and muscular stamina for unstoppable lung capacity.',
    icon: '🏃',
    color: '#3b82f6',
    accentBg: 'rgba(59, 130, 246, 0.15)',
    recommendedFocus: 'LISS tempo runs, interval pacing, and high-rep conditioning',
    recommendedFrequency: '4-5 days / week'
  },
  {
    id: 'CONSISTENCY',
    title: 'CONSISTENCY ARC',
    tagline: 'Zero Excuses & Relentless Discipline',
    description: 'Eliminate zero days. Focus entirely on showing up every single day for body and mind, no matter how busy life gets.',
    icon: '🛡️',
    color: '#8b5cf6',
    accentBg: 'rgba(139, 92, 246, 0.15)',
    recommendedFocus: 'Daily movement: alternating lifting, active walks, and recovery',
    recommendedFrequency: 'Daily (7 days / week)'
  },
  {
    id: 'HOME',
    title: 'HOME FITNESS ARC',
    tagline: 'Calisthenics & Zero Equipment',
    description: 'Achieve extraordinary fitness anywhere using bodyweight progressions, push-up variations, pull-ups, squats, and core circuits.',
    icon: '🏠',
    color: '#14b8a6',
    accentBg: 'rgba(20, 184, 166, 0.15)',
    recommendedFocus: 'Calisthenics progression, tempo control, and EMOM circuits',
    recommendedFrequency: '4-5 days / week'
  }
];

export interface WinterArcState {
  isActive: boolean;
  startDate: string; // ISO format e.g. "2026-09-08"
  targetEndDate: string; // "YYYY-01-31"
  selectedPathId: string;
  completedDays: string[]; // List of YYYY-MM-DD dates with logged effort
  activeChallengeIds: string[];
  completedChallengeIds: string[];
  totalXpEarned: number;
}

export function getNextWinterArcEndDate(now: Date = new Date()): string {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 is Jan)

  // If we are currently in January (month 0), target is Jan 31 of current year.
  // Otherwise, the upcoming Winter Arc ends Jan 31 of next year.
  const targetYear = currentMonth === 0 ? currentYear : currentYear + 1;
  return `${targetYear}-01-31`;
}

export function calculateWinterArcProgress(arcState: WinterArcState | null): {
  isStarted: boolean;
  currentDay: number;
  totalDays: number;
  daysCompleted: number;
  daysRemaining: number;
  consistencyPercent: number;
  progressPercent: number;
  endDateDisplay: string;
  path: WinterArcPath;
} {
  if (!arcState || !arcState.isActive || !arcState.startDate) {
    const defaultPath = WINTER_ARC_PATHS[0];
    return {
      isStarted: false,
      currentDay: 0,
      totalDays: 90,
      daysCompleted: 0,
      daysRemaining: 90,
      consistencyPercent: 0,
      progressPercent: 0,
      endDateDisplay: 'January 31',
      path: defaultPath,
    };
  }

  const start = new Date(arcState.startDate);
  const end = new Date(arcState.targetEndDate || getNextWinterArcEndDate(start));
  const today = new Date();

  // Strip time for exact day calculation
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.max(1, Math.round((endDay.getTime() - startDay.getTime()) / msPerDay));
  const elapsedDays = Math.max(0, Math.round((todayDay.getTime() - startDay.getTime()) / msPerDay));
  const currentDay = Math.min(totalDays, elapsedDays + 1);
  const daysRemaining = Math.max(0, Math.round((endDay.getTime() - todayDay.getTime()) / msPerDay));

  const daysCompleted = (arcState.completedDays || []).length;
  const consistencyPercent = Math.min(100, Math.round((daysCompleted / Math.max(1, currentDay)) * 100));
  const progressPercent = Math.min(100, Math.round((currentDay / totalDays) * 100));

  const path = WINTER_ARC_PATHS.find(p => p.id === arcState.selectedPathId) || WINTER_ARC_PATHS[0];

  return {
    isStarted: true,
    currentDay,
    totalDays,
    daysCompleted,
    daysRemaining,
    consistencyPercent,
    progressPercent,
    endDateDisplay: 'January 31',
    path
  };
}

// ---------------- CHALLENGE LIBRARY ----------------
export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Medium' | 'Hard' | 'Elite';
  duration: string;
  targetCount: number;
  unit: string;
  xpReward: number;
  icon: string;
  category: string;
}

export const CHALLENGE_LIBRARY: Challenge[] = [
  {
    id: 'ch_30_consistency',
    title: '30 Day Consistency',
    description: 'Complete at least one planned fitness session or meaningful workout every day for 30 days.',
    difficulty: 'Medium',
    duration: '30 Days',
    targetCount: 30,
    unit: 'days',
    xpReward: 1000,
    icon: '🔥',
    category: 'Consistency'
  },
  {
    id: 'ch_1000_reps',
    title: '1,000 Rep Challenge',
    description: 'Accumulate 1,000 quality repetitions across compound movements (Push-ups, Squats, Pull-ups, Presses).',
    difficulty: 'Hard',
    duration: 'Multi-day',
    targetCount: 1000,
    unit: 'reps',
    xpReward: 800,
    icon: '⚔️',
    category: 'Strength'
  },
  {
    id: 'ch_strength_builder',
    title: 'Strength Builder',
    description: 'Complete 12 focused heavy strength training workouts with progressive overload.',
    difficulty: 'Medium',
    duration: '4 Weeks',
    targetCount: 12,
    unit: 'workouts',
    xpReward: 750,
    icon: '🏛️',
    category: 'Strength'
  },
  {
    id: 'ch_cardio_arc',
    title: 'Cardio Arc',
    description: 'Complete 10 cardiovascular endurance or HIIT conditioning sessions.',
    difficulty: 'Medium',
    duration: '3 Weeks',
    targetCount: 10,
    unit: 'sessions',
    xpReward: 600,
    icon: '💨',
    category: 'Endurance'
  },
  {
    id: 'ch_mobility_arc',
    title: 'Mobility & Recovery Arc',
    description: 'Complete 15 dedicated mobility, foam rolling, or yoga recovery sessions.',
    difficulty: 'Beginner',
    duration: '3 Weeks',
    targetCount: 15,
    unit: 'sessions',
    xpReward: 500,
    icon: '🧘',
    category: 'Recovery'
  },
  {
    id: 'ch_no_zero_days',
    title: 'No Zero Days',
    description: 'Log 21 consecutive days of meaningful physical activity and hydration.',
    difficulty: 'Hard',
    duration: '21 Days',
    targetCount: 21,
    unit: 'days',
    xpReward: 1200,
    icon: '🛡️',
    category: 'Discipline'
  },
  {
    id: 'ch_beginner_foundation',
    title: 'Beginner Foundation',
    description: 'Complete 20 beginner-friendly full body workouts focusing on pristine exercise form.',
    difficulty: 'Beginner',
    duration: '5 Weeks',
    targetCount: 20,
    unit: 'workouts',
    xpReward: 850,
    icon: '🔰',
    category: 'Foundation'
  },
  {
    id: 'ch_home_warrior',
    title: 'Home Warrior',
    description: 'Complete 15 high-intensity calisthenics or home workouts with zero equipment.',
    difficulty: 'Medium',
    duration: '4 Weeks',
    targetCount: 15,
    unit: 'workouts',
    xpReward: 700,
    icon: '🏠',
    category: 'Home'
  },
  {
    id: 'ch_pr_hunt',
    title: 'Personal Record (PR) Hunt',
    description: 'Break or set 3 new personal records in weight or rep milestones.',
    difficulty: 'Elite',
    duration: 'Flexible',
    targetCount: 3,
    unit: 'PRs',
    xpReward: 1000,
    icon: '🏆',
    category: 'Strength'
  },
  {
    id: 'ch_step_master',
    title: '150,000 Step Quest',
    description: 'Accumulate 150,000 total steps to elevate metabolic burn and daily NEAT.',
    difficulty: 'Medium',
    duration: '2-3 Weeks',
    targetCount: 150000,
    unit: 'steps',
    xpReward: 650,
    icon: '👟',
    category: 'Endurance'
  },
  {
    id: 'ch_recovery_master',
    title: 'Sleep & Recovery Master',
    description: 'Maintain 7+ hours of quality sleep for 14 logged nights.',
    difficulty: 'Medium',
    duration: '2 Weeks',
    targetCount: 14,
    unit: 'nights',
    xpReward: 600,
    icon: '😴',
    category: 'Recovery'
  }
];

// ---------------- ACHIEVEMENTS SYSTEM ----------------
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'Milestone' | 'Streak' | 'Strength' | 'Winter Arc';
  unlocked: boolean;
  unlockedDate?: string;
}

export function getAchievementsList(stats: {
  totalWorkouts: number;
  streak: number;
  totalPrs: number;
  winterArcActive: boolean;
  winterArcDays: number;
  level: number;
}): Achievement[] {
  return [
    {
      id: 'ach_first_workout',
      title: 'FIRST WORKOUT',
      description: 'Completed your very first workout session on LevelUp.',
      icon: '⚡',
      xpReward: 100,
      category: 'Milestone',
      unlocked: stats.totalWorkouts >= 1
    },
    {
      id: 'ach_7_streak',
      title: '7 DAY STREAK',
      description: 'Maintained relentless 7-day consistency and momentum.',
      icon: '🔥',
      xpReward: 500,
      category: 'Streak',
      unlocked: stats.streak >= 7
    },
    {
      id: 'ach_first_pr',
      title: 'FIRST PR',
      description: 'Shattered your personal record with maximum intensity.',
      icon: '🏆',
      xpReward: 200,
      category: 'Strength',
      unlocked: stats.totalPrs >= 1
    },
    {
      id: 'ach_10_workouts',
      title: '10 WORKOUTS',
      description: 'Completed 10 comprehensive training sessions.',
      icon: '💪',
      xpReward: 300,
      category: 'Milestone',
      unlocked: stats.totalWorkouts >= 10
    },
    {
      id: 'ach_30_days',
      title: '30 DAYS DISCIPLINE',
      description: 'Maintained a 30-day consistency milestone.',
      icon: '🛡️',
      xpReward: 1000,
      category: 'Streak',
      unlocked: stats.streak >= 30 || stats.totalWorkouts >= 30
    },
    {
      id: 'ach_arc_started',
      title: 'WINTER ARC INITIATED',
      description: 'Joined the Winter Arc challenge and pledged transformation.',
      icon: '❄️',
      xpReward: 200,
      category: 'Winter Arc',
      unlocked: stats.winterArcActive
    },
    {
      id: 'ach_arc_finisher',
      title: 'WINTER ARC FINISHER',
      description: 'Completed 30+ Winter Arc days leading to January 31.',
      icon: '👑',
      xpReward: 2500,
      category: 'Winter Arc',
      unlocked: stats.winterArcDays >= 30
    },
    {
      id: 'ach_level_10',
      title: 'CONSISTENT TIER',
      description: 'Ascended to Level 10 Consistent Tier in the LevelUp ranking.',
      icon: '🌟',
      xpReward: 400,
      category: 'Milestone',
      unlocked: stats.level >= 10
    }
  ];
}

// ---------------- HEALTHY STREAK ENGINE ----------------
export interface StreakStatus {
  currentStreak: number;
  bestStreak: number;
  isStreakActiveToday: boolean;
  isAtRisk: boolean;
  streakFreezesAvailable: number;
  lastActiveDate: string | null;
}

export function calculateHealthyStreak(
  workoutData: Record<string, any[]>,
  todayStr: string = new Date().toLocaleDateString('en-CA'),
  streakFreezes: number = 2
): StreakStatus {
  const dates = Object.keys(workoutData)
    .filter(d => workoutData[d] && workoutData[d].length > 0)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (dates.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      isStreakActiveToday: false,
      isAtRisk: false,
      streakFreezesAvailable: streakFreezes,
      lastActiveDate: null
    };
  }

  const isTodayLogged = dates.includes(todayStr);
  const mostRecent = dates[0];

  const todayObj = new Date(todayStr);
  const mostRecentObj = new Date(mostRecent);
  const diffDays = Math.round((todayObj.getTime() - mostRecentObj.getTime()) / (1000 * 60 * 60 * 24));

  // If user worked out today or yesterday, streak is alive
  // If 2 days ago, grace period / streak freeze can protect it
  let streak = 0;
  let cursor = isTodayLogged ? new Date(todayStr) : new Date(mostRecent);
  let freezesUsed = 0;

  for (let i = 0; i < 365; i++) {
    const cStr = cursor.toLocaleDateString('en-CA');
    if (dates.includes(cStr)) {
      streak++;
    } else {
      // Allow 1 rest day freeze if within reasonable window
      if (freezesUsed < streakFreezes && streak > 0) {
        freezesUsed++;
        // Don't increment streak count, but don't break the chain
      } else {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  const isAtRisk = !isTodayLogged && diffDays === 1;

  // Best streak from localStorage or computed
  const savedBest = parseInt(localStorage.getItem('lvl_best_streak') || '0');
  const bestStreak = Math.max(savedBest, streak);
  if (bestStreak > savedBest) {
    localStorage.setItem('lvl_best_streak', String(bestStreak));
  }

  return {
    currentStreak: streak,
    bestStreak,
    isStreakActiveToday: isTodayLogged,
    isAtRisk,
    streakFreezesAvailable: Math.max(0, streakFreezes - freezesUsed),
    lastActiveDate: mostRecent
  };
}
