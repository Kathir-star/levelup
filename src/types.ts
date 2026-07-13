export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  streakCount: number;
  lastActiveDate: string;
  onboardingCompleted: boolean;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weightTarget?: number; // in kg or lbs
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface Workout {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  duration: number; // in minutes
  exercises: Exercise[];
  notes?: string;
  intensity?: 'Low' | 'Medium' | 'High';
}

export interface ProgressLog {
  id: string;
  userId: string;
  weight: number; // in kg or lbs
  bmi: number;
  bodyFat: number; // percentage
  date: string; // YYYY-MM-DD
}

export interface ProteinLog {
  id: string;
  userId: string;
  amount: number; // in grams
  date: string; // YYYY-MM-DD
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string; // YYYY-MM-DD
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'workout' | 'streak' | 'pr';
  unlocked: boolean;
  unlockedAt?: string;
}
