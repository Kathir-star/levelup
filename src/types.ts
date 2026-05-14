export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Biceps' | 'Triceps' | 'Shoulder' | 'Abs' | 'Cardio' | 'Full Body' | 'Glutes' | 'Hamstrings' | 'Quadriceps';

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  intensity?: 'beginner' | 'intermediate' | 'advanced';
  image?: string;
  notes?: string;
}

export interface DayPlan {
  day: string;
  focus: string;
  rest?: boolean;
  exercises?: Exercise[];
  tip?: string;
  color?: string;
}

export interface WeeklyPlan {
  name: string;
  tip: string;
  days: DayPlan[];
}

export interface WorkoutEntry {
  muscle: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
  notes?: string;
  time: string;
  date: string;
  timestamp?: any;
}

export interface UserProfile {
  name: string;
  height?: number;
  weight?: number;
  goal?: 'loss' | 'maintain' | 'gain';
  age?: number;
  gender?: 'male' | 'female';
  level?: 'beginner' | 'intermediate' | 'advanced';
  updatedAt?: any;
  role?: 'user' | 'admin';
}

export interface PR {
  weight: number;
  reps: number;
  date: string;
}

export interface SleepEntry {
  hours: number;
  quality: 'Poor' | 'Average' | 'Good';
  date: string;
}

export interface WaterEntry {
  amount: number; // in ml
  date: string;
  timestamp: string;
}

export type MoodType = '😄' | '😐' | '😞' | '😤' | '😴';

export interface MoodEntry {
  mood: MoodType;
  date: string;
  timestamp: string;
}

export interface UserStats {
  streak: number;
  lastWorkout: string;
  totalWorkouts: number;
}
