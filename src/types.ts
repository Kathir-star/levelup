export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'abs';

export type FitnessGoal = 'Muscle Gain' | 'Fat Loss' | 'Maintenance' | 'Body Recomposition' | 'Athletic Performance';
export type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Athlete';
export type DietaryPreference = 'Vegetarian' | 'Eggetarian' | 'Non-Vegetarian' | 'Vegan';

export interface Exercise {
  id: string;
  name: string;
  type: 'COMPOUND' | 'ISOLATION';
  sets: string;
  reps: string;
  rest: string;
  cue: string;
  mistake: string;
  gif?: string;
}

export interface SetDetail {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup?: boolean;
  completed?: boolean;
}

export interface WorkoutEntry {
  id: string;
  exerciseName: string;
  muscle: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
  setDetails?: SetDetail[];
  notes?: string;
  duration?: number;
  date: string;
  timestamp: string;
  isPR?: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
  uid?: string;
  height: number; // cm
  weight: number; // kg
  targetWeight?: number; // kg
  age: number;
  gender: 'male' | 'female';
  neck: number; // cm
  waist: number; // cm
  hip?: number; // cm (for female)
  goal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  dietPreference?: DietaryPreference;
}

export interface PR {
  weight: number;
  reps: number;
  date: string;
  estimated1RM?: number;
}

export interface SleepEntry {
  id?: string;
  date: string;
  bedTime?: string;
  wakeTime?: string;
  hours: number;
  quality: 'Poor' | 'Average' | 'Good' | 'Excellent';
  notes?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  completed: boolean;
  xp: number;
  type: 'steps' | 'workout' | 'water' | 'sleep' | 'nutrition';
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'South Indian' | 'Protein' | 'Grains & Carbs' | 'Dairy & Beverages' | 'Fruits & Veggies' | 'Snacks & Fast Food' | 'Custom';
  servingUnit: 'piece' | 'bowl' | 'cup' | 'plate' | 'tbsp' | 'scoop' | '100g' | 'glass' | 'packet';
  servingLabel: string; // e.g., "1 piece (50g)" or "1 medium bowl (150g)"
  gramsPerUnit: number;
  calories: number; // per 1 servingUnit
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar?: number;
  sodium?: number; // mg
  isVeg?: boolean;
  isCustom?: boolean;
}

export type MealSlot = 'Breakfast' | 'Mid-Morning' | 'Lunch' | 'Evening Snack' | 'Pre-Workout' | 'Post-Workout' | 'Dinner';

export interface LoggedFoodEntry {
  id: string;
  foodId: string;
  foodName: string;
  mealSlot: MealSlot;
  quantity: number;
  unitMode: 'serving' | 'grams'; // whether quantity is in servingUnit or grams
  servingLabel: string;
  gramsTotal: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  date: string; // YYYY-MM-DD
  timestamp: string;
}

export interface SavedMealTemplate {
  id: string;
  name: string;
  items: {
    foodId: string;
    foodName: string;
    quantity: number;
    unitMode: 'serving' | 'grams';
  }[];
}

export interface BodyMetricEntry {
  id: string;
  date: string;
  weight: number;
  height: number;
  waist: number;
  neck: number;
  hip?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  bmi: number;
  bodyFat: number;
  leanMass: number;
  fatMass: number;
}

export interface AppSettings {
  units: 'metric' | 'imperial';
  calorieTarget: number; // 0 = auto-calculated
  proteinTarget: number; // 0 = auto-calculated
  carbsTarget: number;
  fatsTarget: number;
  fiberTarget: number;
  waterGoalMl: number;
  stepGoal: number;
  sleepGoalHours: number;
  workoutDaysTarget: number;
  autoSyncCloud: boolean;
  notificationsEnabled: boolean;
  tamilQuotes: boolean;
}
