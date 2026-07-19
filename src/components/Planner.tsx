import { useState, useEffect } from 'react';
import { UserProfile, MuscleGroup, Exercise, DayPlan } from '../types';
import { cn } from '../lib/utils';
import { 
  Calculator, 
  ClipboardList, 
  TrendingUp, 
  Droplets, 
  Flame, 
  Plus, 
  Trash2, 
  Timer as TimerIcon, 
  CheckCircle2, 
  Save,
  X,
  Play,
  Zap,
  Share2,
  Copy,
  Brain,
  ShieldCheck,
  Check,
  ChevronRight,
  Sparkles,
  Utensils,
  Dumbbell,
  Scale,
  Calendar,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CircularTimer from './common/CircularTimer';
import SessionTimer, { calculateWorkoutDuration } from './common/SessionTimer';
import confetti from 'canvas-confetti';

interface PlannerProps {
  userName: string;
  onProfileUpdate: (profile: UserProfile) => void;
  onAddXp?: (amount: number) => void;
  triggerToast?: (msg: string, type?: string) => void;
}

// Extract clean diet lists from images
const INGREDIENT_DATABASE = {
  proteins: [
    { name: "Paneer", serving: "100g", protein: 18, carbs: 1.2, fat: 20, cal: 260 },
    { name: "Whole Eggs", serving: "3 large", protein: 18, carbs: 1.8, fat: 15, cal: 215 },
    { name: "Chicken Breast", serving: "150g", protein: 46, carbs: 0, fat: 4, cal: 220 },
    { name: "Fish (Salmon/Tuna)", serving: "150g", protein: 35, carbs: 0, fat: 8, cal: 210 },
    { name: "Whey Protein", serving: "1 scoop", protein: 25, carbs: 2, fat: 1.5, cal: 120 },
    { name: "Milk (Double Toned)", serving: "250ml", protein: 8, carbs: 12, fat: 4.5, cal: 120 },
    { name: "Greek Yogurt / Curd", serving: "200g", protein: 15, carbs: 6, fat: 4, cal: 120 },
    { name: "Soy Chunks", serving: "50g", protein: 26, carbs: 16, fat: 0.5, cal: 170 },
    { name: "Tofu", serving: "150g", protein: 12, carbs: 2.5, fat: 6, cal: 110 },
    { name: "Moong Dal", serving: "100g dry", protein: 24, carbs: 56, fat: 1.2, cal: 330 },
    { name: "Chana (Chickpeas)", serving: "100g dry", protein: 19, carbs: 60, fat: 6, cal: 370 }
  ],
  carbohydrates: [
    { name: "White/Brown Rice", serving: "100g raw", protein: 7, carbs: 78, fat: 1, cal: 350 },
    { name: "Roti (Whole Wheat)", serving: "2 pieces", protein: 6, carbs: 32, fat: 1, cal: 160 },
    { name: "Oats", serving: "60g dry", protein: 8, carbs: 40, fat: 4, cal: 230 },
    { name: "Poha (Flattened Rice)", serving: "75g raw", protein: 5, carbs: 58, fat: 1, cal: 260 },
    { name: "Idli", serving: "3 pieces", protein: 6, carbs: 42, fat: 0.5, cal: 200 },
    { name: "Dosa", serving: "1 plain", protein: 4, carbs: 28, fat: 3, cal: 160 },
    { name: "Sweet Potato", serving: "150g boiled", protein: 2, carbs: 30, fat: 0.2, cal: 130 },
    { name: "Potato", serving: "150g boiled", protein: 3, carbs: 32, fat: 0.1, cal: 140 },
    { name: "Ragi (Finger Millet)", serving: "50g dry", protein: 4, carbs: 36, fat: 1, cal: 170 },
    { name: "Banana", serving: "1 medium", protein: 1.3, carbs: 27, fat: 0.3, cal: 105 }
  ],
  fats: [
    { name: "Desi Ghee", serving: "1 tbsp", protein: 0, carbs: 0, fat: 14, cal: 125 },
    { name: "Butter", serving: "10g", protein: 0.1, carbs: 0.1, fat: 8.1, cal: 74 },
    { name: "Coconut Oil", serving: "1 tbsp", protein: 0, carbs: 0, fat: 13.6, cal: 120 },
    { name: "Olive Oil / Mustard Oil", serving: "1 tbsp", protein: 0, carbs: 0, fat: 14, cal: 124 },
    { name: "Peanuts / Almonds", serving: "30g", protein: 7, carbs: 6, fat: 15, cal: 180 },
    { name: "Cashews / Walnuts", serving: "30g", protein: 5, carbs: 8, fat: 16, cal: 190 },
    { name: "Chia / Pumpkin Seeds", serving: "15g", protein: 3, carbs: 5, fat: 6, cal: 85 },
    { name: "Egg Yolk", serving: "2 yolks", protein: 6, carbs: 0.6, fat: 10, cal: 115 }
  ]
};

// 10 Daily Success Habits extracted from images
const TEN_SUCCESS_HABITS = [
  { id: 'h1', name: "Fasting Protocol", desc: "Maintain a clean 14-16 hour fasting window.", icon: Utensils, category: "diet" },
  { id: 'h2', name: "Prepared Outfit", desc: "Lay out training outfit and shoes the night before.", icon: ShieldCheck, category: "discipline" },
  { id: 'h3', name: "Mindful Breath", desc: "Perform box-breathing (4-4-4-4) to lower stress.", icon: Brain, category: "mindfulness" },
  { id: 'h4', name: "Hydration Guard", desc: "Drink 3-4 liters of absolute pure water.", icon: Droplets, category: "water" },
  { id: 'h5', name: "8H Sleep Rest", desc: "Secure 8 hours of deep, dark, restful sleep.", icon: Flame, category: "sleep" },
  { id: 'h6', name: "Gym Bag Prep", desc: "Pack shaker, wraps, weights diary, and logs.", icon: Dumbbell, category: "discipline" },
  { id: 'h7', name: "Weight Scale Log", desc: "Step on the scale first thing in the morning.", icon: Scale, category: "bio" },
  { id: 'h8', name: "Food Scale Weighing", desc: "Weigh clean ingredients on the digital scale.", icon: Calculator, category: "diet" },
  { id: 'h9', name: "Compound Lifts Focus", desc: "Dedicate 1 lift to heavy progressive overload.", icon: Zap, category: "workout" },
  { id: 'h10', name: "Active Walk Recovery", desc: "Complete 20 minutes of steady active walking.", icon: TrendingUp, category: "recovery" }
];

// Presets based on goals
const PRESET_WORKOUTS = {
  loss: [
    { day: "Monday", focus: "Push (Chest/Triceps)", rest: false, type: "Strength", exercises: [
      { name: "Incline Barbell Bench Press", sets: "4", reps: "8-10", rest: "90s" },
      { name: "Dumbbell Shoulder Press", sets: "3", reps: "10-12", rest: "75s" },
      { name: "Weighted Chest Dips", sets: "3", reps: "10", rest: "60s" },
      { name: "Overhead Tricep Extension", sets: "3", reps: "12", rest: "60s" },
      { name: "High Incline Cardio Walk", sets: "1", reps: "15 mins", rest: "0s" }
    ]},
    { day: "Tuesday", focus: "Pull (Back/Biceps)", rest: false, type: "Strength", exercises: [
      { name: "Deadlift (Heavy)", sets: "3", reps: "5", rest: "120s" },
      { name: "Weighted Pull-Ups", sets: "4", reps: "6-8", rest: "90s" },
      { name: "One Arm Dumbbell Row", sets: "3", reps: "10-12", rest: "75s" },
      { name: "Incline Hammer Curl", sets: "3", reps: "12", rest: "60s" }
    ]},
    { day: "Wednesday", focus: "Rest & Active Walk", rest: true, type: "Rest", exercises: [] },
    { day: "Thursday", focus: "Legs (Lower Body)", rest: false, type: "Strength", exercises: [
      { name: "Heavy Barbell Squats", sets: "4", reps: "6-8", rest: "120s" },
      { name: "Romanian Deadlift", sets: "4", reps: "10", rest: "90s" },
      { name: "Bulgarian Split Squats", sets: "3", reps: "10/leg", rest: "75s" },
      { name: "Seated Calf Raises", sets: "4", reps: "15", rest: "60s" }
    ]},
    { day: "Friday", focus: "Metabolic HIIT Burner", rest: false, type: "HIIT", exercises: [
      { name: "Kettlebell Swings", sets: "4", reps: "20", rest: "45s" },
      { name: "Dumbbell Thrusters", sets: "4", reps: "12", rest: "45s" },
      { name: "Burpees", sets: "4", reps: "10", rest: "45s" },
      { name: "Plank Shoulder Taps", sets: "3", reps: "1 min", rest: "30s" }
    ]},
    { day: "Saturday", focus: "LISS Cardio & Core", rest: false, type: "Cardio", exercises: [
      { name: "Incline Treadmill Walk", sets: "1", reps: "30 mins", rest: "0s" },
      { name: "Hanging Leg Raises", sets: "3", reps: "15", rest: "60s" },
      { name: "Ab Wheel Rollouts", sets: "3", reps: "12", rest: "60s" }
    ]},
    { day: "Sunday", focus: "Active Recovery Rest", rest: true, type: "Rest", exercises: [] }
  ],
  gain: [
    { day: "Monday", focus: "Push (Heavy Chest Focus)", rest: false, type: "Strength", exercises: [
      { name: "Barbell Bench Press", sets: "4", reps: "6-8", rest: "120s" },
      { name: "Incline Dumbbell Press", sets: "4", reps: "8-10", rest: "90s" },
      { name: "Dumbbell Lateral Raises", sets: "4", reps: "12-15", rest: "60s" },
      { name: "Skull Crushers", sets: "3", reps: "10", rest: "75s" }
    ]},
    { day: "Tuesday", focus: "Pull (Heavy Back Thickness)", rest: false, type: "Strength", exercises: [
      { name: "Conventional Deadlifts", sets: "4", reps: "5", rest: "150s" },
      { name: "Barbell Rows", sets: "4", reps: "6-8", rest: "90s" },
      { name: "Close Grip Lat Pulldown", sets: "3", reps: "10", rest: "75s" },
      { name: "Barbell Bicep Curls", sets: "3", reps: "10", rest: "60s" }
    ]},
    { day: "Wednesday", focus: "Mid-Week Recovery", rest: true, type: "Rest", exercises: [] },
    { day: "Thursday", focus: "Legs (Quad & Calves Heavy)", rest: false, type: "Strength", exercises: [
      { name: "Heavy Squats", sets: "5", reps: "5", rest: "150s" },
      { name: "Leg Press (High Volume)", sets: "4", reps: "12", rest: "90s" },
      { name: "Leg Curls", sets: "3", reps: "12", rest: "60s" },
      { name: "Standing Calf Raises", sets: "4", reps: "15", rest: "60s" }
    ]},
    { day: "Friday", focus: "Shoulders & Arms Volume", rest: false, type: "Strength", exercises: [
      { name: "Overhead Barbell Press", sets: "4", reps: "6-8", rest: "90s" },
      { name: "Incline Dumbbell Bicep Curl", sets: "3", reps: "10", rest: "60s" },
      { name: "Rope Tricep Pushdowns", sets: "3", reps: "12", rest: "60s" },
      { name: "Cable Lateral Raises", sets: "3", reps: "15", rest: "45s" }
    ]},
    { day: "Saturday", focus: "Posterior Chain / Active Rest", rest: false, type: "Strength", exercises: [
      { name: "Romanian Deadlifts", sets: "4", reps: "8", rest: "90s" },
      { name: "Weighted Pull-Ups", sets: "3", reps: "8", rest: "90s" },
      { name: "Decline Weighted Crunches", sets: "3", reps: "15", rest: "60s" }
    ]},
    { day: "Sunday", focus: "CNS Sleep Recovery", rest: true, type: "Rest", exercises: [] }
  ],
  maintain: [
    { day: "Monday", focus: "Full Body Compound", rest: false, type: "Strength", exercises: [
      { name: "Barbell Back Squats", sets: "4", reps: "8", rest: "90s" },
      { name: "Dumbbell Bench Press", sets: "4", reps: "8", rest: "90s" },
      { name: "Pull-Ups", sets: "3", reps: "8-10", rest: "75s" },
      { name: "Dumbbell Hammer Curls", sets: "3", reps: "12", rest: "60s" }
    ]},
    { day: "Tuesday", focus: "Steady State LISS", rest: false, type: "Cardio", exercises: [
      { name: "Steady Jog / Elliptical", sets: "1", reps: "30 mins", rest: "0s" },
      { name: "Plank Hold", sets: "3", reps: "1 min", rest: "45s" }
    ]},
    { day: "Wednesday", focus: "Active Stretching Rest", rest: true, type: "Rest", exercises: [] },
    { day: "Thursday", focus: "Upper Body Hypertrophy", rest: false, type: "Strength", exercises: [
      { name: "Incline Barbell Press", sets: "4", reps: "10", rest: "75s" },
      { name: "Seated Cable Rows", sets: "4", reps: "10", rest: "75s" },
      { name: "Overhead Dumbbell Extension", sets: "3", reps: "12", rest: "60s" },
      { name: "Lateral Raises", sets: "3", reps: "15", rest: "45s" }
    ]},
    { day: "Friday", focus: "Lower Body / Core", rest: false, type: "Strength", exercises: [
      { name: "Leg Press", sets: "4", reps: "10", rest: "90s" },
      { name: "Romanian Deadlift", sets: "4", reps: "10", rest: "90s" },
      { name: "Hanging Knee Raises", sets: "3", reps: "15", rest: "60s" }
    ]},
    { day: "Saturday", focus: "HIIT Cardio Conditioning", rest: false, type: "HIIT", exercises: [
      { name: "Kettlebell Swings", sets: "3", reps: "15", rest: "30s" },
      { name: "Burpees", sets: "3", reps: "10", rest: "30s" },
      { name: "Mountain Climbers", sets: "3", reps: "30s", rest: "30s" }
    ]},
    { day: "Sunday", focus: "Clean Mind Mindfulness Rest", rest: true, type: "Rest", exercises: [] }
  ]
};

export default function Planner({ userName, onProfileUpdate, onAddXp, triggerToast }: PlannerProps) {
  const today = new Date().toLocaleDateString('en-CA');

  // STATE: Profiles & Calculators
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lvProfile');
    return saved ? JSON.parse(saved) : {
      name: userName,
      age: 24,
      gender: 'male',
      weight: 75,
      height: 175,
      goal: 'loss',
      level: 'beginner'
    };
  });

  const [activeTabSub, setActiveTabSub] = useState<'scheduler' | 'meals' | 'habits' | 'profile'>('scheduler');

  // "Sakthi Alavu" Multiplier states
  const [sakthiMultiplier, setSakthiMultiplier] = useState<number>(() => {
    const saved = localStorage.getItem('lvl_multiplier');
    if (saved) return Number(saved);
    // Suggest default multiplier based on goal
    return profile.goal === 'loss' ? 11 : (profile.goal === 'gain' ? 17 : 14);
  });

  // Calculate dynamic Sakthi Alavu calories
  const sakthiCalories = Math.round((profile.weight || 75) * 2.2 * sakthiMultiplier);
  
  // Macros breakdown based on goal constraints
  const proteinGrams = Math.round((profile.weight || 75) * 2.2); // Elite requirement: 2.2g per kg
  const proteinCalories = proteinGrams * 4;
  const fatCalories = Math.round(sakthiCalories * 0.22); // Healthy Fats: 22% of total calories
  const fatGrams = Math.round(fatCalories / 9);
  const remainingCalories = sakthiCalories - proteinCalories - fatCalories;
  const carbGrams = Math.max(20, Math.round(remainingCalories / 4));

  // Sync to parent/local when stats change
  useEffect(() => {
    localStorage.setItem('lvProfile', JSON.stringify(profile));
    localStorage.setItem('lvl_multiplier', String(sakthiMultiplier));
  }, [profile, sakthiMultiplier]);

  // Handle Multiplier preset picker
  const getMultiplierLabel = (val: number) => {
    if (val <= 9) return `Extreme Loss (Multiplier: ${val}) 💀`;
    if (val <= 12) return `Moderate Loss (Multiplier: ${val}) 💧`;
    if (val <= 15) return `Maintenance (Multiplier: ${val}) ⚖️`;
    if (val <= 18) return `Moderate Gain (Multiplier: ${val}) 🍗`;
    return `Extreme Gain (Multiplier: ${val}) 🔥`;
  };

  // State: Weekly Workout Scheduler
  const [schedulerPlan, setSchedulerPlan] = useState<any[]>(() => {
    const saved = localStorage.getItem('lvl_scheduler_plan');
    if (saved) return JSON.parse(saved);
    // fallback to preset
    return PRESET_WORKOUTS[profile.goal || 'loss'];
  });

  // State: Workouts completed today / this week
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('lvl_completed_days');
    return saved ? JSON.parse(saved) : {};
  });

  // State: Weekly Scheduler custom adds
  const [isAddingToDayIdx, setIsAddingToDayIdx] = useState<number | null>(null);
  const [newEx, setNewEx] = useState<Exercise>({ name: '', sets: '3', reps: '10', rest: '60s' });

  // State: Follow Plan toggle on daily meals
  const [followPlanActive, setFollowPlanActive] = useState<boolean>(() => {
    return localStorage.getItem(`lvl_follow_meals_${today}`) === 'true';
  });

  // State: Individual meal checks for adherence tracking
  const [checkedMeals, setCheckedMeals] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`lvl_checked_meals_${today}`);
    return saved ? JSON.parse(saved) : { breakfast: false, lunch: false, snack: false, dinner: false };
  });

  // State: Habits checked today
  const [habitsChecked, setHabitsChecked] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`lvl_habits_${today}`);
    return saved ? JSON.parse(saved) : {};
  });

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Social Share
  const [sharingDay, setSharingDay] = useState<any | null>(null);
  const [customSnippetText, setCustomSnippetText] = useState('');
  const [snippetPreset, setSnippetPreset] = useState<'standard' | 'minimal' | 'story'>('standard');

  // Adherence calculation
  const totalCheckedMeals = Object.values(checkedMeals).filter(Boolean).length;
  const mealAdherencePct = Math.round((totalCheckedMeals / 4) * 100);

  // Auto assignment of plans when goal updates
  const handleGoalUpdate = (newGoal: 'loss' | 'maintain' | 'gain') => {
    const updated = { ...profile, goal: newGoal };
    setProfile(updated);
    onProfileUpdate(updated);

    // Auto update multiplier Suggestion
    const suggestedMult = newGoal === 'loss' ? 11 : (newGoal === 'gain' ? 17 : 14);
    setSakthiMultiplier(suggestedMult);

    // Auto populate matching scheduler routines
    const defaultRoutines = PRESET_WORKOUTS[newGoal];
    setSchedulerPlan(defaultRoutines);
    localStorage.setItem('lvl_scheduler_plan', JSON.stringify(defaultRoutines));

    if (triggerToast) {
      triggerToast(`🎯 Profile updated! Routine pre-assigned for ${newGoal.toUpperCase()} with Sakthi Alavu multiplier.`, "success");
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    onProfileUpdate(updated);
  };

  // Workout marking as completed
  const toggleDayCompletion = (dayName: string) => {
    const updated = { ...completedDays, [dayName]: !completedDays[dayName] };
    setCompletedDays(updated);
    localStorage.setItem('lvl_completed_days', JSON.stringify(updated));

    if (updated[dayName]) {
      // Award XP
      if (onAddXp) onAddXp(60);
      
      // confetti celebration
      confetti({
        particleCount: 100,
        spread: 80,
        colors: ['#ff3333', '#ffffff', '#10b981']
      });

      // Insert workout entry to synchronized global list
      try {
        const storedEntries = localStorage.getItem(`lv_data_${profile.name}`) || localStorage.getItem('workoutData');
        const currentData = storedEntries ? JSON.parse(storedEntries) : {};
        const todayEntries = currentData[today] || [];
        
        // Mock a compound lift log to trigger dashboard visualizers
        const focusDay = schedulerPlan.find(d => d.day === dayName);
        const muscleTarget = focusDay ? focusDay.focus.split(' ')[0] : 'Full Body';
        
        todayEntries.push({
          muscle: muscleTarget as MuscleGroup,
          exerciseName: focusDay?.exercises[0]?.name || "LevelUp Compound Session",
          weight: profile.weight || 75,
          reps: 8,
          sets: 4,
          notes: `Tactical Scheduler Complete for ${dayName}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: today,
          isPR: false
        });
        currentData[today] = todayEntries;
        localStorage.setItem(`lv_data_${profile.name}`, JSON.stringify(currentData));
        localStorage.setItem('workoutData', JSON.stringify(currentData));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {}

      if (triggerToast) {
        triggerToast(`🔥 ${dayName} Training Complete! +60 XP Claimed! Syncing telemetry.`, "success");
      }
    } else {
      if (triggerToast) {
        triggerToast(`🔄 ${dayName} completion reversed.`, "info");
      }
    }
  };

  // Handle custom exercises
  const addCustomExercise = (dayIdx: number) => {
    if (!newEx.name) return;
    const updated = [...schedulerPlan];
    updated[dayIdx].exercises = [...(updated[dayIdx].exercises || []), { ...newEx }];
    updated[dayIdx].rest = false;
    setSchedulerPlan(updated);
    localStorage.setItem('lvl_scheduler_plan', JSON.stringify(updated));
    setNewEx({ name: '', sets: '3', reps: '10', rest: '60s' });
    setIsAddingToDayIdx(null);
    if (triggerToast) triggerToast(`🏋️ Added ${newEx.name} to schedule!`, "success");
  };

  const deleteExercise = (dayIdx: number, exIdx: number) => {
    const updated = [...schedulerPlan];
    updated[dayIdx].exercises = updated[dayIdx].exercises.filter((_: any, idx: number) => idx !== exIdx);
    if (updated[dayIdx].exercises.length === 0) {
      updated[dayIdx].rest = true;
    }
    setSchedulerPlan(updated);
    localStorage.setItem('lvl_scheduler_plan', JSON.stringify(updated));
    if (triggerToast) triggerToast("🗑️ Exercise removed from schedule.", "info");
  };

  // Handle Habit Toggle
  const toggleHabit = (id: string) => {
    const updated = { ...habitsChecked, [id]: !habitsChecked[id] };
    setHabitsChecked(updated);
    localStorage.setItem(`lvl_habits_${today}`, JSON.stringify(updated));

    if (updated[id]) {
      if (onAddXp) onAddXp(10);
      
      // check if all 10 completed
      const allCompleted = TEN_SUCCESS_HABITS.every(h => updated[h.id]);
      if (allCompleted) {
        if (onAddXp) onAddXp(100);
        confetti({
          particleCount: 150,
          spread: 100,
          colors: ['#fbbf24', '#ff3333', '#ffffff']
        });
        if (triggerToast) triggerToast("🏆 ELITE DISCIPLINE! All 10 Daily habits completed! Received +100 XP Bonus!", "success");
      } else {
        if (triggerToast) {
          const habitName = TEN_SUCCESS_HABITS.find(h => h.id === id)?.name;
          triggerToast(`✓ Habit: ${habitName} completed! +10 XP`, "success");
        }
      }
    }
  };

  // Handle Meal Check
  const handleMealToggle = (mealKey: string) => {
    const updated = { ...checkedMeals, [mealKey]: !checkedMeals[mealKey] };
    setCheckedMeals(updated);
    localStorage.setItem(`lvl_checked_meals_${today}`, JSON.stringify(updated));

    if (updated[mealKey]) {
      if (onAddXp) onAddXp(15);
      if (triggerToast) triggerToast(`🥗 Meal log tracked! +15 XP added.`, "success");
    }
  };

  // Handle Follow Plan Toggle
  const handleFollowPlanToggle = () => {
    const nextState = !followPlanActive;
    setFollowPlanActive(nextState);
    localStorage.setItem(`lvl_follow_meals_${today}`, String(nextState));
    if (triggerToast) {
      triggerToast(nextState ? "🥗 Following strict Sakthi Alavu diet plan! Let's lock it in!" : "🔓 Nutrition set to casual mode.", nextState ? "success" : "info");
    }
  };

  // Generate Social Status
  const generateShareSnippet = (day: any, type: 'standard' | 'minimal' | 'story'): string => {
    const intensity = profile.level?.toUpperCase() || 'ELITE';
    if (day.rest) {
      return `🔋 ACTIVE RECOVERY DAY (${day.day}) 🔋\nFocus: ${day.focus}\nDiet Plan: Rest Cleansing & Caloric Deficit\n\nResetting CNS parameters. #LevelUp #Discipline`;
    }
    const durationMin = day.exercises ? Math.round(calculateWorkoutDuration(day.exercises) / 60) : 0;
    const exerciseNames = day.exercises.map((ex: any) => `• ${ex.name} (${ex.sets}x${ex.reps})`).join('\n');
    
    if (type === 'story') {
      return `⚡ TODAY'S COMBAT ⚡\nDay: ${day.day}\nRoutine: ${day.focus}\nMultiplier: ${sakthiMultiplier} (${sakthiCalories} kcal)\n\nLet's get it. #LevelUp`;
    }
    if (type === 'minimal') {
      return `Crushed today's session! ${day.day} - ${day.focus} (${durationMin} mins of intense lifts).`;
    }

    return `⚔️ LEVELUP TACTICAL PLAN COMPLETE ⚔️\nAthlete: ${profile.name}\nFocus: ${day.focus} (${intensity} Intensity)\nDuration: ~${durationMin} mins\n\n🏋️ Compound Lifts Done:\n${exerciseNames}\n\n🥗 Smart Nutrition Linked: ${day.type === 'Strength' ? 'High Protein' : 'High Carb'}\n🎯 Target Fuel: ${sakthiCalories} kcal\n\nDiscipline always wins! Join me on LevelUp! 🚀💪`;
  };

  useEffect(() => {
    if (sharingDay) {
      setCustomSnippetText(generateShareSnippet(sharingDay, snippetPreset));
    }
  }, [sharingDay, snippetPreset]);

  // Compute smart diet parameters per meal based on Sakthi Alavu calculations
  const mealCalculations = {
    breakfast: {
      cals: Math.round(sakthiCalories * 0.25),
      prot: Math.round(proteinGrams * 0.25),
      carbs: Math.round(carbGrams * 0.25),
      fats: Math.round(fatGrams * 0.25),
      time: "08:30 AM",
      recommendations: profile.goal === 'loss' 
        ? ["3 Whole Eggs boiled", "60g dry Oats cooked in water", "1 medium Banana", "10 Almonds"]
        : ["4 Whole Eggs scrambled", "80g dry Oats in double toned milk", "1 large Banana", "15 Cashews"]
    },
    lunch: {
      cals: Math.round(sakthiCalories * 0.35),
      prot: Math.round(proteinGrams * 0.35),
      carbs: Math.round(carbGrams * 0.35),
      fats: Math.round(fatGrams * 0.35),
      time: "01:30 PM",
      recommendations: profile.goal === 'loss'
        ? ["150g raw weighed White Rice cooked", "150g Skinless Chicken Breast or 150g Grilled Tofu", "150g Fresh Curd / Yogurt", "Salad bowl"]
        : ["200g raw weighed White Rice cooked", "200g Skinless Chicken Breast or 200g Paneer/Soy Chunks", "200g Fresh Curd with 1 tsp Desi Ghee", "Salad"]
    },
    snack: {
      cals: Math.round(sakthiCalories * 0.15),
      prot: Math.round(proteinGrams * 0.15),
      carbs: Math.round(carbGrams * 0.15),
      fats: Math.round(fatGrams * 0.15),
      time: "05:30 PM",
      recommendations: profile.goal === 'loss'
        ? ["1 scoop Whey Protein in water", "100g Boiled Sweet Potato", "15g Pumpkin Seeds"]
        : ["1 scoop Whey Protein in 250ml milk", "150g Boiled Sweet Potato", "30g Peanuts", "1 whole Apple"]
    },
    dinner: {
      cals: Math.round(sakthiCalories * 0.25),
      prot: Math.round(proteinGrams * 0.25),
      carbs: Math.round(carbGrams * 0.25),
      fats: Math.round(fatGrams * 0.25),
      time: "08:30 PM",
      recommendations: profile.goal === 'loss'
        ? ["2 Wheat Roti", "150g Paneer cooked or Grilled Fish", "1 tsp Olive Oil", "Steamed broccoli / veggies"]
        : ["3 Wheat Roti", "200g Paneer cooked or Grilled Fish", "1.5 tbsp Desi Ghee / Olive Oil", "Mixed vegetable curry"]
    }
  };

  // Resolve dynamic Smart Linking recommendations for today
  const todayWorkoutPlan = schedulerPlan.find(d => d.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const smartLinkingType = todayWorkoutPlan?.type || "Rest";

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* 👑 LevelUp Command HUD Header */}
      <div className="bg-gradient-to-br from-[#0c0c0c] to-[#030303] border-b-2 border-[var(--accent)] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-red-600 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[var(--accent-glow)]">
            <Brain size={36} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] bg-red-500/20 text-red-500 px-2.5 py-1 rounded-full border border-red-500/20 tracking-widest font-black uppercase">TACTICAL COMMAND CENTER</span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mt-1.5 uppercase italic">LEVELUP STRATEGIST</h2>
            <p className="text-[10px] sm:text-xs text-[var(--muted)] font-black uppercase tracking-wider mt-1 flex items-center gap-2">
              ⚡ Unified Workout, Sakthi Alavu Diet & 10 Habits Loop
            </p>
          </div>
        </div>
        
        {/* Subtab Segmented Controls */}
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 w-full md:w-auto z-10 overflow-x-auto no-scrollbar">
          {(['scheduler', 'meals', 'habits', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTabSub(tab)}
              className={cn(
                "flex-1 md:flex-initial px-5 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                activeTabSub === tab 
                  ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]" 
                  : "text-[var(--muted)] hover:text-white hover:bg-white/5"
              )}
            >
              {tab === 'scheduler' && '🏋️ Scheduler'}
              {tab === 'meals' && '🥗 Daily Meals'}
              {tab === 'habits' && '🔥 10 Habits'}
              {tab === 'profile' && '⚖️ Setup & Calc'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Switch Content */}
      <div className="space-y-6">
        
        {/* SUBTAB 1: WORKOUT SCHEDULER */}
        {activeTabSub === 'scheduler' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Header / Insight Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-[var(--card)] p-5 border border-[var(--border)] rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Training Target</h4>
                  <p className="text-2xl font-display font-black text-white uppercase italic mt-1.5">
                    {profile.goal === 'loss' ? 'Weight Loss (-10kg)' : (profile.goal === 'gain' ? 'Weight Gain (+10kg)' : 'Maintain Power')}
                  </p>
                </div>
                <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-4">
                  💪 Pre-programmed with compound lifting routines
                </div>
              </div>

              <div className="bg-[var(--card)] p-5 border border-[var(--border)] rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Dynamic Fuel Link</h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">{smartLinkingType} Day</p>
                      <p className="text-[10px] text-neutral-400 uppercase font-semibold">
                        {smartLinkingType === 'Strength' && '🥩 High Protein & Mod Carbs (Build)'}
                        {smartLinkingType === 'HIIT' && '🍚 High Carbs & Low Fats (Replenish)'}
                        {smartLinkingType === 'Cardio' && '🍚 High Carbs & Low Fats (Replenish)'}
                        {smartLinkingType === 'Rest' && '🔋 Intermittent Fasting / Rest Cleansing'}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-[9px] bg-amber-500/10 text-amber-400 py-1 px-2.5 rounded border border-amber-500/15 font-black uppercase tracking-widest text-center mt-3">
                  Smart Linking Active
                </span>
              </div>

              <div className="bg-[var(--card)] p-5 border border-[var(--border)] rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Completed Lifts Streak</h4>
                  <div className="text-3xl font-display font-black text-emerald-400 italic uppercase tracking-wider mt-1">
                     🔥 {Object.values(completedDays).filter(Boolean).length} / 7 Days
                  </div>
                </div>
                <p className="text-[9px] text-[var(--muted)] uppercase font-semibold tracking-wider mt-4">
                  Each checked training awards 60 XP and syncs to logs
                </p>
              </div>

            </div>

            {/* Weekly Schedule Days list */}
            <div className="space-y-4">
              <h3 className="tab-heading text-white flex items-center gap-2">
                <Calendar size={18} className="text-[var(--accent)]" />
                Your Weekly Training Split
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {schedulerPlan.map((day, dIdx) => {
                  const isDayDone = completedDays[day.day] || false;
                  return (
                    <div 
                      key={day.day} 
                      className={cn(
                        "bg-[var(--card)] border rounded-2xl overflow-hidden transition-all group",
                        isDayDone ? "border-emerald-500/40 shadow-lg shadow-emerald-950/5" : "border-[var(--border)] hover:border-[var(--accent)]/50"
                      )}
                    >
                      {/* Top bar of card */}
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/15 border-b border-[var(--border)]">
                        <div className="flex items-center gap-4">
                          {/* Check completion button */}
                          <button
                            onClick={() => toggleDayCompletion(day.day)}
                            className={cn(
                              "w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer",
                              isDayDone 
                                ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                                : "border-white/10 text-transparent hover:border-white/40 hover:bg-white/5"
                            )}
                          >
                            <Check size={16} strokeWidth={3} />
                          </button>
                          
                          <div>
                            <div className="flex items-center gap-2 leading-none">
                              <span className="text-[11px] font-black text-[var(--accent)] uppercase tracking-wider">{day.day}</span>
                              <span className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                                day.type === 'Strength' ? "bg-red-500/10 text-red-400 border border-red-500/15" :
                                day.type === 'HIIT' ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
                                day.type === 'Cardio' ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" :
                                "bg-white/5 text-[var(--muted)] border border-white/5"
                              )}>
                                {day.type}
                              </span>
                            </div>
                            <h4 className="text-lg font-display text-white uppercase italic tracking-wider mt-1 group-hover:text-[var(--accent)] transition-colors">{day.focus}</h4>
                          </div>
                        </div>

                        {/* Action section of day */}
                        <div className="flex items-center gap-2.5 self-end sm:self-center">
                          {!day.rest && day.exercises?.length > 0 && (
                            <SessionTimer 
                              totalTime={calculateWorkoutDuration(day.exercises)}
                              onComplete={() => toggleDayCompletion(day.day)}
                              dayName={day.day}
                            />
                          )}

                          <button 
                            onClick={() => setIsAddingToDayIdx(dIdx)}
                            className="p-2 rounded-xl bg-[var(--sub)] border border-[var(--border)] hover:border-white text-[var(--muted)] hover:text-white transition-all cursor-pointer"
                            title="Add exercise to day"
                          >
                            <Plus size={16} />
                          </button>

                          <button 
                            onClick={() => {
                              setSharingDay(day);
                              setSnippetPreset('standard');
                            }}
                            className="p-2 rounded-xl bg-[var(--sub)] border border-[var(--border)] hover:border-white text-[var(--muted)] hover:text-white transition-all cursor-pointer"
                            title="Export share status"
                          >
                            <Share2 size={16} />
                          </button>

                          {day.rest ? (
                            <span className="text-[9px] font-black bg-white/5 border border-white/5 text-[var(--muted)] py-1.5 px-3 rounded-xl tracking-widest uppercase italic">RECOVERY REST</span>
                          ) : (
                            <span className="text-[9px] font-black bg-red-500/10 border border-red-500/20 text-red-400 py-1.5 px-3 rounded-xl tracking-widest uppercase italic flex items-center gap-1.5">
                              <Flame size={11} /> TRAINING
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Exercises list of day */}
                      {!day.rest && day.exercises?.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-white/[0.03] bg-black/5 text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">
                                <th className="py-2.5 px-5">Exercise Focus</th>
                                <th className="py-2.5 px-5 text-center">Sets</th>
                                <th className="py-2.5 px-5 text-center">Reps</th>
                                <th className="py-2.5 px-5 text-center">Rest Clock</th>
                                <th className="py-2.5 px-5 text-right">Adjust</th>
                              </tr>
                            </thead>
                            <tbody>
                              {day.exercises.map((ex: any, exIdx: number) => (
                                <tr key={exIdx} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-all">
                                  <td className="py-3 px-5">
                                    <div className="font-bold text-white text-sm">{ex.name}</div>
                                    <div className="text-[9px] text-[var(--muted)] uppercase font-black tracking-widest italic mt-0.5">Focus Compound Lift</div>
                                  </td>
                                  <td className="py-3 px-5 text-center font-black text-[var(--accent)] text-sm">{ex.sets}</td>
                                  <td className="py-3 px-5 text-center text-white text-sm font-semibold">{ex.reps}</td>
                                  <td className="py-3 px-5 text-center">
                                    <button 
                                      onClick={() => setTimeLeft(parseInt(ex.rest) || 60)}
                                      className="bg-[var(--sub)] border border-[var(--border)] hover:border-white rounded-lg py-1 px-2.5 text-[10px] font-black text-white transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                      {ex.rest} <TimerIcon size={11} className="text-blue-400" />
                                    </button>
                                  </td>
                                  <td className="py-3 px-5 text-right">
                                    <button 
                                      onClick={() => deleteExercise(dIdx, exIdx)}
                                      className="text-[var(--muted)] hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {day.rest && (
                        <div className="p-8 text-center bg-black/20">
                          <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest italic">🔋 CNS Active Recovery: Walk 20m, Stretch & Breathe Deeply 🌬️</p>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 2: DAILY MEAL PLANNER */}
        {activeTabSub === 'meals' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Sakthi Alavu Live Calculations header */}
            <div className="bg-gradient-to-tr from-[#121212] to-black border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/15 font-black uppercase tracking-widest">SAKTHI ALAVU FORMULATED</span>
                  <h3 className="text-2xl font-display font-black text-white uppercase italic mt-1.5">Daily Calorie & Macro Target</h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold mt-1">
                     Formula: Weight ({profile.weight}kg) × 2.2 × Multiplier ({sakthiMultiplier}) = {sakthiCalories} kcal
                  </p>
                </div>

                {/* Follow Plan Toggle Button */}
                <button
                  onClick={handleFollowPlanToggle}
                  className={cn(
                    "px-6 py-3.5 rounded-xl font-display font-black text-xs uppercase tracking-widest cursor-pointer transition-all shrink-0",
                    followPlanActive 
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black" 
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  )}
                >
                  {followPlanActive ? "✓ Following Plan" : "Follow Plan"}
                </button>
              </div>

              {/* Targets grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-wider">Caloric Intake</div>
                  <div className="text-2xl font-display font-black text-white mt-0.5">{sakthiCalories} kcal</div>
                  <div className="h-1 w-12 bg-emerald-500 rounded mt-1.5" />
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-wider">Protein (Pure Amino)</div>
                  <div className="text-2xl font-display font-black text-red-400 mt-0.5">{proteinGrams}g</div>
                  <div className="h-1 w-12 bg-red-500 rounded mt-1.5" />
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-wider">Carbohydrates</div>
                  <div className="text-2xl font-display font-black text-blue-400 mt-0.5">{carbGrams}g</div>
                  <div className="h-1 w-12 bg-blue-500 rounded mt-1.5" />
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-wider">Healthy Fats</div>
                  <div className="text-2xl font-display font-black text-amber-400 mt-0.5">{fatGrams}g</div>
                  <div className="h-1 w-12 bg-amber-500 rounded mt-1.5" />
                </div>
              </div>

              {/* Progress Bar of Daily Meal Adherence */}
              {followPlanActive && (
                <div className="mt-5 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-emerald-400">Diet Adherence Tracking</span>
                    <span className="text-white">{mealAdherencePct}% Adhered</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden p-[1px]">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                      style={{ width: `${mealAdherencePct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Meal Planner Cards */}
            <div className="space-y-4">
              <h3 className="tab-heading text-white flex items-center gap-2">
                <Utensils size={18} className="text-emerald-400" />
                Daily Meal Schedule & Timings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Breakfast Card */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍳</span>
                        <h4 className="text-base font-display font-black text-white uppercase italic">Breakfast</h4>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--muted)] font-black">{mealCalculations.breakfast.time}</span>
                    </div>

                    <p className="text-xs text-white/95 font-semibold">Recommended LevelUp Fuel Source:</p>
                    <ul className="space-y-1.5 pl-3 list-disc text-xs text-neutral-300">
                      {mealCalculations.breakfast.recommendations.map((item, idx) => (
                        <li key={idx} className="font-medium">{item}</li>
                      ))}
                    </ul>

                    {/* Macros info */}
                    <div className="flex gap-3 pt-3 border-t border-white/5 text-[10px] font-black uppercase text-neutral-400">
                      <span>🔥 {mealCalculations.breakfast.cals} kcal</span>
                      <span>🥩 P: {mealCalculations.breakfast.prot}g</span>
                      <span>🍚 C: {mealCalculations.breakfast.carbs}g</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFollowPlanToggle}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => handleMealToggle('breakfast')}
                    className={cn(
                      "w-full mt-4 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer",
                      checkedMeals.breakfast 
                        ? "bg-emerald-500 border-emerald-500 text-black font-black" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    )}
                  >
                    {checkedMeals.breakfast ? "✓ Eaten & Tracked" : "Mark as Eaten"}
                  </button>
                </div>

                {/* Lunch Card */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍚</span>
                        <h4 className="text-base font-display font-black text-white uppercase italic">Lunch</h4>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--muted)] font-black">{mealCalculations.lunch.time}</span>
                    </div>

                    <p className="text-xs text-white/95 font-semibold">Recommended LevelUp Fuel Source:</p>
                    <ul className="space-y-1.5 pl-3 list-disc text-xs text-neutral-300">
                      {mealCalculations.lunch.recommendations.map((item, idx) => (
                        <li key={idx} className="font-medium">{item}</li>
                      ))}
                    </ul>

                    {/* Macros info */}
                    <div className="flex gap-3 pt-3 border-t border-white/5 text-[10px] font-black uppercase text-neutral-400">
                      <span>🔥 {mealCalculations.lunch.cals} kcal</span>
                      <span>🥩 P: {mealCalculations.lunch.prot}g</span>
                      <span>🍚 C: {mealCalculations.lunch.carbs}g</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMealToggle('lunch')}
                    className={cn(
                      "w-full mt-4 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer",
                      checkedMeals.lunch 
                        ? "bg-emerald-500 border-emerald-500 text-black font-black" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    )}
                  >
                    {checkedMeals.lunch ? "✓ Eaten & Tracked" : "Mark as Eaten"}
                  </button>
                </div>

                {/* Snack Card */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🥛</span>
                        <h4 className="text-base font-display font-black text-white uppercase italic">Evening Snack</h4>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--muted)] font-black">{mealCalculations.snack.time}</span>
                    </div>

                    <p className="text-xs text-white/95 font-semibold">Recommended LevelUp Fuel Source:</p>
                    <ul className="space-y-1.5 pl-3 list-disc text-xs text-neutral-300">
                      {mealCalculations.snack.recommendations.map((item, idx) => (
                        <li key={idx} className="font-medium">{item}</li>
                      ))}
                    </ul>

                    {/* Macros info */}
                    <div className="flex gap-3 pt-3 border-t border-white/5 text-[10px] font-black uppercase text-neutral-400">
                      <span>🔥 {mealCalculations.snack.cals} kcal</span>
                      <span>🥩 P: {mealCalculations.snack.prot}g</span>
                      <span>🍚 C: {mealCalculations.snack.carbs}g</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMealToggle('snack')}
                    className={cn(
                      "w-full mt-4 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer",
                      checkedMeals.snack 
                        ? "bg-emerald-500 border-emerald-500 text-black font-black" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    )}
                  >
                    {checkedMeals.snack ? "✓ Eaten & Tracked" : "Mark as Eaten"}
                  </button>
                </div>

                {/* Dinner Card */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🥩</span>
                        <h4 className="text-base font-display font-black text-white uppercase italic">Dinner</h4>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--muted)] font-black">{mealCalculations.dinner.time}</span>
                    </div>

                    <p className="text-xs text-white/95 font-semibold">Recommended LevelUp Fuel Source:</p>
                    <ul className="space-y-1.5 pl-3 list-disc text-xs text-neutral-300">
                      {mealCalculations.dinner.recommendations.map((item, idx) => (
                        <li key={idx} className="font-medium">{item}</li>
                      ))}
                    </ul>

                    {/* Macros info */}
                    <div className="flex gap-3 pt-3 border-t border-white/5 text-[10px] font-black uppercase text-neutral-400">
                      <span>🔥 {mealCalculations.dinner.cals} kcal</span>
                      <span>🥩 P: {mealCalculations.dinner.prot}g</span>
                      <span>🍚 C: {mealCalculations.dinner.carbs}g</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMealToggle('dinner')}
                    className={cn(
                      "w-full mt-4 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer",
                      checkedMeals.dinner 
                        ? "bg-emerald-500 border-emerald-500 text-black font-black" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    )}
                  >
                    {checkedMeals.dinner ? "✓ Eaten & Tracked" : "Mark as Eaten"}
                  </button>
                </div>
              </div>
            </div>

            {/* Collapse Databases */}
            <div className="bg-[var(--card2)] p-6 rounded-2xl border border-[var(--border)] space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-white">🥗 Clean LevelUp Nutrition Ingredient Sources</h4>
              <p className="text-xs text-neutral-400">Weigh all ingredients on digital food scales raw before cooking for peak macro precision.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                  <h5 className="font-bold text-red-400 uppercase">🥩 Protein Sources</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {INGREDIENT_DATABASE.proteins.map(p => (
                      <span key={p.name} className="px-2 py-1 bg-black/30 rounded text-[10px] text-white/80" title={`${p.serving}: ${p.protein}g Protein`}>{p.name}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                  <h5 className="font-bold text-blue-400 uppercase">🍚 Carb Sources</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {INGREDIENT_DATABASE.carbohydrates.map(c => (
                      <span key={c.name} className="px-2 py-1 bg-black/30 rounded text-[10px] text-white/80" title={`${c.serving}: ${c.carbs}g Carbs`}>{c.name}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                  <h5 className="font-bold text-amber-400 uppercase">🧈 Healthy Fats</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {INGREDIENT_DATABASE.fats.map(f => (
                      <span key={f.name} className="px-2 py-1 bg-black/30 rounded text-[10px] text-white/80" title={`${f.serving}: ${f.fat}g Fat`}>{f.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 3: 10 DAILY HABITS */}
        {activeTabSub === 'habits' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            <div className="relative overflow-hidden bg-gradient-to-tr from-purple-950/20 to-black border-l-4 border-l-purple-500 p-6 rounded-2xl">
              <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/15 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-display font-black text-white uppercase italic">10 Daily Success Habits</h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold">
                     Discipline in small habits aggregates to supreme physical transformation. Track these daily to maintain peak dopamine & CNS function.
                  </p>
                </div>
              </div>

              {/* Progress of habits */}
              <div className="mt-5 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-purple-400">Success Habits Streak</span>
                  <span className="text-white">{Object.values(habitsChecked).filter(Boolean).length} / 10 Completed</span>
                </div>
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-700" 
                    style={{ width: `${(Object.values(habitsChecked).filter(Boolean).length / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Habit grid list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEN_SUCCESS_HABITS.map((habit) => {
                const isChecked = habitsChecked[habit.id] || false;
                const Icon = habit.icon;
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      "p-4 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all select-none group",
                      isChecked 
                        ? "bg-purple-500/10 border-purple-500/30 shadow-md shadow-purple-950/10" 
                        : "bg-[var(--card)] border-[var(--border)] hover:border-purple-500/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                        isChecked ? "bg-purple-500/20 text-purple-300" : "bg-black/20 text-[var(--muted)] group-hover:text-purple-400"
                      )}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <h4 className={cn("text-xs font-black uppercase tracking-wider", isChecked ? "text-white line-through opacity-70" : "text-white")}>
                          {habit.name}
                        </h4>
                        <p className="text-[10px] text-[var(--muted)] leading-tight mt-0.5 font-semibold">
                          {habit.desc}
                        </p>
                      </div>
                    </div>

                    {/* Custom visually pleasing checkbox */}
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                      isChecked 
                        ? "bg-purple-500 border-purple-500 text-black" 
                        : "border-[var(--border)] group-hover:border-purple-500/50"
                    )}>
                      {isChecked && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* SUBTAB 4: PROFILE SETUP & SAKTHI CALCULATOR */}
        {activeTabSub === 'profile' && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-8 animate-in fade-in duration-500">
            
            <div className="flex items-center gap-3 mb-2">
              <Calculator size={22} className="text-[var(--accent)]" />
              <h3 className="text-xl font-display text-white uppercase italic tracking-wider">LevelUp Configurator & Sakthi Alavu Calculator</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest pl-1">Bodyweight (Kg)</label>
                <div className="flex items-center bg-[var(--sub)] border border-[var(--border)] rounded-xl px-4 py-3">
                  <Scale size={16} className="text-[var(--muted)] mr-2 shrink-0" />
                  <input 
                    type="number" 
                    value={profile.weight} 
                    onChange={(e) => handleProfileChange('weight', Number(e.target.value))}
                    className="w-full bg-transparent border-none text-white focus:outline-none font-bold text-sm"
                    placeholder="75"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest pl-1">Body Height (Cm)</label>
                <div className="flex items-center bg-[var(--sub)] border border-[var(--border)] rounded-xl px-4 py-3">
                  <TrendingUp size={16} className="text-[var(--muted)] mr-2 shrink-0" />
                  <input 
                    type="number" 
                    value={profile.height} 
                    onChange={(e) => handleProfileChange('height', Number(e.target.value))}
                    className="w-full bg-transparent border-none text-white focus:outline-none font-bold text-sm"
                    placeholder="175"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest pl-1">Target Transformation Goal</label>
                <select 
                  value={profile.goal}
                  onChange={(e) => handleGoalUpdate(e.target.value as any)}
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--accent)] outline-none font-bold text-sm h-[46px]"
                >
                  <option value="loss">Weight Loss Target (-10kg)</option>
                  <option value="gain">Weight Gain Target (+10kg)</option>
                  <option value="maintain">Maintain Strength & Lean Mass</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest pl-1">Biological Gender</label>
                <select 
                  value={profile.gender}
                  onChange={(e) => handleProfileChange('gender', e.target.value)}
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--accent)] outline-none font-bold text-sm h-[46px]"
                >
                  <option value="male">Male Plan (Push/Pull/Legs focus)</option>
                  <option value="female">Female Plan (Aesthetic symmetry focus)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest pl-1">Athlete Level</label>
                <select 
                  value={profile.level}
                  onChange={(e) => handleProfileChange('level', e.target.value)}
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--accent)] outline-none font-bold text-sm h-[46px]"
                >
                  <option value="beginner">Beginner (3 sessions/week)</option>
                  <option value="intermediate">Intermediate (4-5 sessions/week)</option>
                  <option value="advanced">Advanced Elite (6 sessions/week)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest pl-1">Age</label>
                <input 
                  type="number" 
                  value={profile.age} 
                  onChange={(e) => handleProfileChange('age', Number(e.target.value))}
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--accent)] outline-none font-bold text-sm h-[46px]"
                />
              </div>

            </div>

            {/* Interactive Sakthi Alavu Multiplier Slider */}
            <div className="p-6 bg-black/40 border border-[var(--border)] rounded-2xl space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400 animate-pulse" />
                    Sakthi Alavu Multiplier Settings
                  </h4>
                  <p className="text-[10px] text-neutral-400">Slide to select your precise weekly environmental activity factor.</p>
                </div>
                <span className="text-xs font-black text-amber-400 uppercase bg-amber-500/10 py-1.5 px-3 rounded-lg border border-amber-500/15">
                  {getMultiplierLabel(sakthiMultiplier)}
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="7"
                  max="21"
                  step="1"
                  value={sakthiMultiplier}
                  onChange={(e) => setSakthiMultiplier(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
                <div className="flex justify-between text-[9px] text-[var(--muted)] font-black uppercase tracking-widest">
                  <span>Extreme Deficit (7-9)</span>
                  <span>Moderate Loss (10-12)</span>
                  <span>Maintenance (13-15)</span>
                  <span>Moderate Gain (16-18)</span>
                  <span>Extreme Gain (19-21)</span>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <p className="text-xs text-neutral-300 leading-relaxed font-semibold">
                  <strong>Formulas Rule:</strong> Body weight × 2.2 × Multiplier. Your selected factor calculates a target of <strong>{sakthiCalories} kcal</strong> per day. Keep your focus on compound movements like squats, deadlifts, and bench press to drive nutrient partitioning.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (triggerToast) triggerToast("✓ LevelUp Strategist profile configurations saved!", "success");
              }}
              className="w-full py-4 rounded-2xl bg-[var(--accent)] text-white font-display font-black text-lg uppercase tracking-widest shadow-xl shadow-[var(--accent-glow)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              ⚡ Confirm All Configurations & Sync Plan
            </button>

          </div>
        )}

      </div>

      {/* MODALS */}
      
      {/* Rest Timer Modal */}
      <AnimatePresence>
        {timeLeft !== null && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <CircularTimer 
              initialSeconds={timeLeft}
              onClose={() => setTimeLeft(null)}
              onComplete={() => setTimeLeft(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Share Workout Snippet Modal */}
      <AnimatePresence>
        {sharingDay && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--card)] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/15 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
              
              <button 
                onClick={() => setSharingDay(null)} 
                className="absolute top-4 right-4 text-[var(--muted)] hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Share2 className="text-[var(--accent)]" size={24} />
                <div>
                  <h3 className="text-xl font-display text-white uppercase italic tracking-wider">Social Media Snippet</h3>
                  <p className="text-[9px] text-[var(--muted)] uppercase font-black tracking-wider">Generate customized levelup status</p>
                </div>
              </div>

              {/* Presets Toggle Row */}
              <div className="grid grid-cols-3 gap-2 bg-black/30 p-1 rounded-xl border border-white/5 mb-5">
                {(['standard', 'story', 'minimal'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSnippetPreset(type)}
                    className={cn(
                      "py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      snippetPreset === type 
                        ? "bg-[var(--accent)] text-white shadow-md" 
                        : "text-[var(--muted)] hover:text-white"
                    )}
                  >
                    {type === 'standard' && 'Detailed'}
                    {type === 'story' && 'Story Style'}
                    {type === 'minimal' && 'Minimal'}
                  </button>
                ))}
              </div>

              {/* Snippet Preview Textarea */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest pl-1 flex items-center justify-between">
                  <span>Snippet Content (Editable)</span>
                  <span className="text-[var(--accent)] font-mono">{customSnippetText.length} chars</span>
                </label>
                <div className="bg-black/40 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all">
                  <textarea
                    value={customSnippetText}
                    onChange={(e) => setCustomSnippetText(e.target.value)}
                    className="w-full text-xs text-white bg-transparent border-0 outline-none resize-none font-mono min-h-[160px] leading-relaxed"
                    placeholder="Enter customized status..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(customSnippetText);
                      if (triggerToast) {
                        triggerToast("🚀 Workout snippet copied to clipboard!", "success");
                      }
                    } catch (err) {
                      if (triggerToast) {
                        triggerToast("⚠️ Clipboard permission denied. Copy text manually.", "error");
                      }
                    }
                  }}
                  className="py-3 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 transition-all font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Copy size={14} /> Copy Code
                </button>
                
                <button
                  onClick={() => setSharingDay(null)}
                  className="py-3 px-4 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-white hover:border-white transition-all font-display font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Custom Exercise Modal */}
      <AnimatePresence>
        {isAddingToDayIdx !== null && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--card)] border-2 border-[var(--accent)]/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsAddingToDayIdx(null)} 
                className="absolute top-4 right-4 text-[var(--muted)] hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-display text-white uppercase italic tracking-wider mb-6">Add Exercise</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Exercise Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Incline Bench Press"
                    value={newEx.name}
                    onChange={(e) => setNewEx({...newEx, name: e.target.value})}
                    className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-4 text-white focus:border-[var(--accent)] outline-none mt-2 font-bold"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Sets</label>
                    <input 
                      type="text" 
                      value={newEx.sets}
                      onChange={(e) => setNewEx({...newEx, sets: e.target.value})}
                      className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--accent)] outline-none mt-2 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Reps</label>
                    <input 
                      type="text" 
                      value={newEx.reps}
                      onChange={(e) => setNewEx({...newEx, reps: e.target.value})}
                      className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--accent)] outline-none mt-2 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Rest Clock</label>
                    <input 
                      type="text" 
                      value={newEx.rest}
                      onChange={(e) => setNewEx({...newEx, rest: e.target.value})}
                      className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--accent)] outline-none mt-2 text-center font-bold"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => addCustomExercise(isAddingToDayIdx)}
                  className="w-full py-4 rounded-2xl bg-[var(--accent)] text-white font-display font-black text-lg uppercase tracking-widest shadow-xl shadow-[var(--accent-glow)] hover:brightness-110 transition-all mt-4 cursor-pointer"
                >
                  Confirm & Add
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
