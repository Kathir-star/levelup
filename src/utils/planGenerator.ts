import { ALL_50_EXERCISES } from '../components/ExercisePromptLibrary';

export interface GeneratedExercise {
  id: string;
  name: string;
  category: string;
  targetMuscles: string[];
  sets: number;
  reps: string;
  rest: string;
  duration: string; // e.g., "8 min"
  durationMs: number; // For progress calculation
  notes?: string;
  completed?: boolean;
}

export interface GeneratedDay {
  day: string; // Monday, Tuesday, etc.
  focus: string; // Push, Pull, Legs, Full Body, Rest, etc.
  isRest: boolean;
  type: 'Strength' | 'HIIT' | 'Cardio' | 'Rest';
  exercises: GeneratedExercise[];
  morningSession?: {
    title: string;
    exercises: GeneratedExercise[];
    totalTime: string;
  };
  totalTime: string; // e.g., "45 min"
  totalTimeMinutes: number;
  diet: {
    title: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    meals: {
      name: string; // Breakfast, Lunch, Snack, Dinner
      items: string[];
      calories: number;
      protein: number;
    }[];
  };
}

export function generateStructuredPlan(
  level: 'beginner' | 'intermediate' | 'advanced',
  goal: 'loss' | 'maintain' | 'gain',
  weight: number = 75,
  gender: 'male' | 'female' = 'male'
): GeneratedDay[] {
  
  // 1. Goal adjustments for sets, reps, and rest
  let sets = 3;
  let reps = "10-12";
  let rest = "60 sec";
  let exerciseTimeMinutes = 8;

  if (goal === 'loss') {
    sets = 3;
    reps = "12-15";
    rest = "45 sec";
    exerciseTimeMinutes = 7;
  } else if (goal === 'gain') {
    sets = 4;
    reps = "8-10";
    rest = "90 sec";
    exerciseTimeMinutes = 10;
  } else { // Maintain / Strength
    sets = 4;
    reps = "5-6";
    rest = "120 sec";
    exerciseTimeMinutes = 12;
  }

  // Find exercise helper
  const getExercise = (name: string, customReps?: string, customSets?: number): GeneratedExercise => {
    const original = ALL_50_EXERCISES.find(ex => ex.name.toLowerCase() === name.toLowerCase()) || {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      category: "CORE",
      targetMuscles: ["Core"]
    };

    const finalSets = customSets || sets;
    const finalReps = customReps || reps;
    const finalRest = rest;
    const totalDurationMin = finalSets * 2; // Roughly 2 min per set including rest

    return {
      id: original.id,
      name: original.name,
      category: original.category,
      targetMuscles: original.targetMuscles,
      sets: finalSets,
      reps: finalReps,
      rest: finalRest,
      duration: `${totalDurationMin} min`,
      durationMs: totalDurationMin * 60 * 1000,
      notes: `${original.targetMuscles.join(', ')} primary target.`
    };
  };

  // Helper for Diet creation
  const getDiet = (intensity: 'high' | 'light', dayName: string) => {
    const multiplier = goal === 'loss' ? 11 : (goal === 'gain' ? 17 : 14);
    const calories = Math.round(weight * 2.2 * multiplier * (intensity === 'light' ? 0.8 : 1.0));
    const protein = Math.round(weight * 2.2); // 2.2g per kg
    const fat = Math.round((calories * 0.22) / 9);
    const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);

    if (intensity === 'high') {
      return {
        title: "High Protein Muscle Fuel",
        calories,
        protein,
        carbs,
        fats: fat,
        meals: [
          {
            name: "Breakfast",
            items: gender === 'male' 
              ? [`4 Whole Eggs Scramble with Paneer (75g)`, `2 slices of Whole Wheat Toast`, `1 glass Double Toned Milk`]
              : [`3 egg whites + 1 whole egg Scramble`, `2 slices of Whole Wheat Toast`, `1 glass Greek Yogurt`],
            calories: Math.round(calories * 0.25),
            protein: Math.round(protein * 0.3)
          },
          {
            name: "Lunch",
            items: [`Chicken Breast (150g) OR Grilled Tofu (150g)`, `150g White/Brown Rice`, `Steam Broccoli & Salad`],
            calories: Math.round(calories * 0.35),
            protein: Math.round(protein * 0.35)
          },
          {
            name: "Pre-Workout Snack",
            items: [`1 scoop Whey Protein in Water`, `1 Medium Banana`, `30g Almonds/Walnuts`],
            calories: Math.round(calories * 0.15),
            protein: Math.round(protein * 0.15)
          },
          {
            name: "Dinner",
            items: [`Fish (Salmon/Tuna) (150g) OR Moong Dal (100g dry cooked)`, `2 Wheat Rotis with Ghee`, `Mixed Sautéed Veggies`],
            calories: Math.round(calories * 0.25),
            protein: Math.round(protein * 0.2)
          }
        ]
      };
    } else {
      return {
        title: "Balanced Recovery Diet",
        calories,
        protein: Math.round(protein * 0.8),
        carbs,
        fats: fat,
        meals: [
          {
            name: "Breakfast",
            items: [`Oats (60g dry) cooked in double toned milk`, `Chia seeds (15g)`, `Half Sliced Banana`],
            calories: Math.round(calories * 0.25),
            protein: Math.round(protein * 0.8 * 0.2)
          },
          {
            name: "Lunch",
            items: [`Paneer (100g) OR Grilled Tempeh (150g)`, `100g Cooked Quinoa`, `Sprouted Moong Salad`],
            calories: Math.round(calories * 0.35),
            protein: Math.round(protein * 0.8 * 0.35)
          },
          {
            name: "Snack",
            items: [`Greek Yogurt / Curd (200g) with honey`, `Pumpkin seeds (15g)`],
            calories: Math.round(calories * 0.15),
            protein: Math.round(protein * 0.8 * 0.15)
          },
          {
            name: "Dinner",
            items: [`Tofu Salad (150g) with Sweet Potatoes (100g boiled)`, `1 Roti with butter`, `Warm Chamomile Tea`],
            calories: Math.round(calories * 0.25),
            protein: Math.round(protein * 0.8 * 0.3)
          }
        ]
      };
    }
  };

  const days: GeneratedDay[] = [];

  // 2. Build plans by level
  if (level === 'beginner') {
    // 3 active days (M, W, F), 4 rest days
    const activeDays = ['Monday', 'Wednesday', 'Friday'];
    const restDays = ['Tuesday', 'Thursday', 'Saturday', 'Sunday'];

    const workouts = [
      // Day A
      [
        getExercise("Squats"),
        getExercise("Push-ups"),
        getExercise("Lat Pulldown"),
        getExercise("Calf Raises"),
        getExercise("Plank", "45 sec")
      ],
      // Day B
      [
        getExercise("Lunges"),
        getExercise("Dumbbell Chest Press"),
        getExercise("Dumbbell Row"),
        getExercise("Bicycle Crunch", "15-20"),
        getExercise("Jump Rope", "1 min")
      ],
      // Day C
      [
        getExercise("Glute Bridge"),
        getExercise("Shoulder Press"),
        getExercise("Hammer Curl"),
        getExercise("Russian Twist", "20"),
        getExercise("High Knees", "1 min")
      ]
    ];

    let workoutIndex = 0;

    const allDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    allDaysOfWeek.forEach(day => {
      if (activeDays.includes(day)) {
        const exList = workouts[workoutIndex++];
        const totalMinutes = exList.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: `Full Body Routine ${String.fromCharCode(64 + workoutIndex)}`,
          isRest: false,
          type: 'Strength',
          exercises: exList,
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else {
        const restEx = [
          getExercise("Cobra Stretch", "30s hold", 2),
          getExercise("Cat-Cow Stretch", "10 slow cycles", 2),
          getExercise("Downward Dog", "30s hold", 2)
        ];
        const totalMinutes = restEx.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Active Recovery & Mindfulness",
          isRest: true,
          type: 'Rest',
          exercises: [],
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('light', day)
        });
      }
    });
  } 
  else if (level === 'intermediate') {
    // 4 active days (M: Upper, T: Lower, Th: Upper, F: Lower), W/Sa/Su Cardio/Rest
    const upper1 = [
      getExercise("Bench Press"),
      getExercise("Pull-ups"),
      getExercise("Shoulder Press"),
      getExercise("Seated Row"),
      getExercise("Tricep Dips"),
      getExercise("Barbell Curl")
    ];
    const lower1 = [
      getExercise("Leg Press"),
      getExercise("Romanian Deadlift"),
      getExercise("Bulgarian Split Squat"),
      getExercise("Leg Raises"),
      getExercise("Calf Raises"),
      getExercise("Mountain Climbers", "1 min")
    ];
    const upper2 = [
      getExercise("Dumbbell Chest Press"),
      getExercise("Lat Pulldown"),
      getExercise("Arnold Press"),
      getExercise("Dumbbell Row"),
      getExercise("Diamond Push-ups"),
      getExercise("Hammer Curl")
    ];
    const lower2 = [
      getExercise("Squats"),
      getExercise("Romanian Deadlift"),
      getExercise("Lunges"),
      getExercise("Side Plank", "30s/side"),
      getExercise("Toe Touch Crunch", "15"),
      getExercise("Flutter Kicks", "45s")
    ];

    const morningCardio = [
      getExercise("Jump Rope", "5 mins", 1),
      getExercise("High Knees", "3 mins", 1),
      getExercise("Burpees", "2 mins", 1)
    ];

    const morningMobility = [
      getExercise("Arm Circles", "2 mins", 1),
      getExercise("Downward Dog", "3 mins", 1),
      getExercise("Cat-Cow Stretch", "3 mins", 1)
    ];

    const allDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    allDaysOfWeek.forEach(day => {
      if (day === 'Monday') {
        const totalMinutes = upper1.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Upper Body Strength Split",
          isRest: false,
          type: 'Strength',
          exercises: upper1,
          morningSession: {
            title: "Morning Somatic Mobility",
            exercises: morningMobility,
            totalTime: "10 min"
          },
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else if (day === 'Tuesday') {
        const totalMinutes = lower1.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Lower Body & Core Split",
          isRest: false,
          type: 'Strength',
          exercises: lower1,
          morningSession: {
            title: "Morning Cardio Awakening",
            exercises: morningCardio,
            totalTime: "10 min"
          },
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else if (day === 'Wednesday') {
        const activeRest = [
          getExercise("Cobra Stretch", "45s hold", 2),
          getExercise("Cat-Cow Stretch", "15 slow cycles", 2)
        ];
        const totalMinutes = activeRest.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Active Rest & LISS",
          isRest: true,
          type: 'Rest',
          exercises: [],
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('light', day)
        });
      } else if (day === 'Thursday') {
        const totalMinutes = upper2.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Upper Body Hypertrophy Split",
          isRest: false,
          type: 'Strength',
          exercises: upper2,
          morningSession: {
            title: "Morning Somatic Mobility",
            exercises: morningMobility,
            totalTime: "10 min"
          },
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else if (day === 'Friday') {
        const totalMinutes = lower2.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Lower Body Conditioning Split",
          isRest: false,
          type: 'Strength',
          exercises: lower2,
          morningSession: {
            title: "Morning Cardio Awakening",
            exercises: morningCardio,
            totalTime: "10 min"
          },
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else if (day === 'Saturday') {
        const hiit = [
          getExercise("Burpees", "10", 3),
          getExercise("Skater Jumps", "15", 3),
          getExercise("Mountain Climbers", "45s", 3),
          getExercise("Russian Twist", "20", 3)
        ];
        const totalMinutes = hiit.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Metabolic HIIT & Core Burner",
          isRest: false,
          type: 'HIIT',
          exercises: hiit,
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else { // Sunday
        days.push({
          day,
          focus: "CNS Sleep Recovery & Stretch",
          isRest: true,
          type: 'Rest',
          exercises: [],
          totalTime: "0 min",
          totalTimeMinutes: 0,
          diet: getDiet('light', day)
        });
      }
    });
  } 
  else {
    // Advanced Plan: 6 active days, 1 rest day (PPL x 2 split)
    const push1 = [
      getExercise("Bench Press"),
      getExercise("Shoulder Press"),
      getExercise("Incline Push-ups"),
      getExercise("Arnold Press"),
      getExercise("Tricep Dips"),
      getExercise("Diamond Push-ups")
    ];
    const pull1 = [
      getExercise("Pull-ups"),
      getExercise("Lat Pulldown"),
      getExercise("Seated Row"),
      getExercise("Dumbbell Row"),
      getExercise("Face Pull"),
      getExercise("Barbell Curl")
    ];
    const legs1 = [
      getExercise("Squats"),
      getExercise("Romanian Deadlift"),
      getExercise("Bulgarian Split Squat"),
      getExercise("Leg Press"),
      getExercise("Lunges"),
      getExercise("Calf Raises")
    ];
    const push2 = [
      getExercise("Dumbbell Chest Press"),
      getExercise("Arnold Press"),
      getExercise("Cable Chest Fly"),
      getExercise("Shoulder Press"),
      getExercise("Tricep Dips"),
      getExercise("Push-ups")
    ];
    const pull2 = [
      getExercise("Pull-ups"),
      getExercise("Seated Row"),
      getExercise("Resistance Band Row"),
      getExercise("Reverse Fly"),
      getExercise("Dead Hang"),
      getExercise("Hammer Curl")
    ];
    const legs2 = [
      getExercise("Squats"),
      getExercise("Bulgarian Split Squat"),
      getExercise("Romanian Deadlift"),
      getExercise("Hip Thrust"),
      getExercise("Glute Bridge"),
      getExercise("Calf Raises")
    ];

    const allDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    allDaysOfWeek.forEach(day => {
      if (day === 'Monday') {
        const totalMinutes = push1.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Push Day (Chest, Shoulders, Triceps)",
          isRest: false,
          type: 'Strength',
          exercises: push1,
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else if (day === 'Tuesday') {
        const totalMinutes = pull1.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Pull Day (Back & Biceps Thickness)",
          isRest: false,
          type: 'Strength',
          exercises: pull1,
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else if (day === 'Wednesday') {
        const totalMinutes = legs1.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Legs Day (Quads, Hamstrings, Glutes)",
          isRest: false,
          type: 'Strength',
          exercises: legs1,
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else if (day === 'Thursday') {
        const totalMinutes = push2.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Push Day (Hypertrophy Volume Focus)",
          isRest: false,
          type: 'Strength',
          exercises: push2,
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else if (day === 'Friday') {
        const totalMinutes = pull2.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Pull Day (Back Density & Peak Biceps)",
          isRest: false,
          type: 'Strength',
          exercises: pull2,
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else if (day === 'Saturday') {
        const totalMinutes = legs2.reduce((acc, ex) => acc + parseInt(ex.duration), 0);
        days.push({
          day,
          focus: "Legs Day (Posterior Chain & Calves Volume)",
          isRest: false,
          type: 'Strength',
          exercises: legs2,
          totalTime: `${totalMinutes} min`,
          totalTimeMinutes: totalMinutes,
          diet: getDiet('high', day)
        });
      } else { // Sunday
        days.push({
          day,
          focus: "Mindful Recovery & Rest",
          isRest: true,
          type: 'Rest',
          exercises: [],
          totalTime: "0 min",
          totalTimeMinutes: 0,
          diet: getDiet('light', day)
        });
      }
    });
  }

  return days;
}
