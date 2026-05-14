import { MuscleGroup, Exercise } from './types';

export const EXERCISE_LIB: Record<MuscleGroup, Record<'beginner' | 'intermediate' | 'advanced', Exercise[]>> = {
  Chest: {
    beginner: [
      { name: 'Push-Ups', sets: '3', reps: '10–15', rest: '60s' },
      { name: 'Dumbbell Bench Press', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Incline DB Press', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Cable Flyes', sets: '2', reps: '12–15', rest: '45s' }
    ],
    intermediate: [
      { name: 'Barbell Bench Press', sets: '4', reps: '8–10', rest: '90s' },
      { name: 'Incline DB Press', sets: '3', reps: '10–12', rest: '75s' },
      { name: 'Cable Flyes', sets: '3', reps: '12–15', rest: '60s' },
      { name: 'Dips (Weighted)', sets: '3', reps: '8–10', rest: '75s' },
      { name: 'Pec Deck Machine', sets: '2', reps: '15', rest: '45s' }
    ],
    advanced: [
      { name: 'Barbell Bench Press (Heavy)', sets: '5', reps: '5–6', rest: '2–3min' },
      { name: 'Incline BB Press', sets: '4', reps: '6–8', rest: '2min' },
      { name: 'DB Flyes', sets: '3', reps: '10–12', rest: '75s' },
      { name: 'Weighted Dips', sets: '4', reps: '8–10', rest: '90s' },
      { name: 'Cable Crossover', sets: '3', reps: '12–15', rest: '60s' }
    ]
  },
  Back: {
    beginner: [
      { name: 'Lat Pulldown', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Seated Cable Row', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Dumbbell Row', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Face Pulls', sets: '2', reps: '15', rest: '45s' }
    ],
    intermediate: [
      { name: 'Pull-Ups / Chin-Ups', sets: '4', reps: '6–10', rest: '90s' },
      { name: 'Barbell Row', sets: '4', reps: '8–10', rest: '90s' },
      { name: 'Seated Cable Row', sets: '3', reps: '10–12', rest: '75s' },
      { name: 'Lat Pulldown (Wide)', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Face Pulls', sets: '3', reps: '15', rest: '45s' }
    ],
    advanced: [
      { name: 'Weighted Pull-Ups', sets: '5', reps: '5–8', rest: '2min' },
      { name: 'Deadlift', sets: '4', reps: '5–6', rest: '3min' },
      { name: 'Barbell Row', sets: '4', reps: '6–8', rest: '2min' },
      { name: 'T-Bar Row', sets: '3', reps: '8–10', rest: '90s' },
      { name: 'Straight Arm Pulldown', sets: '3', reps: '12–15', rest: '60s' }
    ]
  },
  Legs: {
    beginner: [
      { name: 'Bodyweight Squat', sets: '3', reps: '15–20', rest: '60s' },
      { name: 'Leg Press', sets: '3', reps: '12–15', rest: '75s' },
      { name: 'Lunges', sets: '3', reps: '10/leg', rest: '60s' },
      { name: 'Leg Curl', sets: '3', reps: '12–15', rest: '60s' }
    ],
    intermediate: [
      { name: 'Barbell Squat', sets: '4', reps: '8–10', rest: '2min' },
      { name: 'Romanian Deadlift', sets: '4', reps: '10–12', rest: '90s' },
      { name: 'Leg Press', sets: '3', reps: '12–15', rest: '75s' },
      { name: 'Walking Lunges', sets: '3', reps: '12/leg', rest: '75s' },
      { name: 'Leg Curl', sets: '3', reps: '12–15', rest: '60s' },
      { name: 'Calf Raises', sets: '4', reps: '15–20', rest: '45s' }
    ],
    advanced: [
      { name: 'Barbell Back Squat (Heavy)', sets: '5', reps: '5–6', rest: '3min' },
      { name: 'Romanian Deadlift', sets: '4', reps: '8–10', rest: '2min' },
      { name: 'Bulgarian Split Squat', sets: '4', reps: '8/leg', rest: '90s' },
      { name: 'Leg Press', sets: '3', reps: '10–12', rest: '90s' },
      { name: 'Leg Curl', sets: '4', reps: '10–12', rest: '75s' },
      { name: 'Weighted Calf Raises', sets: '5', reps: '15–20', rest: '45s' }
    ]
  },
  Shoulder: {
    beginner: [
      { name: 'DB Shoulder Press', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Lateral Raises', sets: '3', reps: '12–15', rest: '45s' },
      { name: 'Front Raises', sets: '2', reps: '12', rest: '45s' },
      { name: 'Face Pulls', sets: '2', reps: '15', rest: '45s' }
    ],
    intermediate: [
      { name: 'Barbell Overhead Press', sets: '4', reps: '8–10', rest: '90s' },
      { name: 'DB Lateral Raises', sets: '4', reps: '12–15', rest: '60s' },
      { name: 'Arnold Press', sets: '3', reps: '10–12', rest: '75s' },
      { name: 'Rear Delt Flyes', sets: '3', reps: '15', rest: '45s' },
      { name: 'Upright Row', sets: '3', reps: '10–12', rest: '60s' }
    ],
    advanced: [
      { name: 'Barbell OHP (Heavy)', sets: '5', reps: '5–6', rest: '2–3min' },
      { name: 'DB Lateral Raises (Drop Set)', sets: '4', reps: '12–15', rest: '60s' },
      { name: 'Arnold Press', sets: '4', reps: '8–10', rest: '90s' },
      { name: 'Rear Delt Cable Flyes', sets: '4', reps: '15', rest: '60s' },
      { name: 'Upright Row', sets: '3', reps: '10–12', rest: '75s' }
    ]
  },
  Biceps: {
    beginner: [
      { name: 'Dumbbell Curl', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Hammer Curl', sets: '3', reps: '10–12', rest: '60s' }
    ],
    intermediate: [
      { name: 'Barbell Curl', sets: '4', reps: '8–10', rest: '75s' },
      { name: 'Incline DB Curl', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Hammer Curl', sets: '3', reps: '10–12', rest: '60s' }
    ],
    advanced: [
      { name: 'Barbell Curl (Heavy)', sets: '4', reps: '6–8', rest: '90s' },
      { name: 'Incline DB Curl', sets: '4', reps: '8–10', rest: '75s' },
      { name: 'Concentration Curl', sets: '3', reps: '10–12', rest: '60s' }
    ]
  },
  Triceps: {
    beginner: [
      { name: 'Tricep Pushdown', sets: '3', reps: '12–15', rest: '60s' },
      { name: 'Overhead Tricep Ext.', sets: '2', reps: '12', rest: '60s' }
    ],
    intermediate: [
      { name: 'Tricep Pushdown', sets: '4', reps: '10–12', rest: '75s' },
      { name: 'Skull Crushers', sets: '3', reps: '10–12', rest: '75s' },
      { name: 'Overhead Tricep Ext.', sets: '3', reps: '12', rest: '60s' }
    ],
    advanced: [
      { name: 'Skull Crushers', sets: '4', reps: '8–10', rest: '90s' },
      { name: 'Close-Grip Bench', sets: '4', reps: '8–10', rest: '90s' },
      { name: 'Tricep Dips (Weighted)', sets: '3', reps: '8–10', rest: '75s' }
    ]
  },
  Abs: {
    beginner: [
      { name: 'Plank', sets: '3', reps: '30–45s', rest: '45s' },
      { name: 'Crunches', sets: '3', reps: '15–20', rest: '45s' },
      { name: 'Leg Raises', sets: '3', reps: '12–15', rest: '45s' }
    ],
    intermediate: [
      { name: 'Hanging Knee Raises', sets: '4', reps: '15', rest: '45s' },
      { name: 'Cable Crunches', sets: '3', reps: '15–20', rest: '45s' },
      { name: 'Plank (Weighted)', sets: '3', reps: '45–60s', rest: '45s' },
      { name: 'Bicycle Crunches', sets: '3', reps: '20', rest: '45s' }
    ],
    advanced: [
      { name: 'Hanging Leg Raises', sets: '4', reps: '15–20', rest: '60s' },
      { name: 'Ab Wheel Rollout', sets: '4', reps: '12–15', rest: '60s' },
      { name: 'Cable Crunches', sets: '4', reps: '20', rest: '45s' },
      { name: 'Dragon Flag', sets: '3', reps: '8–10', rest: '75s' }
    ]
  },
  Cardio: {
    beginner: [
      { name: 'Brisk Walk', sets: '1', reps: '20 min', rest: '—' },
      { name: 'Stationary Bike', sets: '1', reps: '15 min', rest: '—' }
    ],
    intermediate: [
      { name: 'Treadmill Jog', sets: '1', reps: '25 min', rest: '—' },
      { name: 'Jump Rope', sets: '5', reps: '1 min on / 30s off', rest: '30s' }
    ],
    advanced: [
      { name: 'HIIT Sprints', sets: '8', reps: '30s sprint / 30s rest', rest: '—' },
      { name: 'Stairmaster', sets: '1', reps: '20 min', rest: '—' }
    ]
  },
  'Full Body': {
    beginner: [
      { name: 'Squat', sets: '3', reps: '12–15', rest: '60s' },
      { name: 'Push-Up', sets: '3', reps: '10–15', rest: '60s' },
      { name: 'DB Row', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Plank', sets: '3', reps: '30s', rest: '45s' },
      { name: 'Lunges', sets: '3', reps: '10/leg', rest: '60s' }
    ],
    intermediate: [
      { name: 'Barbell Squat', sets: '4', reps: '8–10', rest: '90s' },
      { name: 'Bench Press', sets: '4', reps: '8–10', rest: '90s' },
      { name: 'Pull-Ups', sets: '4', reps: '6–10', rest: '90s' },
      { name: 'OHP', sets: '3', reps: '10–12', rest: '75s' },
      { name: 'Romanian DL', sets: '3', reps: '10–12', rest: '90s' },
      { name: 'Plank', sets: '3', reps: '45s', rest: '45s' }
    ],
    advanced: [
      { name: 'Deadlift', sets: '4', reps: '5–6', rest: '3min' },
      { name: 'Squat', sets: '4', reps: '5–6', rest: '3min' },
      { name: 'Bench Press', sets: '4', reps: '6–8', rest: '2min' },
      { name: 'Weighted Pull-Ups', sets: '4', reps: '6–8', rest: '2min' },
      { name: 'OHP', sets: '3', reps: '8–10', rest: '90s' }
    ]
  },
  Glutes: {
    beginner: [
      { name: 'Glute Bridges', sets: '3', reps: '15', rest: '45s' },
      { name: 'Donkey Kicks', sets: '3', reps: '15/leg', rest: '45s' }
    ],
    intermediate: [
      { name: 'Hip Thrusts', sets: '4', reps: '10–12', rest: '90s' },
      { name: 'Kettlebell Swings', sets: '3', reps: '15', rest: '60s' }
    ],
    advanced: [
      { name: 'Barbell Hip Thrusts', sets: '4', reps: '8–10', rest: '2min' },
      { name: 'Sumo Deadlift', sets: '4', reps: '5–8', rest: '2min' }
    ]
  },
  Hamstrings: {
    beginner: [
      { name: 'Leg Curls', sets: '3', reps: '12', rest: '60s' },
      { name: 'Good Mornings', sets: '3', reps: '15', rest: '60s' }
    ],
    intermediate: [
      { name: 'Romanian Deadlift', sets: '4', reps: '10', rest: '90s' },
      { name: 'Lying Leg Curls', sets: '3', reps: '12', rest: '60s' }
    ],
    advanced: [
      { name: 'Stiff Leg Deadlift', sets: '4', reps: '8', rest: '2min' },
      { name: 'Nordic Ham Curls', sets: '3', reps: '8', rest: '2min' }
    ]
  },
  Quadriceps: {
    beginner: [
      { name: 'Bodyweight Squats', sets: '3', reps: '15', rest: '60s' },
      { name: 'Leg Extensions', sets: '3', reps: '12', rest: '60s' }
    ],
    intermediate: [
      { name: 'Goblet Squats', sets: '4', reps: '10', rest: '90s' },
      { name: 'Hack Squats', sets: '3', reps: '12', rest: '90s' }
    ],
    advanced: [
      { name: 'Barbell Back Squat', sets: '5', reps: '5', rest: '3min' },
      { name: 'Leg Press (Heavy)', sets: '4', reps: '8', rest: '2min' }
    ]
  }
};

export const MOTIVATIONAL_MESSAGES = [
  "Keep pushing! You're doing great! 🔥",
  "One more rep! You've got this! 💪",
  "Feel the burn, that's progress! ⚡",
  "Focus on your form. Precision matters! 🎯",
  "You're stronger than you think! 🚀",
  "Don't stop now, you're almost there! 🏁",
  "Breathe in, breathe out. Stay controlled. 🌬️",
  "Every set brings you closer to your goal! 📈",
  "Champions are built in the rest of the world! 🏆",
  "Your future self will thank you! 🙌",
  "Stay focused. Stay dedicated. 🧠",
  "Make it count! 💯",
  "Embrace the challenge! 😤",
  "You're making it look easy! 😎",
  "Consistency is key! 🗝️"
];

export const TAMIL_MOTIVATIONAL_MESSAGES = [
  "Na ready... nee ready ah? 🔥",
  "Once I decide… I don’t stop. 💪",
  "Idhu gym illa da… battlefield! ⚡",
  "Weight kaatlam vanga! 🏋️",
  "Therikka vidalama! 🎯",
  "Verithanamana workout loading... 🚀",
  "Aarambikalagala? 🏁",
  "Mudiyathu nu solla koodathu! 🌬️",
  "Don't stop, thalaiva! 📈",
  "Inniku oru pidi pidikirom! 🏆",
  "Saptiya? Time to train! 🙌",
  "Semma mass panni vidu. 🧠",
  "Nee vera level thambi! 💯",
  "Veri kondu aadu! 😤",
  "Senjiruven! 😎",
  "Getha nillu! 🗝️"
];

export const TAMIL_QUOTES = [
  "Na ready... nee ready ah? 🔥",
  "Once I decide… I don’t stop. 💪",
  "Idhu gym illa da… battlefield! ⚡",
  "Thadai athai udai! 🏋️",
  "Vetrikku vali illai, vali thaan vetri 🏆",
  "Unnai vella yaarum illai 🧠",
  "Vithaiyadi nanba, vithaiyadi 💯",
  "Verithanamana vetri unakku 🚀",
  "Seiyum thozhil deivam 📈",
  "Uzhaippu enrum veenagathu 😤",
  "Ezhunthu vaa thalaiva 🔥",
  "Thayakkam thavir, thadukkalai udai 🎯",
  "Ethirigalai azhikkum aayudham un udambu ⚡",
  "Vidaamuyarchi viswarooba vetri 🛑",
  "Kannula theriyutha pain? Athu thaan gain ❌",
  "Nee nadanthal athirum 💥",
  "Vettri namathe! ❤️",
  "Kathirunthe mudikkum kaalam ithu ⏳",
  "Mass katuvom, getha iruppom 💪",
  "Veri... athu venum 🏆",
  "Vanthutennu sollu, thirumbi vanthutennu 🦇",
  "Adichi thookku 🥊",
  "Mersal aayiduvaanga 🎬",
  "Pudicha pudiyila athiranum gym 🕷️",
  "Vilayadu mangatha 🌌",
  "Naan oru thadava mudivu pannita ⚔️",
  "En vazhi thani vazhi 🧠",
  "Thimirudezh... 🏈",
  "Nee sonna pecha neeye kekamata ⚡",
  "Summa athiruthilla 🛡️"
];

export const QUOTES = [
  "The pain you feel today is the strength you feel tomorrow 💪",
  "Success starts with self-discipline 🔥",
  "No excuses. No shortcuts. Just results ⚡",
  "Every rep counts. Every day matters 🏋️",
  "Champions are made when no one is watching 🏆",
  "Your body can do it. Convince your mind 🧠",
  "Be stronger than your strongest excuse 💯",
  "Train insane or remain the same 🚀",
  "Small daily improvements lead to stunning results 📈",
  "Sweat is just fat crying 😤",
  "Push yourself because no one else is going to do it for you 🔥",
  "Discipline is choosing between what you want now and what you want most 🎯",
  "Wake up. Work out. Level up ⚡",
  "Don't stop when you're tired. Stop when you're done 🛑",
  "The only bad workout is the one you didn’t do ❌",
  "Make your body the sexiest outfit you own 💥",
  "Fall in love with the process ❤️",
  "Results happen over time, not overnight ⏳",
  "Stronger every single day 💪",
  "Earn your body 🏆",
  "Why do we fall? So we can learn to pick ourselves up 🦇",
  "It’s not about how hard you hit. It’s about how hard you can get hit and keep moving forward 🥊",
  "I’m not afraid of dying. I’m afraid of not trying 🎬",
  "With great power comes great responsibility… now lift it 🕷️",
  "Do or do not. There is no try 🌌",
  "I will not die a weak man ⚔️",
  "You either win or you learn. Never lose 🧠",
  "Pain heals. Chicks dig scars. Glory lasts forever 🏈",
  "Today we fight. Tomorrow we rise ⚡",
  "They may take our rest… but they’ll never take our gains 🛡️"
];
