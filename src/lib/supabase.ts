import { createClient } from '@supabase/supabase-js';
import { WorkoutEntry, MuscleGroup } from '../types';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Supabase Schema SQL Reference:
 * 
 * CREATE TABLE IF NOT EXISTS workout_logs (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id TEXT NOT NULL DEFAULT 'local-user',
 *   muscle TEXT NOT NULL,
 *   exercise_name TEXT,
 *   weight NUMERIC NOT NULL DEFAULT 0,
 *   reps INTEGER NOT NULL DEFAULT 0,
 *   sets INTEGER NOT NULL DEFAULT 0,
 *   notes TEXT,
 *   time TEXT,
 *   date TEXT NOT NULL,
 *   workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
 *   logged_late BOOLEAN NOT NULL DEFAULT FALSE,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */

export interface SupabaseWorkoutLogRow {
  id?: string;
  user_id?: string;
  muscle: string;
  exercise_name?: string;
  weight: number;
  reps: number;
  sets: number;
  notes?: string;
  time?: string;
  date: string;
  workout_date: string;
  logged_late: boolean;
  created_at?: string;
}

// Fetch workout logs for the last N days from Supabase (or fallback)
export async function fetchWorkoutLogsFromSupabase(days: number = 7): Promise<WorkoutEntry[]> {
  if (!supabase) {
    return [];
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .gte('workout_date', startDateStr)
      .order('workout_date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, falling back:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((row: SupabaseWorkoutLogRow) => ({
      id: row.id,
      muscle: row.muscle as MuscleGroup,
      exerciseName: row.exercise_name || row.muscle,
      weight: Number(row.weight) || 0,
      reps: Number(row.reps) || 0,
      sets: Number(row.sets) || 0,
      notes: row.notes || '',
      time: row.time || '12:00 PM',
      date: row.date || row.workout_date,
      workout_date: row.workout_date,
      logged_late: row.logged_late ?? false,
    }));
  } catch (err) {
    console.warn('Failed querying Supabase workout logs:', err);
    return [];
  }
}

// Insert workout log into Supabase
export async function insertWorkoutLogToSupabase(entry: WorkoutEntry, userId: string = 'local-user'): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const workoutDate = entry.workout_date || entry.date || new Date().toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const isLate = entry.logged_late ?? (workoutDate < todayStr);

    const row: SupabaseWorkoutLogRow = {
      user_id: userId,
      muscle: entry.muscle,
      exercise_name: entry.exerciseName || entry.muscle,
      weight: entry.weight,
      reps: entry.reps,
      sets: entry.sets,
      notes: entry.notes || '',
      time: entry.time,
      date: entry.date,
      workout_date: workoutDate,
      logged_late: isLate
    };

    const { error } = await supabase.from('workout_logs').insert([row]);
    if (error) {
      console.warn('Failed inserting log to Supabase:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Supabase insert exception:', err);
    return false;
  }
}

// Map exercise to primary muscle group
export function normalizeMuscleGroup(muscle: string, exerciseName?: string): MuscleGroup {
  const nameLower = (exerciseName || '').toLowerCase();
  const muscleLower = (muscle || '').toLowerCase();

  if (nameLower.includes('bench') || nameLower.includes('fly') || nameLower.includes('chest') || nameLower.includes('pushup') || nameLower.includes('dip')) {
    return 'Chest';
  }
  if (nameLower.includes('pull-up') || nameLower.includes('pulldown') || nameLower.includes('row') || nameLower.includes('lat') || nameLower.includes('deadlift')) {
    return 'Back';
  }
  if (nameLower.includes('squat') || nameLower.includes('leg press') || nameLower.includes('quad') || nameLower.includes('extension')) {
    return 'Quadriceps';
  }
  if (nameLower.includes('curl') && !nameLower.includes('leg')) {
    return 'Biceps';
  }
  if (nameLower.includes('tricep') || nameLower.includes('skull crusher') || nameLower.includes('pushdown')) {
    return 'Triceps';
  }
  if (nameLower.includes('shoulder') || nameLower.includes('press') || nameLower.includes('lateral raise') || nameLower.includes('delt')) {
    return 'Shoulder';
  }
  if (nameLower.includes('rdl') || nameLower.includes('hamstring') || nameLower.includes('leg curl')) {
    return 'Hamstrings';
  }
  if (nameLower.includes('hip thrust') || nameLower.includes('glute')) {
    return 'Glutes';
  }
  if (nameLower.includes('crunch') || nameLower.includes('plank') || nameLower.includes('abs') || nameLower.includes('leg raise')) {
    return 'Abs';
  }

  // Fallback to muscle parameter
  if (muscleLower.includes('chest')) return 'Chest';
  if (muscleLower.includes('back')) return 'Back';
  if (muscleLower.includes('bicep')) return 'Biceps';
  if (muscleLower.includes('tricep')) return 'Triceps';
  if (muscleLower.includes('shoulder')) return 'Shoulder';
  if (muscleLower.includes('quad') || muscleLower === 'legs') return 'Quadriceps';
  if (muscleLower.includes('hamstring')) return 'Hamstrings';
  if (muscleLower.includes('glute')) return 'Glutes';
  if (muscleLower.includes('abs')) return 'Abs';

  return 'Chest';
}

