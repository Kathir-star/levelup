import { supabase } from './supabase';
import { WorkoutEntry } from '../types';

export interface Challenge {
  id: string;
  name: string;
  type: 'transformation' | 'sugar_cut' | 'hydration' | 'movement' | 'strength';
  duration: number; // in days or count
  description: string;
  icon?: string;
  created_at?: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  start_date: string;
  progress: number;
  is_completed: boolean;
  last_updated_date?: string;
}

export const SYSTEM_CHALLENGES: Challenge[] = [
  {
    id: 'ch-transformation-100',
    name: '100 Days Transformation Challenge',
    type: 'transformation',
    duration: 100,
    description: 'Track daily check-ins or workouts. Stay disciplined for 100 days.',
    icon: '🔥'
  },
  {
    id: 'ch-sugar-cut-30',
    name: 'Sugar Cut Challenge',
    type: 'sugar_cut',
    duration: 30,
    description: 'Zero added refined sugar. Resets to 0 if sugar is consumed.',
    icon: '🚫'
  },
  {
    id: 'ch-hydration-14',
    name: 'Hydration Mastery Challenge',
    type: 'hydration',
    duration: 14,
    description: 'Hit 3,000ml (3-4L) water intake daily to optimize cell hydration.',
    icon: '💧'
  },
  {
    id: 'ch-movement-30',
    name: 'Daily Movement Challenge',
    type: 'movement',
    duration: 30,
    description: 'Achieve 6,000+ steps OR complete a 20+ minute workout daily.',
    icon: '👟'
  },
  {
    id: 'ch-strength-5',
    name: 'Strength Progress Challenge',
    type: 'strength',
    duration: 5,
    description: 'Set 5 new Personal Records (PRs) across bench, squat, deadlift, or any lift.',
    icon: '🏆'
  }
];

const LOCAL_USER_CHALLENGES_KEY = 'sm_user_challenges_v2';
const LOCAL_SUGAR_LOG_KEY = 'sm_sugar_log_v2';

export function getInitialUserChallenges(userId: string = 'local_user'): UserChallenge[] {
  const saved = localStorage.getItem(LOCAL_USER_CHALLENGES_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= SYSTEM_CHALLENGES.length) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse local user challenges", e);
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const defaults: UserChallenge[] = SYSTEM_CHALLENGES.map((ch) => ({
    id: `uc-${ch.id}-${userId}`,
    user_id: userId,
    challenge_id: ch.id,
    start_date: todayStr,
    progress: 0,
    is_completed: false,
    last_updated_date: ''
  }));

  localStorage.setItem(LOCAL_USER_CHALLENGES_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveUserChallengesLocal(userChallenges: UserChallenge[]) {
  localStorage.setItem(LOCAL_USER_CHALLENGES_KEY, JSON.stringify(userChallenges));
}

export async function fetchChallengesFromSupabase(): Promise<Challenge[]> {
  if (!supabase) return SYSTEM_CHALLENGES;
  try {
    const { data, error } = await supabase.from('challenges').select('*');
    if (error || !data || data.length === 0) {
      return SYSTEM_CHALLENGES;
    }
    return data as Challenge[];
  } catch {
    return SYSTEM_CHALLENGES;
  }
}

export async function fetchUserChallengesFromSupabase(userId: string = 'local_user'): Promise<UserChallenge[]> {
  const localData = getInitialUserChallenges(userId);
  if (!supabase) return localData;

  try {
    const { data, error } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId);

    if (error || !data || data.length === 0) {
      return localData;
    }
    saveUserChallengesLocal(data as UserChallenge[]);
    return data as UserChallenge[];
  } catch {
    return localData;
  }
}

export async function saveUserChallengeToSupabase(uc: UserChallenge): Promise<void> {
  const current = getInitialUserChallenges(uc.user_id);
  const updated = current.map((c) => (c.id === uc.id ? uc : c));
  saveUserChallengesLocal(updated);

  if (!supabase) return;

  try {
    await supabase.from('user_challenges').upsert({
      id: uc.id,
      user_id: uc.user_id,
      challenge_id: uc.challenge_id,
      start_date: uc.start_date,
      progress: uc.progress,
      is_completed: uc.is_completed,
      last_updated_date: uc.last_updated_date
    });
  } catch (err) {
    console.warn("Supabase user_challenges sync warning:", err);
  }
}

export function getTodaySugarLog(dateStr: string): boolean | null {
  const saved = localStorage.getItem(LOCAL_SUGAR_LOG_KEY);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    return parsed[dateStr] ?? null;
  } catch {
    return null;
  }
}

