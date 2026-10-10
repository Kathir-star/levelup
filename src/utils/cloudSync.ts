import {
  db,
  doc,
  getDoc,
  setDoc,
  OperationType,
  handleFirestoreError
} from '../lib/firebase';
import {
  UserProfile,
  WorkoutEntry,
  PR,
  SleepEntry,
  DailyMission,
  LoggedFoodEntry,
  FoodItem,
  SavedMealTemplate,
  BodyMetricEntry,
  AppSettings
} from '../types';
import { DEFAULT_APP_SETTINGS } from './nutritionDatabase';

export const CURRENT_SCHEMA_VERSION = 2;

export interface CloudVaultData {
  uid: string;
  email?: string;
  displayName?: string;
  schemaVersion: number;
  updatedAt: string;
  xp?: number;
  profile: UserProfile | null;
  workoutData: Record<string, WorkoutEntry[]>;
  prs: Record<string, PR>;
  steps: number;
  stepsHistory: Record<string, number>;
  water: number;
  waterHistory: Record<string, number>;
  sleepData: SleepEntry[];
  missions: DailyMission[];
  nutritionLogs: Record<string, LoggedFoodEntry[]>;
  customFoods: FoodItem[];
  savedMeals: SavedMealTemplate[];
  bodyMetricsHistory: BodyMetricEntry[];
  selfMastery: any;
  plannerSchedule: any;
  winterArc: any;
  settings: AppSettings;
}

/**
 * Safely normalizes workoutData so that no corrupted non-array properties (like legacy `workout` key)
 * can ever crash `Object.values(workoutData).flat()` on mobile or desktop.
 */