// Aggregate 7-day muscle frequency
export function calculate7DayMuscleFrequency(allLogs: Record<string, WorkoutEntry[]> | WorkoutEntry[]): Record<string, number> {
  const result: Record<string, number> = {
    Chest: 0,
    Back: 0,
    Shoulder: 0,
    Biceps: 0,
    Triceps: 0,
    Quadriceps: 0,
    Hamstrings: 0,
    Glutes: 0,
    Abs: 0
  };

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  let flatLogs: WorkoutEntry[] = [];
  if (Array.isArray(allLogs)) {
    flatLogs = allLogs;
  } else {
    flatLogs = Object.values(allLogs).flat();
  }

  flatLogs.forEach(entry => {
    const entryDateStr = entry.workout_date || entry.date;
    if (!entryDateStr) return;
    const entryDate = new Date(entryDateStr);

    if (entryDate >= sevenDaysAgo) {
      const muscleGroup = normalizeMuscleGroup(entry.muscle, entry.exerciseName);
      if (result[muscleGroup] !== undefined) {
        result[muscleGroup] += 1;
      }
    }
  });

  return result;
}

// Smart Enhancement 1: Muscle Recovery Indicator
// <48h -> red (rest needed)
// 48-72h -> yellow (recovering)
// >72h -> green (ready)
export type RecoveryStatus = 'red' | 'yellow' | 'green';

export interface MuscleRecoveryInfo {
  muscle: string;
  hoursSinceTrained: number | null;
  status: RecoveryStatus;
  label: string;
}

export function calculateMuscleRecovery(allLogs: Record<string, WorkoutEntry[]> | WorkoutEntry[]): Record<string, MuscleRecoveryInfo> {
  const muscles = ['Chest', 'Back', 'Shoulder', 'Biceps', 'Triceps', 'Quadriceps', 'Hamstrings', 'Glutes', 'Abs'];
  const now = new Date();

  let flatLogs: WorkoutEntry[] = [];
  if (Array.isArray(allLogs)) {
    flatLogs = allLogs;
  } else {
    flatLogs = Object.values(allLogs).flat();
  }

  const lastTrainedMap: Record<string, Date> = {};

  flatLogs.forEach(entry => {
    const entryDateStr = entry.workout_date || entry.date;
    if (!entryDateStr) return;
    const entryDate = new Date(entryDateStr);
    const mGroup = normalizeMuscleGroup(entry.muscle, entry.exerciseName);

    if (!lastTrainedMap[mGroup] || entryDate > lastTrainedMap[mGroup]) {
      lastTrainedMap[mGroup] = entryDate;
    }
  });

  const recoveryMap: Record<string, MuscleRecoveryInfo> = {};

  muscles.forEach(m => {
    const lastDate = lastTrainedMap[m];
    if (!lastDate) {
      recoveryMap[m] = {
        muscle: m,
        hoursSinceTrained: null,
        status: 'green',
        label: 'Ready to train (>72h or Untrained)'
      };
      return;
    }

    const diffMs = now.getTime() - lastDate.getTime();
    const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

    if (hours < 48) {
      recoveryMap[m] = {
        muscle: m,
        hoursSinceTrained: hours,
        status: 'red',
        label: `Rest Needed (${hours}h ago)`
      };
    } else if (hours <= 72) {
      recoveryMap[m] = {
        muscle: m,
        hoursSinceTrained: hours,
        status: 'yellow',
        label: `Recovering (${hours}h ago)`
      };
    } else {
      recoveryMap[m] = {
        muscle: m,
        hoursSinceTrained: hours,
        status: 'green',
        label: `Ready to train (${hours}h ago)`
      };
    }
  });

  return recoveryMap;
}

// Smart Enhancement 2: Weekly Balance Insight
export function generateWeeklyBalanceInsight(frequencyMap: Record<string, number>): string {
  const undertrained: string[] = [];
  const overtrained: string[] = [];

  Object.entries(frequencyMap).forEach(([muscle, count]) => {
    if (count === 0) {
      undertrained.push(muscle);
    } else if (count >= 5) {
      overtrained.push(muscle);
    }
  });

  if (undertrained.length === 0 && overtrained.length === 0) {
    return 'Your weekly volume is well-balanced across all muscle groups. Great consistency!';
  }

  let text = '';
  if (undertrained.length > 0) {
    text += `Focus area: ${undertrained.slice(0, 3).join(', ')} ${undertrained.length === 1 ? 'has' : 'have'} 0 sessions logged this week. `;
  }
  if (overtrained.length > 0) {
    text += `High volume alert: ${overtrained.join(', ')} ${overtrained.length === 1 ? 'has' : 'have'} 5+ sessions. Ensure adequate rest for optimal growth.`;
  }

  return text.trim();
}