export function saveSugarLog(dateStr: string, sugarConsumed: boolean) {
  const saved = localStorage.getItem(LOCAL_SUGAR_LOG_KEY);
  let parsed: Record<string, boolean> = {};
  if (saved) {
    try {
      parsed = JSON.parse(saved);
    } catch {}
  }
  parsed[dateStr] = sugarConsumed;
  localStorage.setItem(LOCAL_SUGAR_LOG_KEY, JSON.stringify(parsed));
}

export interface ProgressEvaluationInput {
  userChallenges: UserChallenge[];
  today: string;
  workoutData: Record<string, WorkoutEntry[]>;
  stepsToday: number;
  waterToday: number;
  sugarConsumedToday?: boolean | null;
  isPRLoggedToday?: boolean;
  waterGoal?: number;
}

export function evaluateAndUpdateChallenges(input: ProgressEvaluationInput): {
  updatedChallenges: UserChallenge[];
  hasChanges: boolean;
  completedChallengeName?: string;
} {
  const {
    userChallenges,
    today,
    workoutData,
    stepsToday,
    waterToday,
    sugarConsumedToday,
    isPRLoggedToday = false,
    waterGoal = 3000
  } = input;

  let hasChanges = false;
  let completedChallengeName: string | undefined = undefined;

  const todayWorkouts = workoutData[today] || [];
  const hasWorkoutToday = todayWorkouts.length > 0;
  const totalWorkoutMinutes = todayWorkouts.length * 20;

  const updatedChallenges = userChallenges.map((uc) => {
    const chMeta = SYSTEM_CHALLENGES.find((c) => c.id === uc.challenge_id);
    const duration = chMeta?.duration || 30;

    if (uc.is_completed) return uc;

    let newProgress = uc.progress;
    let newCompleted = uc.is_completed;
    let updatedToday = uc.last_updated_date === today;
    let localChanged = false;

    // 1. 100 Days Transformation Challenge
    if (chMeta?.type === 'transformation') {
      if (!updatedToday && hasWorkoutToday) {
        newProgress = Math.min(duration, uc.progress + 1);
        updatedToday = true;
        localChanged = true;
      }
    }

    // 2. Sugar Cut Challenge (14 or 30 days)
    if (chMeta?.type === 'sugar_cut') {
      if (sugarConsumedToday === true) {
        if (uc.progress !== 0) {
          newProgress = 0;
          localChanged = true;
        }
      } else if (sugarConsumedToday === false && !updatedToday) {
        newProgress = Math.min(duration, uc.progress + 1);
        updatedToday = true;
        localChanged = true;
      }
    }

    // 3. Hydration Challenge
    if (chMeta?.type === 'hydration') {
      if (!updatedToday && waterToday >= waterGoal) {
        newProgress = Math.min(duration, uc.progress + 1);
        updatedToday = true;
        localChanged = true;
      }
    }

    // 4. Daily Movement Challenge
    if (chMeta?.type === 'movement') {
      const movementConditionMet = stepsToday >= 6000 || totalWorkoutMinutes >= 20 || hasWorkoutToday;
      if (!updatedToday && movementConditionMet) {
        newProgress = Math.min(duration, uc.progress + 1);
        updatedToday = true;
        localChanged = true;
      }
    }

    // 5. Strength Progress Challenge
    if (chMeta?.type === 'strength') {
      if (!updatedToday && isPRLoggedToday) {
        newProgress = Math.min(duration, uc.progress + 1);
        updatedToday = true;
        localChanged = true;
      }
    }

    if (newProgress >= duration && !newCompleted) {
      newCompleted = true;
      completedChallengeName = chMeta?.name;
      localChanged = true;
    }

    if (localChanged) {
      hasChanges = true;
      const updatedUC: UserChallenge = {
        ...uc,
        progress: newProgress,
        is_completed: newCompleted,
        last_updated_date: updatedToday ? today : uc.last_updated_date
      };
      saveUserChallengeToSupabase(updatedUC);
      return updatedUC;
    }

    return uc;
  });

  return { updatedChallenges, hasChanges, completedChallengeName };
}