export function sanitizeWorkoutData(raw: any): Record<string, WorkoutEntry[]> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const cleaned: Record<string, WorkoutEntry[]> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (key === 'workout' && Array.isArray(value)) {
      // Recover legacy mis-saved entries from Planner into their proper date buckets
      for (const item of value) {
        if (item && typeof item === 'object') {
          const dateKey = item.date || new Date().toISOString().split('T')[0];
          if (!cleaned[dateKey]) cleaned[dateKey] = [];
          cleaned[dateKey].push({
            id: String(item.id || Date.now() + Math.random()),
            exerciseName: item.exercise || item.exerciseName || 'Completed Exercise',
            muscle: (item.muscle || 'chest').toLowerCase() as any,
            weight: Number(item.weight) || 0,
            reps: Number(item.reps) || 10,
            sets: Number(item.sets) || 3,
            date: dateKey,
            timestamp: item.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
      continue;
    }

    if (Array.isArray(value)) {
      cleaned[key] = value.filter((entry) => entry && typeof entry === 'object');
    }
  }

  return cleaned;
}

/**
 * Gather all local storage keys for a user profile into a unified, versioned snapshot.
 */
export function collectLocalVault(profile: UserProfile | null, uid: string, email?: string): CloudVaultData {
  const nameKey = profile?.name || localStorage.getItem('username') || 'Athlete';
  const todayStr = new Date().toLocaleDateString('en-CA');

  const safeParse = <T>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  // App.tsx stores a unified object inside `lv_data_${nameKey}`
  const rawUnified = safeParse<any>(`lv_data_${nameKey}`, {});
  const isUnifiedFormat = rawUnified && typeof rawUnified === 'object' && ('workoutData' in rawUnified || 'userProfile' in rawUnified);

  const workoutData = isUnifiedFormat
    ? sanitizeWorkoutData(rawUnified.workoutData)
    : sanitizeWorkoutData(rawUnified);

  const prs = isUnifiedFormat && rawUnified.prs
    ? rawUnified.prs
    : safeParse<Record<string, PR>>(`lv_prs_${nameKey}`, {});

  const stepsHistory = isUnifiedFormat && rawUnified.steps
    ? rawUnified.steps
    : safeParse<Record<string, number>>(`lv_steps_history_${nameKey}`, {});

  const steps = Number(stepsHistory[todayStr] || localStorage.getItem(`lv_steps_${nameKey}_${todayStr}`) || 0);

  const waterHistory = isUnifiedFormat && rawUnified.water
    ? rawUnified.water
    : safeParse<Record<string, number>>(`lv_water_history_${nameKey}`, {});

  const water = Number(waterHistory[todayStr] || localStorage.getItem(`lv_water_${nameKey}_${todayStr}`) || 0);

  const rawSleep = isUnifiedFormat && rawUnified.sleep
    ? rawUnified.sleep
    : safeParse<any>(`lv_sleep_${nameKey}`, []);

  const sleepData: SleepEntry[] = Array.isArray(rawSleep)
    ? rawSleep
    : rawSleep && typeof rawSleep === 'object'
      ? Object.values(rawSleep)
      : [];

  const missions = isUnifiedFormat && Array.isArray(rawUnified.missions)
    ? rawUnified.missions
    : safeParse<DailyMission[]>(`lv_missions_${nameKey}_${todayStr}`, []);

  const xp = Number(isUnifiedFormat && rawUnified.xp !== undefined ? rawUnified.xp : localStorage.getItem('user-xp') || 0);

  const nutritionLogs = safeParse<Record<string, LoggedFoodEntry[]>>(`lv_nutrition_logs_${nameKey}`, {});
  const customFoods = safeParse<FoodItem[]>(`lv_custom_foods_${nameKey}`, []);
  const savedMeals = safeParse<SavedMealTemplate[]>(`lv_saved_meals_${nameKey}`, []);
  const bodyMetricsHistory = safeParse<BodyMetricEntry[]>(`lv_body_metrics_${nameKey}`, []);
  const selfMastery = {
    habits: safeParse(`lv_sm_habits_${nameKey}`, []),
    streak: safeParse(`lv_sm_streak_${nameKey}`, null),
    triggers: safeParse(`lv_sm_triggers_${nameKey}`, [])
  };
  const plannerSchedule = {
    weeklySplit: safeParse('lv_weekly_split_custom', {}),
    customPlans: safeParse('lv_custom_plans', {}),
    doneMap: safeParse('lv_planner_done', {})
  };
  const winterArc = safeParse('lvl_winter_arc', {
    selected: localStorage.getItem('lv_selected_challenge') || 'arc_90',
    start: localStorage.getItem('lv_challenge_start') || todayStr,
    habits: safeParse('lv_arc_habits_history', {})
  });
  const settings = {
    ...DEFAULT_APP_SETTINGS,
    ...safeParse<Partial<AppSettings>>(`lv_settings_${nameKey}`, {})
  };

  return {
    uid,
    email: email || profile?.email || '',
    displayName: profile?.name || nameKey,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    xp,
    profile: profile || (isUnifiedFormat ? rawUnified.userProfile : null),
    workoutData,
    prs,
    steps,
    stepsHistory,
    water,
    waterHistory,
    sleepData,
    missions,
    nutritionLogs,
    customFoods,
    savedMeals,
    bodyMetricsHistory,
    selfMastery,
    plannerSchedule,
    winterArc,
    settings
  };
}

/**
 * Intelligently merges remote cloud data with local data without losing workouts, PRs, or logs.
 */
export function mergeVaults(local: CloudVaultData, remote: Partial<CloudVaultData>): CloudVaultData {
  const mergedWorkoutData: Record<string, WorkoutEntry[]> = {
    ...sanitizeWorkoutData(remote.workoutData),
  };
  const localWorkouts = sanitizeWorkoutData(local.workoutData);

  for (const [date, entries] of Object.entries(localWorkouts)) {
    if (!mergedWorkoutData[date]) {
      mergedWorkoutData[date] = entries;
    } else {
      const existingSignatures = new Set(
        mergedWorkoutData[date].map((e) => e.id || `${e.exerciseName || e.muscle}_${e.weight}_${e.reps}_${e.time || ''}`)
      );
      for (const e of entries) {
        const sig = e.id || `${e.exerciseName || e.muscle}_${e.weight}_${e.reps}_${e.time || ''}`;
        if (!existingSignatures.has(sig)) {
          mergedWorkoutData[date].push(e);
        }
      }
    }
  }

  // Merge PRs (keep highest weight)
  const mergedPrs: Record<string, PR> = { ...(remote.prs || {}) };
  for (const [ex, pr] of Object.entries(local.prs || {})) {
    if (!mergedPrs[ex] || pr.weight > mergedPrs[ex].weight) {
      mergedPrs[ex] = pr;
    }
  }

  // Merge Nutrition Logs by date and entry ID
  const mergedNutrition: Record<string, LoggedFoodEntry[]> = { ...(remote.nutritionLogs || {}) };
  for (const [date, entries] of Object.entries(local.nutritionLogs || {})) {
    if (!mergedNutrition[date]) {
      mergedNutrition[date] = entries;
    } else {
      const ids = new Set(mergedNutrition[date].map((i) => i.id));
      for (const item of entries) {
        if (!ids.has(item.id)) mergedNutrition[date].push(item);
      }
    }
  }

  // Merge Custom Foods
  const foodMap = new Map<string, FoodItem>();
  for (const f of remote.customFoods || []) foodMap.set(f.id, f);
  for (const f of local.customFoods || []) foodMap.set(f.id, f);

  // Merge Saved Meals
  const mealMap = new Map<string, SavedMealTemplate>();
  for (const m of remote.savedMeals || []) mealMap.set(m.id, m);
  for (const m of local.savedMeals || []) mealMap.set(m.id, m);

  // Merge Sleep Data by date
  const sleepMap = new Map<string, SleepEntry>();
  for (const s of remote.sleepData || []) if (s && s.date) sleepMap.set(s.date, s);
  for (const s of local.sleepData || []) if (s && s.date) sleepMap.set(s.date, s);

  // Merge Body Metrics History
  const metricsMap = new Map<string, BodyMetricEntry>();
  for (const b of remote.bodyMetricsHistory || []) if (b && b.date) metricsMap.set(b.date, b);
  for (const b of local.bodyMetricsHistory || []) if (b && b.date) metricsMap.set(b.date, b);

  return {
    uid: local.uid || remote.uid || '',
    email: local.email || remote.email || '',
    displayName: remote.profile?.name || local.profile?.name || 'Athlete',
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    xp: Math.max(local.xp || 0, remote.xp || 0),
    profile: { ...(remote.profile || {}), ...(local.profile || {}) } as UserProfile,
    workoutData: mergedWorkoutData,
    prs: mergedPrs,
    steps: Math.max(local.steps || 0, remote.steps || 0),
    stepsHistory: { ...(remote.stepsHistory || {}), ...(local.stepsHistory || {}) },
    water: Math.max(local.water || 0, remote.water || 0),
    waterHistory: { ...(remote.waterHistory || {}), ...(local.waterHistory || {}) },
    sleepData: Array.from(sleepMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    missions: local.missions?.length ? local.missions : (remote.missions || []),
    nutritionLogs: mergedNutrition,
    customFoods: Array.from(foodMap.values()),
    savedMeals: Array.from(mealMap.values()),
    bodyMetricsHistory: Array.from(metricsMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    selfMastery: local.selfMastery?.habits?.length ? local.selfMastery : (remote.selfMastery || local.selfMastery),
    plannerSchedule: {
      weeklySplit: { ...(remote.plannerSchedule?.weeklySplit || {}), ...(local.plannerSchedule?.weeklySplit || {}) },
      customPlans: { ...(remote.plannerSchedule?.customPlans || {}), ...(local.plannerSchedule?.customPlans || {}) },
      doneMap: { ...(remote.plannerSchedule?.doneMap || {}), ...(local.plannerSchedule?.doneMap || {}) }
    },
    winterArc: { ...(remote.winterArc || {}), ...(local.winterArc || {}) },
    settings: {
      ...DEFAULT_APP_SETTINGS,
      ...(remote.settings || {}),
      ...(local.settings || {})
    }
  };
}

/**
 * Hydrate localStorage from a CloudVaultData snapshot so all existing components work seamlessly.
 */
export function writeVaultToLocalStorage(vault: CloudVaultData) {
  if (!vault.profile) return;
  const nameKey = vault.profile.name || localStorage.getItem('username') || 'Athlete';
  const todayStr = new Date().toLocaleDateString('en-CA');

  try {
    const sleepRecord: Record<string, SleepEntry> = {};
    for (const s of vault.sleepData || []) {
      if (s && s.date) sleepRecord[s.date] = s;
    }

    const unifiedAppState = {
      workoutData: sanitizeWorkoutData(vault.workoutData),
      userProfile: vault.profile,
      steps: vault.stepsHistory || { [todayStr]: vault.steps || 0 },
      water: vault.waterHistory || { [todayStr]: vault.water || 0 },
      prs: vault.prs || {},
      sleep: sleepRecord,
      xp: vault.xp || 0,
      missions: vault.missions || [],
      missionsDate: todayStr
    };

    localStorage.setItem('username', nameKey);
    localStorage.setItem('lv_current_user', JSON.stringify(vault.profile));
    localStorage.setItem(`lv_data_${nameKey}`, JSON.stringify(unifiedAppState));
    localStorage.setItem(`lv_prs_${nameKey}`, JSON.stringify(vault.prs || {}));
    localStorage.setItem(`lv_steps_${nameKey}_${todayStr}`, String(vault.steps || 0));
    localStorage.setItem(`lv_steps_history_${nameKey}`, JSON.stringify(vault.stepsHistory || {}));
    localStorage.setItem(`lv_water_${nameKey}_${todayStr}`, String(vault.water || 0));
    localStorage.setItem(`lv_water_history_${nameKey}`, JSON.stringify(vault.waterHistory || {}));
    localStorage.setItem(`lv_sleep_${nameKey}`, JSON.stringify(vault.sleepData || []));
    localStorage.setItem(`lv_nutrition_logs_${nameKey}`, JSON.stringify(vault.nutritionLogs || {}));
    localStorage.setItem(`lv_custom_foods_${nameKey}`, JSON.stringify(vault.customFoods || []));
    localStorage.setItem(`lv_saved_meals_${nameKey}`, JSON.stringify(vault.savedMeals || []));
    localStorage.setItem(`lv_body_metrics_${nameKey}`, JSON.stringify(vault.bodyMetricsHistory || []));
    localStorage.setItem(`lv_settings_${nameKey}`, JSON.stringify(vault.settings || DEFAULT_APP_SETTINGS));

    if (vault.xp !== undefined) {
      localStorage.setItem('user-xp', String(vault.xp));
    }
    if (vault.winterArc) {
      localStorage.setItem('lvl_winter_arc', JSON.stringify(vault.winterArc));
    }
  } catch (e) {
    console.warn('LocalStorage write warning:', e);
  }
}

export async function pushVaultToCloud(vault: CloudVaultData): Promise<boolean> {
  if (!vault.uid) return false;
  const path = `users/${vault.uid}`;
  try {
    const cleanPayload = JSON.parse(JSON.stringify(vault));
    await setDoc(doc(db, 'users', vault.uid), cleanPayload, { merge: true });
    return true;
  } catch (err: any) {
    if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    console.warn('Cloud sync deferred (offline or network):', err);
    return false;
  }
}

export async function pullVaultFromCloud(uid: string): Promise<Partial<CloudVaultData> | null> {
  if (!uid) return null;
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as Partial<CloudVaultData>;
    }
    return null;
  } catch (err: any) {
    if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(err, OperationType.GET, path);
    }
    console.warn('Failed to fetch cloud vault:', err);
    return null;
  }
}
