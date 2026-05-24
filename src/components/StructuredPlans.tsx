import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import { 
  Dumbbell, 
  Zap, 
  Flame, 
  Timer as TimerIcon, 
  ChevronRight, 
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Shield,
  Activity,
  Award,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StructuredPlansProps {
  gender: 'male' | 'female';
}

// ==========================================
// 1. COMPREHENSIVE FITNESS SYSTEM DATA STRUCTS
// ==========================================

export interface CoachWorkout {
  title: string;
  focus: string;
  isRest: boolean;
  tip?: string;
  warmup: {
    duration: string;
    exercises: string[];
  };
  cooldown: {
    duration: string;
    exercises: string[];
  };
  exercises: {
    name: string;
    muscles: string;
    safetyMod: string;
    menSpecs: { sets: number; reps: string; load: string };
    womenSpecs: { sets: number; reps: string; load: string };
    physioCue: string;
  }[];
}

const FITNESS_SYSTEM: Record<
  'beginner' | 'intermediate' | 'advanced', // Levels
  Record<
    'bodyweight' | 'gym', // Types
    CoachWorkout[] // 3, 4, or 5 days based on Weekly Split rules
  >
> = {
  beginner: {
    bodyweight: [
      {
        title: "Full Body Foundation - A",
        focus: "Core Stability & Cellular Awakening",
        isRest: false,
        warmup: {
          duration: "4 Mins",
          exercises: ["20x Arm Circles", "15x Hip Rotations", "10x Bodyweight Good Mornings"]
        },
        cooldown: {
          duration: "3 Mins",
          exercises: ["Seated Hamstring Stretch (30s)", "Cobra Stretch for Abdominals (30s)"]
        },
        exercises: [
          {
            name: "Classic Push-ups / Knee Option",
            muscles: "Chest, Anterior Deltoids, Triceps",
            safetyMod: "Do knee push-ups or incline wall push-ups to reduce torque.",
            menSpecs: { sets: 3, reps: "10-12", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "8-10 (Knee push-up option)", load: "Bodyweight" },
            physioCue: "Engage glutes to avoid lower back sagging. Maintain neutrality from neck to tailbone."
          },
          {
            name: "Air Squats",
            muscles: "Quadriceps, Glutes, Hamstrings",
            safetyMod: "Squat to a chair/bench to limit depth and protect knees.",
            menSpecs: { sets: 3, reps: "15", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "12-15", load: "Bodyweight" },
            physioCue: "Drive weight through heels. Press knees outward; do not let them cave inward."
          },
          {
            name: "Glute Bridges",
            muscles: "Gluteus Maximus, Hamstrings",
            safetyMod: "Keep hips low if lower back compression is felt.",
            menSpecs: { sets: 3, reps: "15", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "15 (Hold 2s at peak)", load: "Bodyweight" },
            physioCue: "Squeeze glutes actively at top, ensuring your lower back does not hyperextend."
          },
          {
            name: "Inverted Bodyweight Rows (or Towel Pulls)",
            muscles: "Lats, Upper Back, Biceps",
            safetyMod: "Bend knees past 90 degrees to make exercise easier.",
            menSpecs: { sets: 3, reps: "10", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "8-10", load: "Bodyweight" },
            physioCue: "Lead the movement with your elbows, drawing shoulder blades flush together."
          },
          {
            name: "Traditional Plank Hold",
            muscles: "Rectus Abdominis, Transverse Abdominis",
            safetyMod: "Forearm plank with knees resting on floor.",
            menSpecs: { sets: 3, reps: "45s Max Hold", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "30s-45s Hold", load: "Bodyweight" },
            physioCue: "Push space up between shoulder blades. Keep neck neutral, looking directly down."
          },
          {
            name: "Mountain Climbers",
            muscles: "Core, Hip Flexors, Deltoids",
            safetyMod: "Slow down and perform steps instead of running.",
            menSpecs: { sets: 3, reps: "20 per side", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "15 per side", load: "Bodyweight" },
            physioCue: "Maintain shoulders directly vertically aligned above your wrists."
          }
        ]
      },
      {
        title: "Active Recovery Day",
        focus: "Aerobic Flushing & Mobility",
        isRest: true,
        tip: "Perfect recovery stimulates protein synthesis. Perform a 25-30 minute brisk walk and full-body stretch.",
        warmup: { duration: "0", exercises: [] },
        cooldown: { duration: "0", exercises: [] },
        exercises: []
      },
      {
        title: "Full Body Foundation - B",
        focus: "Posterior Chain Symmetry",
        isRest: false,
        warmup: {
          duration: "5 Mins",
          exercises: ["20x Cat-Cow stretches", "15x Leg swings", "10x Wrist prep circles"]
        },
        cooldown: {
          duration: "4 Mins",
          exercises: ["Child Pose (60s)", "Standing Quad stretch (30s/leg)"]
        },
        exercises: [
          {
            name: "Pike Push-ups",
            muscles: "Anterior Deltoids, Clavicular Chest, Triceps",
            safetyMod: "Feet on ground instead of elevated. Keep depth moderate.",
            menSpecs: { sets: 3, reps: "10", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "8 (or Hand Release Push-ups)", load: "Bodyweight" },
            physioCue: "Form a triangle with your head and hands at bottom peak to save shoulder space."
          },
          {
            name: "Alternating Reverse Lunges",
            muscles: "Glutes, Quadriceps, Core",
            safetyMod: "Hold onto a wall or sturdy chair for biomechanical balance.",
            menSpecs: { sets: 3, reps: "12 per leg", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "12 per leg", load: "Bodyweight" },
            physioCue: "Ensure front knee remains stacked directly over ankle, avoiding forward shear."
          },
          {
            name: "Doorframe Pulls / Rows",
            muscles: "Rhomboids, Middle Trapezius, Latissimus Dorsi",
            safetyMod: "Sit further back or use lighter grip inclination.",
            menSpecs: { sets: 3, reps: "12", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "12", load: "Bodyweight" },
            physioCue: "Flex through midback. Do not grip with forearms excessively."
          },
          {
            name: "Single-Leg Glute Bridges",
            muscles: "Gluteus Maximus, Hamstrings, Deep Rotators",
            safetyMod: "Alternate standard bridges if single-leg causes cramping.",
            menSpecs: { sets: 3, reps: "10 per leg", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "10 per leg", load: "Bodyweight" },
            physioCue: "Keep hips perfectly level. Do not let non-working hip sag toward the floor."
          },
          {
            name: "Dead Bug",
            muscles: "Transverse Abdominis, Multifidus",
            safetyMod: "Move arms only or legs only to simplify coordination.",
            menSpecs: { sets: 3, reps: "12 per side", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "12 per side", load: "Bodyweight" },
            physioCue: "Force lower spine hard against floor. Do not allow your lower back to arch!"
          },
          {
            name: "Standing Calf Raises",
            muscles: "Gastrocnemius, Soleus",
            safetyMod: "Complete on flat floor instead of step edge.",
            menSpecs: { sets: 3, reps: "20", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "20", load: "Bodyweight" },
            physioCue: "Pause for 1 full second at peak contraction. Squeeze calf fibers intentionally."
          }
        ]
      }
    ],
    gym: [
      {
        title: "Full Body Machine Intro",
        focus: "Guided Biomechanics & Joint Prep",
        isRest: false,
        warmup: {
          duration: "5 Mins",
          exercises: ["5 Min Light treadmill walk", "Shoulder dislocations with PVC pipe"]
        },
        cooldown: {
          duration: "5 Mins",
          exercises: ["Lat and chest wall stretch (45s per side)", "Doorway pec stretch"]
        },
        exercises: [
          {
            name: "Chest Press Machine",
            muscles: "Pectoralis Major, Anterior Deltoid",
            safetyMod: "Adjust seat so handles align with mid-to-lower chest.",
            menSpecs: { sets: 3, reps: "10", load: "Light-to-Moderate (e.g. 30-45kg)" },
            womenSpecs: { sets: 3, reps: "10", load: "Light (e.g. 15-20kg)" },
            physioCue: "Keep shoulder blades retracted and firmly pinned back into the pad."
          },
          {
            name: "Seated Lat Pulldown",
            muscles: "Latissimus Dorsi, Teres Major, Biceps",
            safetyMod: "Bring bar to upper collarbones only; do not pull behind neck.",
            menSpecs: { sets: 3, reps: "10", load: "Light-to-Moderate (e.g. 35-50kg)" },
            womenSpecs: { sets: 3, reps: "10", load: "Light (e.g. 20-30kg)" },
            physioCue: "Pull from elbows and suppress shoulders first before pulling with hands."
          },
          {
            name: "Linear Leg Press Machine",
            muscles: "Quadriceps, Glutes, Hamstrings",
            safetyMod: "Do NOT lock out knees at bottom/top. Keep feet wide on sled.",
            menSpecs: { sets: 3, reps: "12", load: "Moderate (e.g. 60-80kg plus sled)" },
            womenSpecs: { sets: 3, reps: "12", load: "Moderate (e.g. 30-45kg plus sled)" },
            physioCue: "Stop descend when lower back begins to round off the safety seat cushion."
          },
          {
            name: "Shoulder Press Machine",
            muscles: "Deltoids, Upper Pectoralis, Triceps",
            safetyMod: "Use parallel grips if pronated grips pinch your shoulder rotator cuff.",
            menSpecs: { sets: 3, reps: "10", load: "Light (e.g. 15-25kg)" },
            womenSpecs: { sets: 3, reps: "10", load: "Light (e.g. 8-12kg)" },
            physioCue: "Keep brace loaded. Do not hyper-arch the spine or lookup during press."
          },
          {
            name: "Seated Cable Rows",
            muscles: "Rhomboids, Latissimus Dorsi, Trapezius",
            safetyMod: "Do not hyperextend at hips when pulling. Keep knees soft.",
            menSpecs: { sets: 3, reps: "12", load: "Light-to-Moderate (e.g. 30-45kg)" },
            womenSpecs: { sets: 3, reps: "12", load: "Light (e.g. 15-25kg)" },
            physioCue: "Squeeze back as if holding a coin between shoulder blades. Control negative."
          },
          {
            name: "Lying Leg Curl Machine",
            muscles: "Hamstrings (Biceps Femoris)",
            safetyMod: "Ensure knees align with pivot point of machine cam.",
            menSpecs: { sets: 3, reps: "12", load: "Light (e.g. 20-30kg)" },
            womenSpecs: { sets: 3, reps: "12", load: "Light (e.g. 10-20kg)" },
            physioCue: "Control return phase. Keep hips down on pad. Do not let pelvis lift."
          }
        ]
      }
    ]
  },
  intermediate: {
    bodyweight: [
      {
        title: "Upper Body Hypertrophy Split",
        focus: "Advanced Muscle Recruitment",
        isRest: false,
        warmup: {
          duration: "4 Mins",
          exercises: ["20s Shoulder Shrugs", "15x Dynamic Chest Openers", "15x Arm pulses"]
        },
        cooldown: {
          duration: "3 Mins",
          exercises: ["Wall-assisted shoulder rotators stretch", "Tricep over-head hold"]
        },
        exercises: [
          {
            name: "Standard Ground Push-ups",
            muscles: "Chest, Triceps, Deltoids",
            safetyMod: "Wall or bar push up if fatigue limits form on final set.",
            menSpecs: { sets: 4, reps: "15", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "12 (Knee or incline option)", load: "Bodyweight" },
            physioCue: "Tuck elbows to 45 degrees. Do not flared wide to safeguard labrum socket."
          },
          {
            name: "Chair or Bench Tricep Dips",
            muscles: "Triceps, Chest, Anterior Delts",
            safetyMod: "Bend knees to 90 degrees to assist bodyweight load lifting.",
            menSpecs: { sets: 3, reps: "12-15", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "10-12", load: "Bodyweight" },
            physioCue: "Keep spine close to bench. Do not slide hips too far forward to prevent impingement."
          },
          {
            name: "Inverted Bodyweight Rows (Prone)",
            muscles: "Lats, Posterior Delts, Forearms",
            safetyMod: "Increase feet height to make harder; bend knees to ease.",
            menSpecs: { sets: 4, reps: "12", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "10-12", load: "Bodyweight" },
            physioCue: "Pull with chest up to bar. Core stays completely locked."
          },
          {
            name: "Diamond Push-ups",
            muscles: "Inner Triceps, Pectoral Saws",
            safetyMod: "Execute from elevated wall or floor knees to focus tricep.",
            menSpecs: { sets: 3, reps: "12", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "8-10 (Knee diamond option)", load: "Bodyweight" },
            physioCue: "Fingers form a diamond shape. Focus elbows backward during descent."
          },
          {
            name: "Pike Push-ups with Deficit",
            muscles: "Shoulder Cap, Triceps",
            safetyMod: "Standard static pike or floor incline without deficit.",
            menSpecs: { sets: 3, reps: "12", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "8-10", load: "Bodyweight" },
            physioCue: "Look toward your feet. Push away from the floor smoothly at top."
          },
          {
            name: "Plank Shoulder Taps",
            muscles: "Transverse Core, Shoulder Girdle",
            safetyMod: "Keep wide feet base to offset hip rotation.",
            menSpecs: { sets: 3, reps: "15 per side", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "15 per side", load: "Bodyweight" },
            physioCue: "Minimize hip sway entirely while tapping hand to opposing shoulder."
          }
        ]
      },
      {
        title: "Lower Body Conditioning Split",
        focus: "Lumbopelvic Rhythm & Power",
        isRest: false,
        warmup: {
          duration: "5 Mins",
          exercises: ["20x Bodyweight squats", "10x Lateral lunges", "10x Cat-camel"]
        },
        cooldown: {
          duration: "4 Mins",
          exercises: ["Pigeon stretch (60s/leg)", "Deep low squat hold (60s)"]
        },
        exercises: [
          {
            name: "Dumbbell or Backpack Goblet Squats",
            muscles: "Quads, Glutes, Core Strength",
            safetyMod: "Bodyweight only or reduce squat depth to 90 degrees.",
            menSpecs: { sets: 4, reps: "15", load: "Light Load (e.g. 10-15kg)" },
            womenSpecs: { sets: 4, reps: "15", load: "Light Load (e.g. 6-10kg)" },
            physioCue: "Keep ribs down and chest up. Maintain spine length throughout load."
          },
          {
            name: "Walking Lunges",
            muscles: "Hamstrings, Glutes, Quadriceps",
            safetyMod: "Standard stationary lunges with support.",
            menSpecs: { sets: 3, reps: "15 per leg", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "12 per leg", load: "Bodyweight" },
            physioCue: "Push off front leg to stand up, utilizing full glute activation on stand."
          },
          {
            name: "Unilateral Glute Bridges",
            muscles: "Hamstrings, Deep glute stabilizers",
            safetyMod: "Standard double leg bridge with elastic loop.",
            menSpecs: { sets: 3, reps: "12 per leg", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "12 per leg", load: "Bodyweight" },
            physioCue: "Drive through heels, pushing pelvis into alignment with hip bones."
          },
          {
            name: "Jump Squats (Explosive)",
            muscles: "Quadriceps Fast Twitch, Calves",
            safetyMod: "Bodyweight standard fast squat to protect sore knees.",
            menSpecs: { sets: 3, reps: "12", load: "Bodyweight (Explosive)" },
            womenSpecs: { sets: 3, reps: "10 (Explosive)", load: "Bodyweight (Explosive)" },
            physioCue: "Land as softly as possible, rolling weight back from toe to heel."
          },
          {
            name: "Bicycle Crunches",
            muscles: "Obliques, Transverse Core",
            safetyMod: "Slow standard crunches to control pelvic alignment.",
            menSpecs: { sets: 3, reps: "20 per side", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "20 per side", load: "Bodyweight" },
            physioCue: "Do not yank on collar. Aim to rot shoulder blade toward opposite knee."
          }
        ]
      }
    ],
    gym: [
      {
        title: "Upper Body Hypertrophy",
        focus: "Hypertrophy & Posture Restoration",
        isRest: false,
        warmup: {
          duration: "5 Mins",
          exercises: ["PVC Pipe rotations", "Dynamic lat rows with band"]
        },
        cooldown: {
          duration: "4 Mins",
          exercises: ["Pec doorway stretches (60s)", "Thoracic spine extension over roller"]
        },
        exercises: [
          {
            name: "Seated Low Cabled Rows",
            muscles: "Rhomboids, Lats, Erector Spinae",
            safetyMod: "Soft incline chest rows if lower back discomfort presents.",
            menSpecs: { sets: 4, reps: "12", load: "Moderate (e.g. 45-60kg)" },
            womenSpecs: { sets: 4, reps: "12", load: "Moderate (e.g. 25-35kg)" },
            physioCue: "Keep spine tall. Pull handles to lower gut; do not use arm jerk motion."
          },
          {
            name: "Incline Dumbbell Bench Press",
            muscles: "Upper Chest, Anterior Delts",
            safetyMod: "Keep bench angle at 30 degrees only. Avoid 45+ to spare shoulders.",
            menSpecs: { sets: 4, reps: "10", load: "Moderate (e.g. 18-24kg per dumbbell)" },
            womenSpecs: { sets: 3, reps: "12", load: "Light-to-Moderate (e.g. 8-12kg per DB)" },
            physioCue: "Maintain a stable 3-point arch contact: shoulder blades, butt, and feet on floor."
          },
          {
            name: "Lateral Dumbbell Raises",
            muscles: "Lateral Deltoids",
            safetyMod: "Perform with slightly bent elbows, or use cables for constant tension.",
            menSpecs: { sets: 3, reps: "15", load: "Light (e.g. 7.5-10kg)" },
            womenSpecs: { sets: 3, reps: "12-15", load: "Light (e.g. 3-5kg)" },
            physioCue: "Raise dumbbell slightly in the scapular plane (15-30 degrees forward from side)."
          },
          {
            name: "Dumbbell Hammer Curls",
            muscles: "Brachialis, Brachioradialis",
            safetyMod: "Cable curls with rope option to adjust pronation.",
            menSpecs: { sets: 3, reps: "12", load: "Moderate (e.g. 10-14kg)" },
            womenSpecs: { sets: 3, reps: "12", load: "Light (e.g. 5-7.5kg)" },
            physioCue: "Keep elbows fixed tightly to ribcage. Avoid swinging torso backward."
          },
          {
            name: "Tricep Pushdowns (Cable/Rope)",
            muscles: "Triceps Girdle Lateral & Medial Heads",
            safetyMod: "Utilize straight bar instead of rope if wrists get fatigued.",
            menSpecs: { sets: 3, reps: "15", load: "Moderate (e.g. 15-25kg)" },
            womenSpecs: { sets: 3, reps: "12", load: "Light (e.g. 8-12kg)" },
            physioCue: "Squeeze arms fully locked at bottom. Avoid shrugging traps down on push."
          }
        ]
      },
      {
        title: "Lower Body Machine Focus",
        focus: "Hypertrophy Split",
        isRest: false,
        warmup: {
          duration: "5 Mins",
          exercises: ["Light leg extensions (20x, ultra-light)", "Deep hip openers"]
        },
        cooldown: {
          duration: "4 Mins",
          exercises: ["Calf stretches (45s)", "Psoas kneeling flexor stretch (60s/side)"]
        },
        exercises: [
          {
            name: "Leg Press Machine",
            muscles: "Quads, Glutes, Hamstrings",
            safetyMod: "Reduce range of motion. Use hand pressure on knees to guard stability.",
            menSpecs: { sets: 4, reps: "12", load: "Moderate-to-Heavy (e.g. 80-120kg)" },
            womenSpecs: { sets: 4, reps: "12", load: "Moderate (e.g. 40-70kg)" },
            physioCue: "Drive weight completely through heels. Keep knees track inline with toes."
          },
          {
            name: "Romanian Deadlifts (Dumbbell)",
            muscles: "Glute-Hamstring Junction, Erector Spinae",
            safetyMod: "Single leg floor touch without dumbbells if balance or back is weak.",
            menSpecs: { sets: 4, reps: "10-12", load: "Moderate (e.g. 16-22kg per DB)" },
            womenSpecs: { sets: 3, reps: "12", load: "Light-to-Moderate (e.g. 8-12kg per DB)" },
            physioCue: "Hinge at hips. Push hips rearward as if closing a car door with your glutes."
          },
          {
            name: "Seated Leg Extensions",
            muscles: "Rectus Femoris, Vastus Lateralis",
            safetyMod: "Avoid extension past 10 degrees if kneecap patellar grinding occurs.",
            menSpecs: { sets: 3, reps: "15", load: "Moderate (e.g. 30-45kg)" },
            womenSpecs: { sets: 4, reps: "12-15", load: "Light-to-Moderate (e.g. 15-25kg)" },
            physioCue: "Squeeze quadriceps tightly for 1 second at full top extension."
          },
          {
            name: "Seated Calf raises",
            muscles: "Soleus (Deep calf muscle)",
            safetyMod: "Do bodyweight stairs calf raise if ankle flexion is restricted.",
            menSpecs: { sets: 3, reps: "20", load: "Moderate (e.g. 20-30kg)" },
            womenSpecs: { sets: 3, reps: "20", load: "Light (e.g. 10-15kg)" },
            physioCue: "Explode up, squeeze at peak, and lower down over a 3-second tempo."
          }
        ]
      }
    ]
  },
  advanced: {
    bodyweight: [
      {
        title: "Savage Upper Push/Pull",
        focus: "Explosive Dynamics & Muscle Synergy",
        isRest: false,
        warmup: {
          duration: "5 Mins",
          exercises: ["20x Arm swings", "10x Wide-to-close pushups (light)", "Scapular pulls"]
        },
        cooldown: {
          duration: "5 Mins",
          exercises: ["Under-arm stretch (60s)", "Pec and bicep stretch (45s)"]
        },
        exercises: [
          {
            name: "Deadhang Pull-Ups",
            muscles: "Lats, Teres Major, Brachioradialis",
            safetyMod: "Foot-assisted bar rows or jump-and-negative holds (5s negative).",
            menSpecs: { sets: 4, reps: "8-12", load: "Bodyweight (Explosive)" },
            womenSpecs: { sets: 4, reps: "3-5 (or Assisted Pullup Machine 10 reps)", load: "Bodyweight" },
            physioCue: "Depress shoulders. Pull to bar until chin comfortably passes over."
          },
          {
            name: "Decline Ground Push-ups",
            muscles: "Upper Pectorals, Anterior Delts",
            safetyMod: "Standard push-ups or hand release options.",
            menSpecs: { sets: 4, reps: "18-20", load: "Feet Elevated 30cm" },
            womenSpecs: { sets: 3, reps: "12-15", load: "Feet Elevated 15cm" },
            physioCue: "Keep body tight. Do not scoop neck forward towards ground."
          },
          {
            name: "Parallel Bar Dips",
            muscles: "Lower Chest, Anterior Deltoids, Triceps",
            safetyMod: "Chair dips with legs raised on a second surface if bars are tough.",
            menSpecs: { sets: 4, reps: "12-15", load: "Bodyweight" },
            womenSpecs: { sets: 3, reps: "8-10 (or Bench Dips option)", load: "Bodyweight" },
            physioCue: "Avoid descending below 90 degrees elbow extension to spare anterior capsule."
          },
          {
            name: "Plyometric Push-ups (Clap Option)",
            muscles: "Pectoralis Fast Twitch, Core Coordination",
            safetyMod: "Fast-tempo push-ups (fast raise, slow lower) without hand release.",
            menSpecs: { sets: 3, reps: "10-12 (Clapping)", load: "Power" },
            womenSpecs: { sets: 3, reps: "8 (or Fast Hand release)", load: "Power" },
            physioCue: "Absorb landing forces with slightly soft elbows, immediately rolling into repetition."
          },
          {
            name: "L-Sit Hold / Hanging Leg Raises",
            muscles: "Rectus Abdominis, Iliopsoas, Forearms",
            safetyMod: "Hanging knee raise to tuck position.",
            menSpecs: { sets: 4, reps: "12 Reps / 20s Hold", load: "Core Elite" },
            womenSpecs: { sets: 4, reps: "10 Reps / 15s Hold", load: "Core Elite" },
            physioCue: "Keep chest tall, eyes forward, shoulders pushed down and completely stable."
          }
        ]
      },
      {
        title: "Savage Legs & Core Split",
        focus: "Unilateral Power & Endurance",
        isRest: false,
        warmup: {
          duration: "5 Mins",
          exercises: ["Leg swings dynamic", "Pigeon active opener", "Ankle prep rotations"]
        },
        cooldown: {
          duration: "5 Mins",
          exercises: ["Seated straddle stretch (90s)", "Standing quad and groin stretch"]
        },
        exercises: [
          {
            name: "Bulgarian Split Squat",
            muscles: "Quadriceps, Glutes, Hamstrings",
            safetyMod: "Split squat with both front and rear feet on flat ground.",
            menSpecs: { sets: 4, reps: "15 per leg", load: "Bodyweight" },
            womenSpecs: { sets: 4, reps: "12 per leg", load: "Bodyweight" },
            physioCue: "Lean slightly forward to bias glutes; stay upright to bias quads."
          },
          {
            name: "Burpees (With Jump & Push-up)",
            muscles: "Full Body Elite, Cardiovascular Output",
            safetyMod: "Plank step-backs instead of jumping and omit the push-up.",
            menSpecs: { sets: 4, reps: "15", load: "High Intensity" },
            womenSpecs: { sets: 3, reps: "12", load: "High Intensity" },
            physioCue: "Jump up vertically extending hips fully. Land with soft joints."
          },
          {
            name: "Single-Leg Romanian Deadlift",
            muscles: "Ankle stabilizers, Glutes, Popliteus",
            safetyMod: "Both feet on ground with staggered stance (B-Stance).",
            menSpecs: { sets: 3, reps: "12 per leg", load: "Bodyweight / Balance" },
            womenSpecs: { sets: 3, reps: "12 per leg", load: "Bodyweight / Balance" },
            physioCue: "Keep rear leg inline with torso. Squeeze glute of working leg to arise."
          },
          {
            name: "Jump Squats (Max Deficit)",
            muscles: "Plyo Quads, Gastrocnemius",
            safetyMod: "Moderate deep bodyweight squats with fast tempo.",
            menSpecs: { sets: 4, reps: "15", load: "Explosive Power" },
            womenSpecs: { sets: 4, reps: "12", load: "Explosive Power" },
            physioCue: "Sway arms backward on descend and swing forward on vertical leap."
          },
          {
            name: "Oblique V-Ups / Russian Twists",
            muscles: "External Obliques, Internal Obliques",
            safetyMod: "Fingers behind hip floor crunches.",
            menSpecs: { sets: 3, reps: "20 per side", load: "Elite Core" },
            womenSpecs: { sets: 3, reps: "20 per side", load: "Elite Core" },
            physioCue: "Touch hands physically to floor on rotation. Slow down your rotation tempo."
          }
        ]
      }
    ],
    gym: [
      {
        title: "Savage Strength Upper Push/Pull",
        focus: "Heavy Loading & Mechanical Fatigue",
        isRest: false,
        warmup: {
          duration: "5 Mins",
          exercises: ["Dumbbell shoulder warmup combo (Light)", "Band Pull-aparts (25x)"]
        },
        cooldown: {
          duration: "5 Mins",
          exercises: ["Thoracic spine extensions", "Calf and hamstring bar hangs"]
        },
        exercises: [
          {
            name: "Barbell Bench Press",
            muscles: "Pectoralis Major, Anterior Delts, Triceps",
            safetyMod: "Dumbbell Press with neutral grip for safer shoulder bio-angles.",
            menSpecs: { sets: 5, reps: "12", load: "Heavy (e.g. 50-70kg or bodyweight)" },
            womenSpecs: { sets: 4, reps: "10-12", load: "Light-to-Moderate (e.g. 20-30kg)" },
            physioCue: "Lower bar to nipple line with forearm vertically stacked under bar at all times."
          },
          {
            name: "Weighted / High-Volume Pull-Ups",
            muscles: "Lats, Rhomboids, Coracobrachialis",
            safetyMod: "Assisted Pullups or Lat Pulldowns at heavy setting.",
            menSpecs: { sets: 4, reps: "8-10", load: "Weighted (e.g. +5 to +10kg)" },
            womenSpecs: { sets: 4, reps: "6-8", load: "Assisted / Bodyweight" },
            physioCue: "Lead through elbows. Arch slightly at peak to activate lower lat fibers."
          },
          {
            name: "Seated Cable Rows (Overhand/Wide Grip)",
            muscles: "Teres Major, Middle Trapezius",
            safetyMod: "Single arm dumbbell row to avoid bilateral symmetry errors.",
            menSpecs: { sets: 4, reps: "12", load: "Heavy (e.g. 50-70kg)" },
            womenSpecs: { sets: 4, reps: "12", load: "Moderate (e.g. 25-35kg)" },
            physioCue: "Retract and pull with chest high. Do not hinge spine backward to gain leverage."
          },
          {
            name: "Standing Dumbbell Shoulder Press",
            muscles: "Anterior & Lateral Delts, Core Balance",
            safetyMod: "Lower load back-supported machine press.",
            menSpecs: { sets: 4, reps: "10", load: "Moderate-to-Heavy (e.g. 18-24kg per DB)" },
            womenSpecs: { sets: 4, reps: "10", load: "Light-to-Moderate (e.g. 8-12kg per DB)" },
            physioCue: "Keep glutes and abs tight to block spine from hyperextension under overhead tension."
          },
          {
            name: "Parallel Girdle Bench Dips (Weighted)",
            muscles: "Sternal Chest, Triceps Long-head",
            safetyMod: "Omit extra weights; execute bodyweight dips focusing on speed.",
            menSpecs: { sets: 3, reps: "12", load: "Weighted (e.g. +15kg plate on lap)" },
            womenSpecs: { sets: 3, reps: "10", load: "Bodyweight (Bench Elevated)" },
            physioCue: "Descend slowly over a 3-second negative. Keep elbows tracking inward."
          }
        ]
      },
      {
        title: "Savage Strength Lower Split",
        focus: "Heavy Core Tension & Joint Strength",
        isRest: false,
        warmup: {
          duration: "5 Mins",
          exercises: ["Air squats (20x)", "Leg Swings", "Deep Glute activator bridge"]
        },
        cooldown: {
          duration: "5 Mins",
          exercises: ["Seated hamstring bend", "Myofascial foam roll (Quads & Glutes)"]
        },
        exercises: [
          {
            name: "Barbell Back Squats",
            muscles: "Gluteus Maximus, Quadriceps, Core stability",
            safetyMod: "Smith Machine squats or high leg presses to protect back.",
            menSpecs: { sets: 4, reps: "12", load: "Heavy (e.g. 60-80kg)" },
            womenSpecs: { sets: 4, reps: "10-12", load: "Moderate (e.g. 30-45kg)" },
            physioCue: "Sit down between hips. Do not let knees cave (varus shear) during push phase."
          },
          {
            name: "Romanian Deadlift (Barbell)",
            muscles: "Hip Extension Drive, Glutes, Hamstrings",
            safetyMod: "Dumbbell Romanian Deadlift to allow neutral hand paths.",
            menSpecs: { sets: 4, reps: "10", load: "Heavy (e.g. 50-70kg)" },
            womenSpecs: { sets: 4, reps: "10", load: "Moderate (e.g. 25-35kg)" },
            physioCue: "Keep bar tight to thighs throughout motion. Back remains flat, neck inline with torso."
          },
          {
            name: "Unilateral Dumbbell Split Squats",
            muscles: "Quads, Adductor Magnus, Spine vertical balance",
            safetyMod: "Hold onto static frame while performing double-leg split squats.",
            menSpecs: { sets: 3, reps: "12 per leg", load: "Moderate (e.g. 16-22kg DBs)" },
            womenSpecs: { sets: 3, reps: "12 per leg", load: "Light (e.g. 8-12kg DBs)" },
            physioCue: "Distribute 80% weight on front heel. Push up utilizing glute squeeze."
          },
          {
            name: "Leaping Jump Squats",
            muscles: "Power Fast-twitch, Connective Achilles tendon",
            safetyMod: "Skip jumping; execute ultra-fast air squats with no impact.",
            menSpecs: { sets: 4, reps: "12", load: "Explosive" },
            womenSpecs: { sets: 3, reps: "10", load: "Explosive" },
            physioCue: "Land soft, rolling smoothly from tip-toes to heels while bending knees. Never land stiff-legged!"
          }
        ]
      }
    ]
  }
};

// ==========================================
// 2. EXERCISE CATALOG STRUCTURE (30-40 EXERCISES)
// ==========================================

export interface CatalogExercise {
  name: string;
  category: 'PUSH' | 'PULL' | 'LEGS' | 'CORE';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  menRange: string;
  womenRange: string;
  physioNote: string;
}

const EXERCISE_CATALOG: CatalogExercise[] = [
  // PUSH
  {
    name: "Classic Push-ups",
    category: "PUSH",
    level: "Beginner",
    menRange: "3 sets x 12-15 reps",
    womenRange: "3 sets x 8-12 reps (Or Knee Push-ups)",
    physioNote: "Tuck elbows at 45 degrees. Squeeze glutes and abs to avoid mechanical shearing of the lower lumbar vertebrae."
  },
  {
    name: "Barbell Bench Press",
    category: "PUSH",
    level: "Intermediate",
    menRange: "4 sets x 10 reps (Moderate Load)",
    womenRange: "3 sets x 10-12 reps (Light Load)",
    physioNote: "Maintain a light arch in the thoracic spine and plant your feet firmly. Never flare elbows to 90 degrees."
  },
  {
    name: "Incline Chest Press Machine",
    category: "PUSH",
    level: "Beginner",
    menRange: "3 sets x 12 reps",
    womenRange: "3 sets x 10 reps",
    physioNote: "Align handles with upper pectoral fibers. Retract shoulder blades flat against the seat support during press."
  },
  {
    name: "Standing Dumbbell Shoulder Press",
    category: "PUSH",
    level: "Intermediate",
    menRange: "4 sets x 10 reps",
    womenRange: "4 sets x 10 reps",
    physioNote: "Keep ribcage locked. Avoid lumbar arching when pressing DBs overhead. Use dumbbells for natural joint rotation."
  },
  {
    name: "Parallel Bar Dips",
    category: "PUSH",
    level: "Advanced",
    menRange: "4 sets x 12-15 reps (With or without Weight)",
    womenRange: "3 sets x 8-10 reps (Bench elevated support)",
    physioNote: "Ensure chest is slightly pitched forward to engage lower pecs. Stop decline when shoulder passes elbow level."
  },
  {
    name: "Lateral Dumbbell Raises",
    category: "PUSH",
    level: "Beginner",
    menRange: "3 sets x 15 reps (Light weight)",
    womenRange: "3 sets x 15 reps (Ultra-light weight)",
    physioNote: "Raise dumbbells in the physical 'scapular plane' (slightly forward). Avoid bringing loads above shoulder elevation."
  },
  {
    name: "Dumbbell Flyes (Flat Bench)",
    category: "PUSH",
    level: "Intermediate",
    menRange: "3 sets x 12 reps (Moderate weight)",
    womenRange: "3 sets x 12 reps (Light weight)",
    physioNote: "Soft bend in elbows. Keep your touch point stacked straight under wrists. Maintain chest expansion."
  },
  {
    name: "Overhead Tricep Extension (Dumbbell)",
    category: "PUSH",
    level: "Beginner",
    menRange: "3 sets x 12 reps",
    womenRange: "3 sets x 12 reps",
    physioNote: "Lock elbows close to temples. Keep your head straight, do not scoop neck forward under dumbbell load."
  },
  {
    name: "Cable Pec Fly",
    category: "PUSH",
    level: "Intermediate",
    menRange: "4 sets x 15 reps",
    womenRange: "3 sets x 12 reps",
    physioNote: "Keep a soft elbow angle, contract the chest actively. Do not use shoulders forward-roll."
  },

  // PULL
  {
    name: "Deadhang Pull-ups",
    category: "PULL",
    level: "Advanced",
    menRange: "4 sets x 8-12 reps",
    womenRange: "4 sets x 3-5 reps (Assisted strap option)",
    physioNote: "Avoid jumping start. Depress and rotate shoulders down before pulling. Focus on full arm latch."
  },
  {
    name: "Seated Lat Pulldown Machine",
    category: "PULL",
    level: "Beginner",
    menRange: "3 sets x 12 reps",
    womenRange: "3 sets x 10 reps",
    physioNote: "Pull bar to collarbone. Squeeze elbow down. Keep upper traps loose; avoid ear vertical shoulder shrugging."
  },
  {
    name: "Seated Cable Neutral Draw Rows",
    category: "PULL",
    level: "Beginner",
    menRange: "3 sets x 12 reps",
    womenRange: "3 sets x 12 reps",
    physioNote: "Pull to lower waistline. Control return phase over 2-3 seconds to boost mechanical negative muscle stress."
  },
  {
    name: "One-Arm Dumbbell Row",
    category: "PULL",
    level: "Intermediate",
    menRange: "4 sets x 10-12 reps per arm",
    womenRange: "3 sets x 12 reps per arm",
    physioNote: "Keep hip bones parallel to the support bench. Pull with elbow up. Do not twist spine."
  },
  {
    name: "Inverted Bodyweight Rows (Bar/Strap)",
    category: "PULL",
    level: "Intermediate",
    menRange: "4 sets x 12 reps",
    womenRange: "3 sets x 10-12 reps",
    physioNote: "Core must remain flat on a horizontal board shape. Maintain neck neutrality to relieve upper neck strain."
  },
  {
    name: "Dumbbell Hammer Curls",
    category: "PULL",
    level: "Beginner",
    menRange: "3 sets x 12 reps",
    womenRange: "3 sets x 12 reps",
    physioNote: "Targets brachioradialis for forearm protection. Keep elbows locked on side. Do not rock torso."
  },
  {
    name: "Chin-ups",
    category: "PULL",
    level: "Advanced",
    menRange: "4 sets x 8-10 reps",
    womenRange: "3 sets x 4-6 reps (or assisted chin-ups)",
    physioNote: "Underhand grip forces heavier bicep contribution. Keep shoulders locked; do not hang passively on joints."
  },
  {
    name: "Face Pulls (Rope Cable)",
    category: "PULL",
    level: "Intermediate",
    menRange: "4 sets x 15 reps",
    womenRange: "3 sets x 15 reps",
    physioNote: "Pull to nose level. Perform exterior rotation (thumbs backward). Protects shoulder back-capsule from injury."
  },
  {
    name: "Bicep Curl (Dumbbell)",
    category: "PULL",
    level: "Beginner",
    menRange: "3 sets x 12 reps",
    womenRange: "3 sets x 12 reps",
    physioNote: "Keep chest expanded, do not lean backward to throw weights up. Move strictly through helper pivot elbow joints."
  },

  // LEGS
  {
    name: "Bodyweight Air Squat",
    category: "LEGS",
    level: "Beginner",
    menRange: "3 sets x 15-20 reps",
    womenRange: "3 sets x 15 reps",
    physioNote: "Foot arches must stay firmly in contact with ground. Squeeze knees outward, sitting deeply between hips."
  },
  {
    name: "Leg Press Cable Sled",
    category: "LEGS",
    level: "Beginner",
    menRange: "3 sets x 12 reps (Moderate weight)",
    womenRange: "3 sets x 12 reps (Moderate weight)",
    physioNote: "Avoid folding your tailbone off the seat cushion. Never lock knees at extension step to avoid joint tear."
  },
  {
    name: "Dumbbell Romanian Deadlift",
    category: "LEGS",
    level: "Intermediate",
    menRange: "4 sets x 10-12 reps",
    womenRange: "4 sets x 10-12 reps",
    physioNote: "Focus hinges on back. Hips translate back first. Squeeze hamstrings and glutes on return stand phase."
  },
  {
    name: "Unilateral Bulgarian Split Squat",
    category: "LEGS",
    level: "Advanced",
    menRange: "4 sets x 12 per leg",
    womenRange: "4 sets x 12 per leg",
    physioNote: "Back foot elevated on bench. Biomechanic check: keep knee directly inline with foot to avoid valgus caving."
  },
  {
    name: "Walking Lunges (Weighted option)",
    category: "LEGS",
    level: "Intermediate",
    menRange: "3 sets x 15 steps per leg",
    womenRange: "3 sets x 12 steps per leg",
    physioNote: "Take a wide step to target glutes, vertical step to target quads. Back knee stops 2cm off the ground."
  },
  {
    name: "Goblet Squats (Kettlebell/Dumbbell)",
    category: "LEGS",
    level: "Beginner",
    menRange: "3 sets x 12 reps",
    womenRange: "3 sets x 12 reps",
    physioNote: "Hold weight vertically at chest. Perfect setup for deep hip flexor mobility and front quad tension."
  },
  {
    name: "Calf Raises (Elevated Step)",
    category: "LEGS",
    level: "Beginner",
    menRange: "3 sets x 25 reps",
    womenRange: "3 sets x 20 reps",
    physioNote: "Sink deep for Achilles tendon flexibility. Explode up to toes and hold contraction intentionally."
  },
  {
    name: "Glute Bridges",
    category: "LEGS",
    level: "Beginner",
    menRange: "3 sets x 15 reps",
    womenRange: "3 sets x 15-20 reps",
    physioNote: "Keep heels close to glutes. Press arms down into the floor to amplify spine stability coordinates."
  },
  {
    name: "Leg Curl Machine",
    category: "LEGS",
    level: "Intermediate",
    menRange: "3 sets x 12 reps",
    womenRange: "3 sets x 12 reps",
    physioNote: "Squeeze hamstring fibers. Keep pelvis flat to isolate Biceps Femoris. Do not tense lower back muscles."
  },

  // CORE
  {
    name: "Traditional Forearm Plank",
    category: "CORE",
    level: "Beginner",
    menRange: "3 sets x 45-60s hold",
    womenRange: "3 sets x 30-45s hold",
    physioNote: "Push elbows through floor, protracting scapula. Squeeze glutes and quadriceps for absolute tension."
  },
  {
    name: "Hanging Core Leg Raises",
    category: "CORE",
    level: "Advanced",
    menRange: "4 sets x 12 reps",
    womenRange: "4 sets x 10 reps (Knee lift option)",
    physioNote: "Do not swing. Control lower descent phase to restrict back flexor momentum. Work deep lower abs."
  },
  {
    name: "Russian Twists",
    category: "CORE",
    level: "Intermediate",
    menRange: "3 sets x 20 reps per side",
    womenRange: "3 sets x 15 reps per side",
    physioNote: "Keep spine straight. Rotate shoulders completely. Lift heels off ground to boost lower transverse flex."
  },
  {
    name: "Traditional Bicycle Crunches",
    category: "CORE",
    level: "Beginner",
    menRange: "3 sets x 20 reps per side",
    womenRange: "3 sets x 20 reps per side",
    physioNote: "Slow rotation tempo gets results. Avoid pulling neck. Drive elbow to knee by rotating chest cage."
  },
  {
    name: "Side Plank Hold (With Leg raise option)",
    category: "CORE",
    level: "Intermediate",
    menRange: "3 sets x 45s per side",
    womenRange: "3 sets x 30s-45s per side",
    physioNote: "Ensure elbow aligns under shoulder to protect clavicle. Keep hips lifted high off ground."
  },
  {
    name: "Dead Bug",
    category: "CORE",
    level: "Beginner",
    menRange: "3 sets x 15 reps per side",
    womenRange: "3 sets x 12 reps per side",
    physioNote: "Force lower spine completely flat. Breathe calmly, slowly extending opposite leg and hand down."
  },
  {
    name: "Mountain Climbers (Rapid / Strict)",
    category: "CORE",
    level: "Intermediate",
    menRange: "3 sets x 30s rapid",
    womenRange: "3 sets x 30s rate",
    physioNote: "Keep hips down, shoulders above wrists. Focus core in a solid column to stop spine snake-twisting."
  }
];

export default function StructuredPlans({ gender }: StructuredPlansProps) {
  const [activeTab, setActiveTab2] = useState<'plans' | 'catalog' | 'split' | 'mods'>('plans');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [envType, setEnvType] = useState<'bodyweight' | 'gym'>('bodyweight');
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<'ALL' | 'PUSH' | 'PULL' | 'LEGS' | 'CORE'>('ALL');

  // Interactive Workout Selection Resolver
  const currentWorkouts = useMemo(() => {
    return FITNESS_SYSTEM[level]?.[envType] || [];
  }, [level, envType]);

  // Catalog filtering
  const filteredCatalog = useMemo(() => {
    return EXERCISE_CATALOG.filter(ex => {
      const matchSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.physioNote.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = catalogCategory === 'ALL' || ex.category === catalogCategory;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, catalogCategory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* ==========================================
          A. COACH ADVANCED HEADER SCREEN
          ========================================== */}
      <div className="bg-gradient-to-br from-black via-[#110505] to-[#1d0a0a] border border-red-500/20 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/10 rounded-full blur-3xl -mr-36 -mt-36 pointer-events-none" />
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/20 relative z-10 shrink-0">
          <Dumbbell size={36} className="text-white" />
        </div>
        <div className="flex-1 min-w-[260px] relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[9px] bg-red-500/20 border border-red-500/35 text-red-400 px-2.5 py-0.5 rounded-full font-black tracking-widest uppercase">
              Certified System
            </span>
            <span className="text-[9px] bg-amber-500/20 border border-amber-500/35 text-amber-400 px-2.5 py-0.5 rounded-full font-black tracking-widest uppercase">
              Physiotherapy Compliant
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight leading-none uppercase">
            Coach Workout Engine
          </h2>
          <p className="text-[var(--muted)] text-xs sm:text-sm leading-relaxed max-w-xl mt-2 font-medium">
            Dual-path performance system containing equivalent strength-development formulas. 
            Calibrated safely across levels for elite orthopaedic safety.
          </p>
        </div>
      </div>

      {/* ==========================================
          B. SYSTEM NAVIGATION CONTROLS (TABS)
          ========================================== */}
      <div className="flex bg-black/40 p-1.5 rounded-2xl border border-[var(--border)] overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setActiveTab2('plans')}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer",
            activeTab === 'plans' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-[var(--muted)] hover:text-white"
          )}
        >
          <Award size={14} /> Workout Programs
        </button>
        <button
          onClick={() => setActiveTab2('catalog')}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer",
            activeTab === 'catalog' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-[var(--muted)] hover:text-white"
          )}
        >
          <BookOpen size={14} /> Exercise Catalog
        </button>
        <button
          onClick={() => setActiveTab2('split')}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer",
            activeTab === 'split' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-[var(--muted)] hover:text-white"
          )}
        >
          <Activity size={14} /> Weekly Splits & Rules
        </button>
        <button
          onClick={() => setActiveTab2('mods')}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer",
            activeTab === 'mods' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-[var(--muted)] hover:text-white"
          )}
        >
          <Shield size={14} /> Safe Modifications
        </button>
      </div>

      {/* ==========================================
          TAB 1: INTERACTIVE WORKOUT PLANS
          ========================================== */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          
          {/* Quick Filters Panel */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Level Selector */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest ml-1 flex items-center gap-1">
                <Flame size={12} className="text-red-400" /> Choose Fitness Difficulty
              </label>
              <div className="flex bg-[var(--sub)] rounded-xl p-1 border border-[var(--border)]">
                {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
                  <button 
                    key={l} 
                    onClick={() => { setLevel(l); setExpandedDay(0); }} 
                    className={cn(
                      "flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer", 
                      level === l ? "bg-red-500 text-white shadow-md shadow-red-500/10" : "text-[var(--muted)] hover:text-white"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Environment Type Selector */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest ml-1 flex items-center gap-1">
                <Dumbbell size={12} className="text-amber-400" /> Choose Environment
              </label>
              <div className="flex bg-[var(--sub)] rounded-xl p-1 border border-[var(--border)]">
                <button 
                  onClick={() => { setEnvType('bodyweight'); setExpandedDay(0); }} 
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer", 
                    envType === 'bodyweight' ? "bg-red-500 text-white shadow-md shadow-red-500/10" : "text-[var(--muted)] hover:text-white"
                  )}
                >
                  🏠 Bodyweight (Home)
                </button>
                <button 
                  onClick={() => { setEnvType('gym'); setExpandedDay(0); }} 
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer", 
                    envType === 'gym' ? "bg-red-500 text-white shadow-md shadow-red-500/10" : "text-[var(--muted)] hover:text-white"
                  )}
                >
                  🏋️ Gym / Machine
                </button>
              </div>
            </div>

          </div>

          {/* Core Physiology Rule Alert Bar */}
          <div className="p-4 sm:p-5 bg-orange-500/10 border-2 border-orange-500/20 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="text-orange-400 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 leading-none">
                Coach Joint Safety Protocol
              </h4>
              <p className="text-[10px] text-white/85 leading-relaxed mt-1">
                Always perform dynamic movement warm-ups before lifting or taxing joint tendons. 
                Do not train high physical loads/intensities with cold, tight muscle tissue.
              </p>
            </div>
          </div>

          {/* Program Routine Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wider">
                  Level {level.toUpperCase()} {envType === 'bodyweight' ? 'Bodyweight' : 'Gym Machine'} Program
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1 italic flex items-center gap-1">
                  <Info size={14} className="text-red-400 shrink-0" />
                  {gender === 'male' ? "Calibrated for male baseline athletic response" : "Slim & Tone baseline feminine athletic value setup"}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="badge text-white px-3 py-1 bg-red-500 rounded-lg text-[9px] font-black tracking-widest uppercase">
                  {gender.toUpperCase()} VERSION
                </span>
                <span className="badge border border-[var(--border)] text-[var(--muted)] px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase">
                  {level.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Cycle Render Accordion */}
            <div className="space-y-4">
              {currentWorkouts.map((workout, index) => {
                const isDayExtended = expandedDay === index;
                return (
                  <div key={index} className="bg-[var(--sub)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-red-500/30">
                    
                    {/* Header trigger */}
                    <div 
                      onClick={() => setExpandedDay(isDayExtended ? null : index)}
                      className="p-4 sm:p-6 flex items-center justify-between cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest w-16 shrink-0">
                          {workout.isRest ? "REST" : `SESS ${index + 1}`}
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-white uppercase group-hover:text-red-400 transition-colors">
                            {workout.title}
                          </h4>
                          <span className="text-[9px] text-[var(--muted)] uppercase font-semibold tracking-widest mt-0.5 block">
                            {workout.focus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {workout.isRest ? (
                          <span className="text-[9px] bg-white/5 text-[var(--muted)] px-2.5 py-1 rounded-full border border-white/5 font-black uppercase tracking-widest">
                            Rest Day
                          </span>
                        ) : (
                          <span className="text-[9px] bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full border border-red-500/20 font-black uppercase tracking-widest">
                            {workout.exercises.length} Exercises
                          </span>
                        )}
                        {isDayExtended ? <ChevronUp size={16} className="text-[var(--muted)]" /> : <ChevronDown size={16} className="text-[var(--muted)]" />}
                      </div>
                    </div>

                    {/* Expandable Core */}
                    <AnimatePresence>
                      {isDayExtended && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-black/15"
                        >
                          <div className="p-4 sm:p-6 border-t border-[var(--border)] space-y-6">
                            
                            {workout.isRest ? (
                              <div className="p-4 bg-red-500/5 border-l-4 border-red-500 text-xs text-white/85 leading-relaxed rounded-r-xl font-medium">
                                💡 {workout.tip}
                              </div>
                            ) : (
                              <>
                                {/* Micro Split: Warmup, Main, Cooldown */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Warm-Up (3-5 mins) */}
                                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider">
                                      <TimerIcon size={14} /> Warmup (3-5 Mins)
                                    </div>
                                    <ul className="space-y-1 text-[10px] text-white/75 font-semibold uppercase tracking-wide">
                                      {workout.warmup.exercises.map((warmEx, warmIdx) => (
                                        <li key={warmIdx} className="flex items-center gap-1.5">
                                          <span className="text-amber-500">•</span> {warmEx}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Cooldown (3-5 mins) */}
                                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider">
                                      <Activity size={14} /> Cooldown (3-5 Mins)
                                    </div>
                                    <ul className="space-y-1 text-[10px] text-white/75 font-semibold uppercase tracking-wide">
                                      {workout.cooldown.exercises.map((coolEx, coolIdx) => (
                                        <li key={coolIdx} className="flex items-center gap-1.5">
                                          <span className="text-emerald-500">•</span> {coolEx}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>

                                {/* Exercises List */}
                                <div className="space-y-4">
                                  <div className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest pb-1 border-b border-white/5">
                                    Main Exercises (6-10 Elements)
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[500px]">
                                      <thead>
                                        <tr className="border-b border-white/5 text-[9px] font-black uppercase text-[var(--muted)] tracking-widest">
                                          <th className="py-2.5">Exercise Name</th>
                                          <th className="py-2.5 text-center">Men Spec</th>
                                          <th className="py-2.5 text-center">Women Spec</th>
                                          <th className="py-2.5 text-center">Suggested Load</th>
                                          <th className="py-2.5 pl-4">Clinician Posture Cue</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {workout.exercises.map((ex, exIdx) => {
                                          return (
                                            <tr key={exIdx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all text-xs">
                                              <td className="py-4 font-bold text-white shrink-0">
                                                <div>{ex.name}</div>
                                                <div className="text-[9px] text-[var(--muted)] uppercase font-semibold mt-0.5">
                                                  {ex.muscles}
                                                </div>
                                              </td>
                                              <td className="py-4 text-center text-red-400 font-extrabold font-mono">
                                                {ex.menSpecs.sets} x {ex.menSpecs.reps}
                                              </td>
                                              <td className="py-4 text-center text-pink-400 font-extrabold font-mono">
                                                {ex.womenSpecs.sets} x {ex.womenSpecs.reps}
                                              </td>
                                              <td className="py-4 text-center text-white/80 font-semibold text-[10px] font-mono">
                                                {ex.menSpecs.load}
                                              </td>
                                              <td className="py-4 pl-4 text-[10px] text-[var(--muted)] font-medium leading-relaxed max-w-[220px]">
                                                {ex.physioCue}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>

                                </div>
                              </>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: EXERCISE CATALOG BOX
          ========================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6">
            
            {/* Search and Category filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              <div className="relative w-full md:max-w-xs">
                <Search size={16} className="absolute left-4 top-3.5 text-[var(--muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search 38 exercises..."
                  className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-red-500 transition-all font-semibold"
                />
              </div>

              <div className="flex bg-[var(--sub)] p-1 rounded-xl border border-[var(--border)] overflow-x-auto no-scrollbar w-full md:w-auto gap-1">
                {(['ALL', 'PUSH', 'PULL', 'LEGS', 'CORE'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                      catalogCategory === cat ? "bg-red-500 text-white" : "text-[var(--muted)] hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCatalog.map((ex, index) => {
                return (
                  <div key={index} className="p-5 bg-[var(--sub)] border border-[var(--border)] rounded-3xl space-y-3 group hover:border-red-500/30 transition-all relative overflow-hidden">
                    
                    {/* Level marker and Name */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={cn(
                          "text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                          ex.level === 'Beginner' ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                          ex.level === 'Intermediate' ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                          "bg-red-500/15 text-red-500 border border-red-500/20"
                        )}>
                          {ex.level}
                        </span>
                        <h4 className="text-base font-bold text-white uppercase tracking-wide mt-1.5">
                          {ex.name}
                        </h4>
                      </div>
                      <span className="text-[9px] text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20 font-black tracking-widest">
                        {ex.category}
                      </span>
                    </div>

                    {/* Men vs Women ranges */}
                    <div className="grid grid-cols-2 gap-2 bg-black/20 p-2.5 rounded-xl text-[10px] font-semibold border border-white/5 font-mono">
                      <div>
                        <span className="text-red-400">MEN:</span> {ex.menRange}
                      </div>
                      <div>
                        <span className="text-pink-400">WOMEN:</span> {ex.womenRange}
                      </div>
                    </div>

                    {/* Physio Bio-mechanical note */}
                    <p className="text-[10px] text-[var(--muted)] leading-relaxed font-medium pt-1.5 border-t border-white/5">
                      <strong className="text-white">Physio Cues:</strong> {ex.physioNote}
                    </p>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 3: WEEKLY SPLITS & PROGRESSION RULES
          ========================================== */}
      {activeTab === 'split' && (
        <div className="space-y-6">
          
          {/* Split Matrix Box */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg sm:text-2xl font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="text-red-500" /> Professional Training Split Matrix
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Beginner split */}
              <div className="bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded font-black tracking-widest uppercase">
                  Level 1: Beginner
                </span>
                <h4 className="text-base font-bold text-white uppercase">3-Day Full Body Split</h4>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Focuses on building standard mind-muscle connection, tendon resilience, and clean, raw movement habits. Rest days are strictly required between lift days.
                </p>
                <div className="text-[10px] font-bold text-white uppercase bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono leading-relaxed">
                  Mon: Full Body A<br />
                  Wed: Active Recovery Walk<br />
                  Fri: Full Body B<br />
                  Sun: Off/Rebuild
                </div>
              </div>

              {/* Intermediate split */}
              <div className="bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
                <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded font-black tracking-widest uppercase">
                  Level 2: Intermediate
                </span>
                <h4 className="text-base font-bold text-white uppercase">4-Day Upper / Lower Split</h4>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Optimized for elevated mechanical stress and localized volume load. Overloading muscles with dedicated upper and lower days stimulates healthy tissue synthesis.
                </p>
                <div className="text-[10px] font-bold text-white uppercase bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono leading-relaxed">
                  Mon: Upper Body A<br />
                  Tue: Lower Body A<br />
                  Thu: Upper Body B<br />
                  Fri: Lower Body B
                </div>
              </div>

              {/* Advanced split */}
              <div className="bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
                <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded font-black tracking-widest uppercase">
                  Level 3: Advanced
                </span>
                <h4 className="text-base font-bold text-white uppercase">5-6 Day Push-Pull-Legs Split</h4>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Engineered for elite athletic conditioning and high-volume target splits. Unilateral balance structures and explosive variables are embedded deeply in splits.
                </p>
                <div className="text-[10px] font-bold text-white uppercase bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono leading-relaxed">
                  Mon: Savage Push Focus<br />
                  Tue: Savage Pull Focus<br />
                  Wed: Heavy Legs & Core<br />
                  Thu: Active Rest Sync<br />
                  Fri: Accessory Intensity
                </div>
              </div>

            </div>
          </div>

          {/* Progression Rules Portal */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg sm:text-2xl font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="text-amber-400 animate-pulse" /> Strength Progression Criterias
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-3">
                <div className="text-xs font-black text-white uppercase tracking-widest pb-1 border-b border-red-500/20 flex items-center gap-1.5">
                  🛡️ When to Progress?
                </div>
                <ul className="space-y-2 text-[11px] text-[var(--muted)] leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-red-500">✓</span>
                    <span><strong>Set Comfort Rule:</strong> The user completes all sets described in the program with pristine form and zero biomechanical breakdown.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500">✓</span>
                    <span><strong>Consistency Buffer:</strong> Maintain precise adherence to the same level for a minimum of <strong>2 weeks</strong> without session drop-outs.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-black text-white uppercase tracking-widest pb-1 border-b border-red-500/20 flex items-center gap-1.5">
                  ⚡ Four Methods of Progression
                </div>
                <ol className="space-y-2 text-[11px] text-[var(--muted)] leading-relaxed list-decimal pl-4">
                  <li>
                    <strong>Metabolic Reps Increase:</strong> Reach for the upper bound of the reps range (e.g. going from 10 reps to 15 reps on pushups).
                  </li>
                  <li>
                    <strong>Force Sets Increase:</strong> Add an extra set of physical work (e.g. shifting from 3 sets to 4 sets) to increase aggregate kinetic volume.
                  </li>
                  <li>
                    <strong>Micro Loading (Gym):</strong> Slowly elevate structural machine load by the smallest increment (e.g. +2.5kg plate) once base reps comfort is achieved.
                  </li>
                  <li>
                    <strong>Dynamic Time Under Tension:</strong> Focus heavily on tempo controls (e.g., 3 seconds eccentric slow lowering phase to trigger tissue tear).
                  </li>
                </ol>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 4: SAFE MODIFICATIONS
          ========================================== */}
      {activeTab === 'mods' && (
        <div className="space-y-6">
          
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Shield className="text-emerald-400 shrink-0" size={24} />
              <div>
                <h3 className="text-lg sm:text-2xl font-display font-black text-white uppercase tracking-wider">
                  Injury-Prevention & Modifications Guide
                </h3>
                <p className="text-xs text-[var(--muted)]">Biomechanical overrides crafted by a physical therapist.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Knee pain box */}
              <div className="p-5 bg-[var(--sub)] border border-[var(--border)] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-red-400 uppercase tracking-widest">
                  ❌ Lateral Shear (Knee Pain)
                </div>
                <dt className="text-[10px] text-white/90 font-bold uppercase">Alternatives:</dt>
                <dd className="text-[11px] text-[var(--muted)] leading-relaxed space-y-1">
                  <div>• Omit Jump Squats → Sub Bodyweight Air Squats</div>
                  <div>• Forward Lunges → Sub Reverse Box Lunges</div>
                  <div>• Leg Extensions → Heavy Glute Hip Thrusts</div>
                </dd>
                <p className="text-[9px] text-[var(--muted)] italic pt-1.5 border-t border-white/5">
                  *Tip: Keeping femur vertically aligned blocks anterior shear load on the patellar tendon.
                </p>
              </div>

              {/* Low impact box */}
              <div className="p-5 bg-[var(--sub)] border border-[var(--border)] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-yellow-500 uppercase tracking-widest">
                  🩹 Low-Impact Options
                </div>
                <dt className="text-[10px] text-white/90 font-bold uppercase">Alternatives:</dt>
                <dd className="text-[11px] text-[var(--muted)] leading-relaxed space-y-1">
                  <div>• Burpees → Sub Bodyweight No-Jump Walkouts</div>
                  <div>• Jumping Jacks → Sub Step-out Side Jacks</div>
                  <div>• Heavy Machine Press → Sub Seated Cable Stack Press</div>
                </dd>
                <p className="text-[9px] text-[var(--muted)] italic pt-1.5 border-t border-white/5">
                  *Tip: Safe for recovery periods, seniors, and active tendonites.
                </p>
              </div>

              {/* No equipment substitutes */}
              <div className="p-5 bg-[var(--sub)] border border-[var(--border)] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-400 uppercase tracking-widest">
                  🏠 No-Equipment Swaps
                </div>
                <dt className="text-[10px] text-white/90 font-bold uppercase">Alternatives:</dt>
                <dd className="text-[11px] text-[var(--muted)] leading-relaxed space-y-1">
                  <div>• Lat Pulldowns → Sub Low Inverted Desk Rows</div>
                  <div>• Weighted Rows → Sub Water Jug Hammer Curls</div>
                  <div>• Cable Pec Flyes → Sub Prone Floor Chest Slices</div>
                </dd>
                <p className="text-[9px] text-[var(--muted)] italic pt-1.5 border-t border-white/5">
                  *Tip: Minimalist equipment doesn't mean lack of training results.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
