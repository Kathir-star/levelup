import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Copy, 
  Check, 
  Sparkles, 
  Video, 
  Layers, 
  Camera, 
  Eye, 
  ChevronRight, 
  User, 
  UserCheck, 
  Info,
  Sliders,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { ALL_50_EXERCISES } from './ExercisePromptLibrary';

// ==========================================
// 1. DATA DESIGN — ALL 12 EXERCISES STRUCTURE
// ==========================================

export interface AnimationSpec {
  id: string;
  name: string;
  category: 'PUSH' | 'PULL' | 'LEGS' | 'CORE' | 'MOBILITY' | 'CARDIO';
  description: {
    start: string;
    movement: string;
    end: string;
    loop: string;
  };
  malePrompt: string;
  femalePrompt: string;
  lottieBreakdown: {
    duration: number; // in seconds
    keyframes: {
      frame: string;
      description: string;
    }[];
    bodySegments: {
      segment: string;
      action: string;
    }[];
  };
  cameraStyle: {
    angle: string;
    lighting: string;
    background: string;
  };
  targetMuscles: string[];
}

const ANIMATION_SYSTEM_DATA: AnimationSpec[] = ALL_50_EXERCISES;

const _DEPRECATED_UNUSED_DATA: any[] = [
  // =================== PUSH ===================
  {
    id: "push_ups",
    name: "Classic Push-ups",
    category: "PUSH",
    targetMuscles: ["Chest", "Triceps", "Anterior Deltoids", "Core"],
    description: {
      start: "Prone position on the floor, hands paced slightly wider than shoulder-width, toes tucked, body forming a perfectly straight line from crown of head to heels.",
      movement: "Inhale, flex the elbows to lower the entire body as a rigid unit until the chest hovering 2 inches above the floor. Elbows flared back at a 45-degree angle.",
      end: "Exhale, press firmly through palm pads, extending elbows to return to starting high plank extension. Avoid hyperextending or locking knees.",
      loop: "Seamless 3.0-second oscillating transition from plank (0s) -> chest down deep knee-neutral hover (1.5s) -> plank extension (3.0s)."
    },
    malePrompt: "High-end 3D orthographic workout animation. An athletic male mannequin with broad shoulders and glowing orange highlighted chest muscles performs a slow, highly-disciplined push-up. Shot on 3/4 side profile view. Clean futuristic matte-black background, isometric minimal frame, neon cyan skeletal laser lines accenting perfect straight spinal alignment, dark cybernetic gym aesthetic, 8k resolution, smooth looping 60fps video.",
    femalePrompt: "High-end 3D orthographic workout animation. A toned athletic female mannequin with natural proportions and glowing orange highlighted chest muscles performs a slow, highly-disciplined push-up. Shot on 3/4 side profile view. Clean futuristic matte-black background, isometric minimal frame, neon cyan skeletal laser lines accenting perfect straight spinal alignment, dark cybernetic gym aesthetic, 8k resolution, smooth looping 60fps video.",
    lottieBreakdown: {
      duration: 3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Hands at (100, 200), feet at (280, 220), torso aligned straight on key axis." },
        { frame: "Frame 45 (Mid)", description: "Elbow joints bent past 90 degrees, chest lowered at (120, 215) near floor surface vector." },
        { frame: "Frame 90 (End)", description: "Arms fully extended, returning back flat to precise high plank elevation coordinates." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Elbow flexion lowering torso over 1.5s, then pressing extension up to full lock." },
        { segment: "Torso", action: "Braced tightly, keeping hips and spine on a rigid static line during full transit cycle." },
        { segment: "Legs", action: "Static pivot point at toes with calves kept fully tensioned." }
      ]
    },
    cameraStyle: {
      angle: "3/4 Profile Right Side view, slightly low-angle perspective to capture chest-to-pulley spacing",
      lighting: "Rim lighting in high-contrast cyan, with a localized warm pulsing orange glow on pectoral group",
      background: "Minimalist dark slate grid with subtle isometric floor plane grids"
    }
  },
  {
    id: "bench_press",
    name: "Barbell Bench Press",
    category: "PUSH",
    targetMuscles: ["Chest", "Anterior Deltoids", "Triceps"],
    description: {
      start: "Lying flat on bench, eyes directly under the barbell, rack gripped tightly slightly wider than shoulder-width, feet pinned wide flat to the floor.",
      movement: "Unrack barbell, descend bar slowly in a soft arc towards lower ribs/sternum, keeping wrists stacked and elbow pads vertically tracking underneath.",
      end: "Press bar straight up in a gentle backward curve, pushing upper torso back into the bench pad, arriving back directly stacked above eyes.",
      loop: "Continuous 3.5-second cycle: bar at full locked arms (0s) -> touches chest (1.75s) -> full locked extension (3.5s)."
    },
    malePrompt: "Realistic 3D fitness exercise visualizer. An athletic male model with broad shoulders lies flat on a futuristic workout bench performing a heavy barbell bench press. Side profile cross-section view. Matte dark gray aesthetic, neon orange active glowing chest and tricep muscles. Bright blue neon highlights running along the bar path. Loopable motion, cinematic edge-lit, high fidelity.",
    femalePrompt: "Realistic 3D fitness exercise visualizer. An athletic female model lies flat on a futuristic workout bench performing a barbell bench press with elite form. Side profile cross-section view. Matte dark gray aesthetic, neon orange active glowing chest and tricep muscles. Bright blue neon highlights running along the bar path. Loopable motion, cinematic edge-lit, high fidelity.",
    lottieBreakdown: {
      duration: 3.5,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Barbell resting in fully extended arm lock at upper limit (y=90)." },
        { frame: "Frame 52 (Mid)", description: "Bar touches lower edge of chest (y=210). Elbows tucked comfortably at 45 degrees." },
        { frame: "Frame 105 (End)", description: "Bar returns to height limit (y=90) directly vertical of the shoulder joint pivot." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Shifting elbow vertically inside a 90 to 45 degree angle." },
        { segment: "Torso", action: "Isometric chest retraction, shoulder blades firmly pinned and locked down against the pad." },
        { segment: "Barbell", action: "Perfect vertical-to-curved displacement path tracing." }
      ]
    },
    cameraStyle: {
      angle: "Transverse side profile view, horizontal bench level alignment",
      lighting: "High dynamic range backlighting, glowing focus spots pointing on chest mechanics",
      background: "Achromatic black background with fine wireframe engineering layout guides"
    }
  },
  {
    id: "shoulder_press",
    name: "Seated Dumbbell Shoulder Press",
    category: "PUSH",
    targetMuscles: ["Deltoids", "Triceps", "Upper Chest"],
    description: {
      start: "Seated upright with back supported, dumbbells held at ear height, elbows angled forward slightly around 30 degrees in the scapular plane.",
      movement: "Extend arms vertically to press dumbbells directly overhead in a smooth converging arc without shrugging the shoulders.",
      end: "Slowly lower the dumbbells back under strict eccentric control to ear level height, reloading the deltoids for next repetition.",
      loop: "Fluid 3.2-second progression: DBs at shoulder rack (0s) -> pressed overhead peak (1.6s) -> lowered to rack (3.2s)."
    },
    malePrompt: "Clean motion graphics animation of a seated athletic male mannequin with broad shoulders doing a seated dumbbell shoulder press. Front 45-degree angled view. Minimal dark space background, glowing orange/neon red active cap deltoid shoulder muscles. High-contrast neon blue paths tracking hand and arm motion vectors. Seamless seamless loop, 4k.",
    femalePrompt: "Clean motion graphics animation of a seated athletic female mannequin doing a seated dumbbell shoulder press. Front 45-degree angled view. Minimal dark space background, glowing orange/neon red active cap deltoid shoulder muscles. High-contrast neon blue paths tracking hand and arm motion vectors. Seamless seamless loop, 4k.",
    lottieBreakdown: {
      duration: 3.2,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Handles stacked at ear height, elbows bent at 90 degrees." },
        { frame: "Frame 48 (Mid)", description: "Arms extended overhead, dumbbells close but not touching, shoulders locked." },
        { frame: "Frame 96 (End)", description: "Eccentric descent completed to side rack, shoulders back in retraction." }
      ],
      bodySegments: [
        { segment: "Shoulders", action: "Maximum abduction and upward rotation without trapping neck." },
        { segment: "Arms", action: "Complete elbow extension directly inline with the spine." },
        { segment: "Torso", action: "Abdominals fully braced to shield lumbar spine from extension tilt." }
      ]
    },
    cameraStyle: {
      angle: "Front-angled 3/4 perspective to see symmetrical arm heights",
      lighting: "Top spotlighting focusing on shoulder cap fiber density",
      background: "Matt metallic dark panels with carbon fiber textures"
    }
  },

  // =================== PULL ===================
  {
    id: "pull_ups",
    name: "Hanging Deadhang Pull-ups",
    category: "PULL",
    targetMuscles: ["Lats", "Rhomboids", "Biceps", "Core"],
    description: {
      start: "Hanging from overhead bar, hands wider than shoulder-width, palms facing away. Body fully long and rigid, abs engaged.",
      movement: "Retract and depress shoulder blades, then pull elbows actively downward towards hip pockets to elevate center of mass.",
      end: "Chest pulls to touch the bar, chin clearing height line with shoulders pressed flat. Descend under strict slow control back to hang.",
      loop: "Graceful 4.0-second overhead loop: hanging extension (0s) -> chin over bar pull (2.0s) -> deadhang descent (4.0s)."
    },
    malePrompt: "Minimalistic vector wireframe animation. An athletic male model body performs a clean chin-over-bar pull-up. Back 3/4 view. Dark futuristic grid background, vivid neon orange active latissimus dorsi (back wing muscles) highlighting contractions. Smooth seamless transformation, continuous looping video clip.",
    femalePrompt: "Minimalistic vector wireframe animation. An athletic female model body performs a clean chin-over-bar pull-up with flawless poise. Back 3/4 view. Dark futuristic grid background, vivid neon orange active latissimus dorsi (back wing muscles) highlighting contractions. Smooth seamless transformation, continuous looping video clip.",
    lottieBreakdown: {
      duration: 4.0,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Hanging deadhang, scapula elevated, legs held straight with minor abdominal hollow." },
        { frame: "Frame 60 (Mid)", description: "Scapula retracted, elbows tucked, chin raised past bar coordinate (y=50)." },
        { frame: "Frame 120 (End)", description: "Controlled eccentric return back down to active deadhang base." }
      ],
      bodySegments: [
        { segment: "Scapula", action: "Active depression-retraction phase preceding elbow fold." },
        { segment: "Arms", action: "Elbows flexion pulling down to torso, hands static on overhead pipe." },
        { segment: "Core", action: "Hollow body static lock, denying lower back swinging drift." }
      ]
    },
    cameraStyle: {
      angle: "Back-angled view at 45 degrees, looking slightly up to emphasize lat contraction width",
      lighting: "Dramatic side lighting framing back contour borders",
      background: "Deep ink-black with horizontal cyan velocity markers"
    }
  },
  {
    id: "lat_pulldown",
    name: "Seated Lat Pulldown",
    category: "PULL",
    targetMuscles: ["Lats", "Rhomboids", "Middle Trapezius", "Forearms"],
    description: {
      start: "Seated with thighs locked under pads, arms extended holding wide pulldown bar, torso tilted back tiny 10-degree margin.",
      movement: "Pull bar down to upper collarbones, pulling from the elbows and contracting back wings while keeping shoulder blades depressed.",
      end: "Eccentrically glide the bar back to top stretch limit slowly, resisting the cable traction to keep muscles under tension.",
      loop: "Continuous 3.5-second cable motion: bar at maximum elevation (0s) -> pulled down under chin (1.75s) -> slow return to top (3.5s)."
    },
    malePrompt: "3D orthographic CAD style model display of a male performing seated cable lat pulldowns on gym machine. Angled side profile. Dark carbon-fiber metal mesh background, glowing neon orange on latissimus dorsi, rhomboids, biceps. Clean mechanical layout. Seamless loop.",
    femalePrompt: "3D orthographic CAD style model display of a female performing seated cable lat pulldowns on gym machine. Angled side profile. Dark carbon-fiber metal mesh background, glowing neon orange on latissimus dorsi, rhomboids, biceps. Clean mechanical layout. Seamless loop.",
    lottieBreakdown: {
      duration: 3.5,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Bar raised, arm line near parallel extension (y=60), lats under raw stretch." },
        { frame: "Frame 52 (Mid)", description: "Bar pulled flush to upper rib junction (y=165). Elbows tracking back-downwards." },
        { frame: "Frame 105 (End)", description: "Smooth stretch return to original vertical limit, maintaining joint spacing." }
      ],
      bodySegments: [
        { segment: "Back", action: "Adduction of lats, compressing middle back fibers into spine center." },
        { segment: "Arms", action: "Hands acting strictly as hooks, pulling bar on vertical cable track." },
        { segment: "Thighs", action: "Locked static under supportive pad structure." }
      ]
    },
    cameraStyle: {
      angle: "Side profile orthographic projection view",
      lighting: "Soft ambient shadow box, glowing laser tracers detailing cable pull paths",
      background: "Monochrome technical mesh blueprint pattern"
    }
  },
  {
    id: "seated_row",
    name: "Seated Cable Row",
    category: "PULL",
    targetMuscles: ["Rhomboids", "Middle Trapezius", "Lats", "Rear Delts"],
    description: {
      start: "Seated vertically against pad, knees slightly soft, arms extended straight ahead holding handle grip, back beautifully flat.",
      movement: "Initiate pull by squeezing shoulder blades together, pull handle towards lower ribs, dragging elbows far back past hips.",
      end: "Squeeze upper back dynamically for 1-second, then extend arms slowly while preventing rounded posture at spine.",
      loop: "Symmetrical 3.4-second horizontal rowing loop: full extension (0s) -> handles to gut tuck (1.7s) -> release (3.4s)."
    },
    malePrompt: "Orthographic technical gym animation. An athletic male model performs seated cable seated row. Full side profile. Techno dark space. High contrast orange highlight on active rhomboids and midback. Cyan lines trace the spine and chest angles. Perfectly endless repeating motion.",
    femalePrompt: "Orthographic technical gym animation. An athletic female model performs seated cable seated row. Full side profile. Techno dark space. High contrast orange highlight on active rhomboids and midback. Cyan lines trace the spine and chest angles. Perfectly endless repeating motion.",
    lottieBreakdown: {
      duration: 3.4,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Cable handle far forward close to pulley (x=240), arms fully relaxed." },
        { frame: "Frame 51 (Mid)", description: "Handle drawn close to torso belly (x=115), back straight, elbows pulled behind." },
        { frame: "Frame 102 (End)", description: "Arms slide back forward under continuous pull resistance, spine solid." }
      ],
      bodySegments: [
        { segment: "Shoulder Blades", action: "Complete horizontal traction retraction-protraction loop." },
        { segment: "Spine", action: "Kept in neutral column, zero front-to-back pelvis swaying." },
        { segment: "Feet", action: "Anchored on heavy metal frame plates." }
      ]
    },
    cameraStyle: {
      angle: "Direct orthogonal profile view, focusing on shoulder/spinal angles",
      lighting: "Hard key-light showing back muscle split line and traps",
      background: "Futuristic dark cyber facility background"
    }
  },

  // =================== LEGS ===================
  {
    id: "squats",
    name: "Bodyweight deep Squats",
    category: "LEGS",
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Hamstrings", "Calves"],
    description: {
      start: "Feet positioned shoulder-width apart, toes flared slightly outwards, spine tall and weight evenly spread across feet.",
      movement: "Hinge at hips, bend knees, and lower weight down as if sitting in a low chair. Keep knees stacked above toes, chest upright.",
      end: "Lower until thighs sink parallel or deeper. Push through the heels to stand upright, squeezing glutes hard at peak.",
      loop: "Fluid 3.0-second vertical cycle: fully upright (0s) -> deep bottom parallel squat (1.5s) -> upright lockout (3.0s)."
    },
    malePrompt: "Premium 3D minimalist workout animation. An athletic male model with strong legs executes a deep bodyweight squat. 3/4 side profile view. Clean matte-black vector aesthetic, glowing neon orange on active quadriceps and glutes. Blue neon lines showing straight posture. Endlessly looping, 60fps.",
    femalePrompt: "Premium 3D minimalist workout animation. An athletic female model with toned legs executes a deep bodyweight squat. 3/4 side profile view. Clean matte-black vector aesthetic, glowing neon orange on active quadriceps and glutes. Blue neon lines showing straight posture. Endlessly looping, 60fps.",
    lottieBreakdown: {
      duration: 3.0,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Standing upright, head at (100, 40), knees straight, posture vertically aligned." },
        { frame: "Frame 45 (Mid)", description: "Hips sunk to lowest depth coordinate (y=165), knee joint flexed past 90 degrees." },
        { frame: "Frame 90 (End)", description: "Pushed vertical, arriving back to full towering height state with core braced." }
      ],
      bodySegments: [
        { segment: "Hips", action: "Posterior hinge lowering vertically and horizontally back, returning upright." },
        { segment: "Knees", action: "Bends outward tracking directly above toes, avoiding inward col." },
        { segment: "Ankles", action: "Dorsiflexion supporting heel-loaded balance vector." }
      ]
    },
    cameraStyle: {
      angle: "3/4 side-front profile view, revealing ankle dorsiflexion and spine angle symmetry",
      lighting: "Omni ambient under-lighting framing thighs, glowing red-orange on glutes and quadriceps",
      background: "Minimal digital grid space with high-contrast accent lines"
    }
  },
  {
    id: "lunges",
    name: "Alternating Reverse Lunges",
    category: "LEGS",
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings", "Ankle Stabilizers"],
    description: {
      start: "Standing upright, feet together, hands resting on hips or at chest for balance controls.",
      movement: "Step one leg backward, dropping pelvis vertically until both knees bend at a perfect 90-degree angle. Front knee stacked over ankle.",
      end: "Push off the ball of rear foot, drawing front heel down to walk back up to initial standing position. Alternate legs.",
      loop: "Continuous 3.2-second movement: standing (0s) -> deep reverse step lower (1.6s) -> stepping back together (3.2s)."
    },
    malePrompt: "3D orthographic fitness training model view. An athletic male model performing a perfect deep reverse lunge. Side view. Clean dark technical background, glowing neon orange active glutes and quadriceps. Flowing neon lines trace the joints. Seamless repeating loop.",
    femalePrompt: "3D orthographic fitness training model view. An athletic female model performing a perfect deep reverse lunge with elegant balance. Side view. Clean dark technical background, glowing neon orange active glutes and quadriceps. Flowing neon lines trace the joints. Seamless repeating loop.",
    lottieBreakdown: {
      duration: 3.2,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Standing vertically, feet adjacent." },
        { frame: "Frame 48 (Mid)", description: "Left foot far back, left knee hovered 1 inch from floor, front knee at 90 deg." },
        { frame: "Frame 96 (End)", description: "Step up finished to start position, posture checked perfectly straight." }
      ],
      bodySegments: [
        { segment: "Legs", action: "Unilateral stride backwards, dropping gravity center, then exploding back forward." },
        { segment: "Footing", action: "Front heel remains 100% flat; rear foot hinges at toe balls." },
        { segment: "Shoulders", action: "Stacked directly over hip joints, zero vertical torso forward lean." }
      ]
    },
    cameraStyle: {
      angle: "Strict sagittal side view to verify front knee and rear knee angles",
      lighting: "Soft diffuse studio lights with glowing blue lines showing knee path tracks",
      background: "Flat deep gray space with high-contrast motion grids"
    }
  },
  {
    id: "leg_press",
    name: "Linear Leg Press Sled",
    category: "LEGS",
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings", "Calves"],
    description: {
      start: "Seated deep inside the machine chair, feet placed hip-width target-centered on the sled plate, safeties disengaged.",
      movement: "Inhale, slowly lower the heavy sled platform down-in towards the chest, flexing hips and knees to 90 degrees.",
      end: "Exhale, drive the platform away with force by extending knees without locking joints at full extension peak.",
      loop: "Smooth 3.6-second sled sliding loop: legs fully extended (0s) -> sled deep at chest (1.8s) -> legs extended (3.6s)."
    },
    malePrompt: "Biomechanical medical animation style. Transparent skin male mannequin performing leg press machine. Angled profile view. Deep dark grid space, glowing neon orange thigh muscles compressing and lengthening. Technical knee angles highlighted in neon blue. Perfect loop, 4k resolution.",
    femalePrompt: "Biomechanical medical animation style. Transparent skin female mannequin performing leg press machine. Angled profile view. Deep dark grid space, glowing neon orange thigh muscles compressing and lengthening. Technical knee angles highlighted in neon blue. Perfect loop, 4k resolution.",
    lottieBreakdown: {
      duration: 3.6,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Sled high, leg angle extended around 165 degrees (safeties clear)." },
        { frame: "Frame 54 (Mid)", description: "Sled retracted deep close to thoracic cage, knees spread at 90 degrees to toes." },
        { frame: "Frame 108 (End)", description: "Legs press sled platform up back vertically, muscles fully contracted." }
      ],
      bodySegments: [
        { segment: "Knees", action: "Flexing and pushing in linear alignment; no internal rolling (valgus)." },
        { segment: "Pelvis", action: "Sinks heavy into the seat base, zero tailbone pelvic tilt." },
        { segment: "Sled", action: "Slides along parallel 45-degree angle guides." }
      ]
    },
    cameraStyle: {
      angle: "Side Profile angle tilted slightly forward to show foot landing posture",
      lighting: "Linear glowing beams tracing the direction of sled displacement force",
      background: "Futuristic scientific diagnostic grid chamber"
    }
  },

  // =================== CORE ===================
  {
    id: "plank",
    name: "Classic Forearm Plank",
    category: "CORE",
    targetMuscles: ["Rectus Abdominis", "Transverse Abdominis", "Obliques", "Shoulders"],
    description: {
      start: "Forearms resting on the floor directly beneath the shoulders, fingers relaxed, toes tucked holding absolute straight line posture.",
      movement: "Brace the abdominals like preparing for a heavy blow. Contract glutes, lock legs, and actively push elbows into ground.",
      end: "Hold index point perfectly still, preventing hip drop or spine rounding throughout the set duration limit.",
      loop: "Isometric static loop (constant oscillation): subtle breathing motion of ribcage (0s -> 3.0s) while core glows in high intensity orange."
    },
    malePrompt: "Minimal 3D isometric mockup of an athletic male mannequin body sustaining a static forearm plank. Side profile view. Futuristic dark background, intense pulsating neon orange glow covering the deep abdominal wall and core muscles. Neon green alignment laser running end-to-end. Ultra crisp 8k, perfect loop.",
    femalePrompt: "Minimal 3D isometric mockup of an athletic female mannequin body sustaining a static forearm plank. Side profile view. Futuristic dark background, intense pulsating neon orange glow covering the deep abdominal wall and core muscles. Neon green alignment laser running end-to-end. Ultra crisp 8k, perfect loop.",
    lottieBreakdown: {
      duration: 3.0,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Full forearm support. Forearm at (80, 200), feet at (270, 200), body parallel." },
        { frame: "Frame 45 (Mid)", description: "Subtle lung expansion breathing shift (y changes by 1-2px only), abs clamped." },
        { frame: "Frame 90 (End)", description: "Spinal axis holds absolutely straight, complete loop transition frame." }
      ],
      bodySegments: [
        { segment: "Core", action: "Maximum isometric contraction, with absolute micro-movement representing breathing." },
        { segment: "Upper Back", action: "Scapula actively pushed wide to exclude shoulder sinking." },
        { segment: "Pelvis", action: "Tucked in slight posterior tilt, locking out lower back stress." }
      ]
    },
    cameraStyle: {
      angle: "Transverse direct orthogonal side profile",
      lighting: "High contrast rim light with a high-intensity localized red/orange abdominal fire pulse effect",
      background: "Achromatic matte background with sleek electronic technical lines"
    }
  },
  {
    id: "bicycle_crunch",
    name: "Alternating Bicycle Crunch",
    category: "CORE",
    targetMuscles: ["Obliques", "Rectus Abdominis", "Hip Flexors"],
    description: {
      start: "Lying flat on back, face up, hands placed lightly behind head, knees raised at a 90-degree angle, shoulder blades floating.",
      movement: "Rotate right shoulder towards the left knee while extending the right leg perfectly long 45 degrees off the floor.",
      end: "Immediately switch sides, dragging left shoulder towards the right knee while extending the left leg long, simulating a cycling motion.",
      loop: "Symmetrical 2.8-second rapid cycle: left knee in / right leg out (0s) -> right knee in / left leg out (1.4s) -> left knee in (2.8s)."
    },
    malePrompt: "Sleek 3D motion graphic illustration of an athletic male model in supine position doing a fast bicycle crunch. Left-side oblique view angle. Matt dark background, neon bright orange spinning obliques and abdominal core glow. Seamless loop of smooth skeletal lines, high fidelity, 4k.",
    femalePrompt: "Sleek 3D motion graphic illustration of an athletic female model in supine position doing a fast bicycle crunch. Left-side oblique view angle. Matt dark background, neon bright orange spinning obliques and abdominal core glow. Seamless loop of smooth skeletal lines, high fidelity, 4k.",
    lottieBreakdown: {
      duration: 2.8,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Left shoulder rotated up towards right knee (flexed), left leg extended long." },
        { frame: "Frame 42 (Mid)", description: "Right shoulder rotated up towards left knee (flexed), right leg extended long." },
        { frame: "Frame 84 (End)", description: "Transition back to original leg coordinate setup to tie loop closure." }
      ],
      bodySegments: [
        { segment: "Spine", action: "Thoracic crunch with alternate bilateral rotational pivots." },
        { segment: "Legs", action: "Alternating driving pistons extending from 90 to 0 degrees elevation coordinates." },
        { segment: "Ellbows", action: "Stay wide; rotation originates from the rib cage pivot." }
      ]
    },
    cameraStyle: {
      angle: "High-angle angled oblique perspective from head level down to hips",
      lighting: "Swirling neon spiral trail lights illustrating torso twist velocity",
      background: "Carbon dark grid with running blue data trackers"
    }
  },
  {
    id: "leg_raises",
    name: "Supine Leg Raises",
    category: "CORE",
    targetMuscles: ["Lower Abdominals", "Deep Hip Flexors (Iliopsoas)"],
    description: {
      start: "Lying flat in supine position, arms flat along sides pressing down, legs straight together extended fully onto floor floor.",
      movement: "Exhale, brace core, and pivot hip joints raising straight legs vertically together to a 90-degree angle.",
      end: "Inhale, slowly lower legs back down under extreme control, pausing 1 inch above the floor. Do not let lower back arch off the mat.",
      loop: "Smooth 3.5-second vertical cycle: legs flat hovering (0s) -> legs vertical 90 degrees (1.75s) -> legs flat hover (3.5s)."
    },
    malePrompt: "Futuristic orthographic 3D exercise animation. An athletic male mannequin performing strict flat leg raises. Side view. Black background, glowing neon orange active lower abdominal muscles. Fluorescent blue lines showing spine contact with floor. Loopable animation, 4k.",
    femalePrompt: "Futuristic orthographic 3D exercise animation. An athletic female mannequin performing strict flat leg raises. Side view. Black background, glowing neon orange active lower abdominal muscles. Fluorescent blue lines showing spine contact with floor. Loopable animation, 4k.",
    lottieBreakdown: {
      duration: 3.5,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Legs extended flat 1 inch above floor (y=210), lower back pressed down." },
        { frame: "Frame 52 (Mid)", description: "Legs raised 90 degrees pointing vertically straight up (y=110) over pelvis." },
        { frame: "Frame 105 (End)", description: "Eccentric descent finished directly at hover, ready for next vertical drive." }
      ],
      bodySegments: [
        { segment: "Legs", action: "Strict hip flexion-extension lever loop keeping knee joints completely locked." },
        { segment: "Lower Back", action: "Pressed static hard flat against floor (isometric bracing), preventing pelvic tilt." },
        { segment: "Arms", action: "Pushed into floor to leverage pelvic anchoring alignment." }
      ]
    },
    cameraStyle: {
      angle: "Strict orthogonal side profile, focusing on lower abdominal and lumbar alignment",
      lighting: "Sleek teal accent sweeps on floor plane, with glowing heat map on deep lower abs",
      background: "Achromatic black tech space with fine coordinate lines"
    }
  }
];

export interface ExerciseAnimationsProps {
  initialCategory?: 'ALL' | 'PUSH' | 'PULL' | 'LEGS' | 'CORE' | 'MOBILITY' | 'CARDIO';
  onCategoryChange?: (category: 'ALL' | 'PUSH' | 'PULL' | 'LEGS' | 'CORE' | 'MOBILITY' | 'CARDIO') => void;
}

export default function ExerciseAnimations({ initialCategory, onCategoryChange }: ExerciseAnimationsProps = {}) {
  const [activeEx, setActiveEx] = useState<AnimationSpec>(ANIMATION_SYSTEM_DATA[0]);
  const [tempGender, setTempGender] = useState<'male' | 'female'>('male');
  const [isPlaying, setIsPlaying] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState<'male' | 'female' | null>(null);
  const [tabIndex, setTabIndex] = useState<'visual' | 'prompts' | 'lottie' | 'guides'>('visual');
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState<'ALL' | 'PUSH' | 'PULL' | 'LEGS' | 'CORE' | 'MOBILITY' | 'CARDIO'>(initialCategory || 'ALL');

  useEffect(() => {
    if (initialCategory) {
      setCatFilter(initialCategory);
    }
  }, [initialCategory]);

  const handleCatFilterChange = (cat: 'ALL' | 'PUSH' | 'PULL' | 'LEGS' | 'CORE' | 'MOBILITY' | 'CARDIO') => {
    setCatFilter(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };

  // Animation vector coordinate calculator based on simple timer cycle
  const [time, setTime] = useState(0);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const animate = (timestamp: number) => {
    if (lastTimeRef.current !== null) {
      const delta = (timestamp - lastTimeRef.current) * 0.001;
      if (isPlaying) {
        setTime(prev => (prev + delta * 1.5) % (Math.PI * 2));
      }
    }
    lastTimeRef.current = timestamp;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  // Compute actual dynamic frame-tick interpolation values (0 to 1 back and forth)
  const interpolation = Math.sin(time) * 0.5 + 0.5;

  const copyToClipboard = (text: string, type: 'male' | 'female') => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(type);
    setTimeout(() => setCopiedPrompt(null), 3000);
  };

  const filteredExercises = ANIMATION_SYSTEM_DATA.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = catFilter === 'ALL' || ex.category === catFilter;
    return matchSearch && matchCat;
  });

  // Dynamic SVG path generator based on exercise and timer interpolation
  const renderSVGFigure = () => {
    const isM = tempGender === 'male';
    const shoulderWidth = isM ? 16 : 10;
    const bodyThickness = isM ? 18 : 12;
    const colorPrimary = "#00ffff"; // Neon Cyan for Skeleton
    const colorActive = "#ff5500"; // Neon Orange for Active Muscles

    // Build unique animated coordinate frames for each exercise
    switch (activeEx.id) {
      case 'push_ups': {
        // Pivot point at toes: (210, 190)
        // Head moves up and down
        // Down position: head is low, arms bent. Up position: head is high, arms straight.
        const angle = -15 * (1 - interpolation * 0.8) * (Math.PI / 180);
        const startX = 210;
        const startY = 190;
        const bodyLen = 140;

        // Shoulder coordinate
        const shoulderX = startX - bodyLen * Math.cos(angle);
        const shoulderY = startY + bodyLen * Math.sin(angle);

        // Head coordinate
        const headX = shoulderX - 25 * Math.cos(angle);
        const headY = shoulderY + 25 * Math.sin(angle);

        // Elbow coordinate (flexes out on descend)
        const handX = startX - 110;
        const handY = startY + 5;
        const elbowX = (shoulderX + handX) / 2 + 15 * (1 - interpolation);
        const elbowY = (shoulderY + handY) / 2 + 25 * (1 - interpolation);

        return (
          <g className="transition-all duration-75">
            {/* Ground */}
            <line x1="50" y1="200" x2="300" y2="200" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
            
            {/* Chest Glow (Active Muscle Group) */}
            <circle 
              cx={(shoulderX + startX) / 2} 
              cy={(shoulderY + startY) / 2 - 5} 
              r={15 + (1 - interpolation) * 15} 
              fill={colorActive} 
              opacity={(1 - interpolation) * 0.5 + 0.1}
              className="blur-md"
            />

            {/* Fleshed Torso Outline */}
            <path 
              d={`M ${startX} ${startY} L ${shoulderX} ${shoulderY}`} 
              stroke={colorActive} 
              strokeWidth={bodyThickness} 
              strokeLinecap="round" 
              opacity={0.4}
            />

            {/* Skeleton Bone Rig */}
            <line x1={startX} y1={startY} x2={shoulderX} y2={shoulderY} stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />
            <circle cx={shoulderX} cy={shoulderY} r="6" fill="#fff" />
            <circle cx={startX} cy={startY} r="4" fill="#666" />
            
            {/* Head */}
            <circle cx={headX} cy={headY} r={shoulderWidth * 1.1} fill={colorPrimary} opacity="0.8" />
            
            {/* Arms */}
            <polyline 
              points={`${shoulderX},${shoulderY} ${elbowX},${elbowY} ${handX},${handY}`} 
              fill="none" 
              stroke={colorPrimary} 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* Highlight Chest and Tricep indicators */}
            <path 
              d={`M ${shoulderX} ${shoulderY} L ${elbowX} ${elbowY}`} 
              stroke={colorActive} 
              strokeWidth="8" 
              strokeLinecap="round" 
              opacity={(1 - interpolation) * 0.7} 
            />
          </g>
        );
      }
      case 'bench_press': {
        // Lying on flat bench: y=160
        // Head at x=100, hips at x=200, feet flat at x=220, y=200
        // Barbell moves vertically at x=140 from y=80 down to y=150
        const barY = 80 + interpolation * 70;
        const chestX = 140;
        const chestY = 155;
        
        // Elbow position folds down
        const armX = chestX;
        const armY = chestY;
        const elbowX = 140 - 25 * (1 - interpolation);
        const elbowY = 155 + 20 * interpolation;

        return (
          <g className="transition-all duration-75">
            {/* Bench Frame */}
            <line x1="80" y1="160" x2="220" y2="160" stroke="#444" strokeWidth="8" strokeLinecap="round" />
            <line x1="100" y1="160" x2="100" y2="200" stroke="#444" strokeWidth="6" />
            <line x1="200" y1="160" x2="200" y2="200" stroke="#444" strokeWidth="6" />
            
            {/* Chest Glow */}
            <circle 
              cx={chestX} 
              cy={chestY - 10} 
              r={12 + interpolation * 15} 
              fill={colorActive} 
              opacity={interpolation * 0.5 + 0.1}
              className="blur-md"
            />

            {/* Torso */}
            <line x1="90" y1="155" x2="200" y2="155" stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
            <circle cx="100" cy="140" r="12" fill={colorPrimary} opacity="0.8" /> {/* Head */}

            {/* Leg */}
            <polyline points="200,155 210,180 220,200" fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />

            {/* Arms tracking bar */}
            <polyline 
              points={`140,155 ${elbowX},${elbowY} 140,${barY}`} 
              fill="none" 
              stroke={colorPrimary} 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Glowing Active Chest Muscle */}
            <path 
              d={`M 120 155 Q 140 ${165 - 15 * interpolation} 160 155`}
              stroke={colorActive}
              strokeWidth="6"
              fill="none"
              opacity={interpolation * 0.8 + 0.2}
            />

            {/* Barbell Sled */}
            <g transform={`translate(0, ${barY})`}>
              {/* Bar */}
              <line x1="80" y1="0" x2="200" y2="0" stroke="#aaa" strokeWidth="3" />
              {/* Heavy Weights */}
              <rect x="70" y="-12" width="10" height="24" rx="2" fill="#222" stroke="#fff" strokeWidth="1" />
              <rect x="62" y="-9" width="8" height="18" rx="1" fill="#444" />
              <rect x="200" y="-12" width="10" height="24" rx="2" fill="#222" stroke="#fff" strokeWidth="1" />
              <rect x="210" y="-9" width="8" height="18" rx="1" fill="#444" />
              {/* Force directional glowing vectors */}
              <path d="M 140 -15 L 140 -30 M 140 -30 L 135 -25 M 140 -30 L 145 -25" stroke={colorPrimary} strokeWidth="2" opacity={1 - interpolation} />
            </g>
          </g>
        );
      }
      case 'shoulder_press': {
        // Seated vertical post
        // Torso: (150, 160) up to (150, 110)
        // Arms lift dumbbell from y=105 to y=50
        const dy = 105 - interpolation * 55;
        const headX = 150;
        const headY = 90;

        // Symmetric arm positions
        const leftElbowX = 150 - 25 * (1 - interpolation);
        const leftElbowY = 110 + 15 * (1 - interpolation);
        const rightElbowX = 150 + 25 * (1 - interpolation);
        const rightElbowY = 110 + 15 * (1 - interpolation);

        return (
          <g className="transition-all duration-75">
            {/* Seat platform */}
            <line x1="120" y1="165" x2="180" y2="165" stroke="#444" strokeWidth="6" />
            <line x1="135" y1="165" x2="135" y2="105" stroke="#333" strokeWidth="5" /> {/* Backrest */}

            {/* Shoulder Muscle Heat */}
            <circle cx="132" cy="110" r="10" fill={colorActive} opacity={interpolation * 0.6 + 0.1} className="blur-sm" />
            <circle cx="168" cy="110" r="10" fill={colorActive} opacity={interpolation * 0.6 + 0.1} className="blur-sm" />

            {/* Spine Torso */}
            <line x1="150" y1="165" x2="150" y2="110" stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
            <circle cx={headX} cy={headY} r="12" fill={colorPrimary} opacity="0.8" /> {/* Head */}

            {/* Left Arm & DB */}
            <polyline points={`135,110 ${leftElbowX},${leftElbowY} 130,${dy}`} fill="none" stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />
            <circle cx="130" cy={dy} r="2" fill="#fff" />
            <line x1="118" y1={dy} x2="142" y2={dy} stroke="#ffd700" strokeWidth="5" strokeLinecap="round" />
            <rect x="114" y={dy - 6} width="6" height="12" fill="#222" />
            <rect x="140" y={dy - 6} width="6" height="12" fill="#222" />

            {/* Right Arm & DB */}
            <polyline points={`165,110 ${rightElbowX},${rightElbowY} 170,${dy}`} fill="none" stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />
            <circle cx="170" cy={dy} r="2" fill="#fff" />
            <line x1="158" y1={dy} x2="182" y2={dy} stroke="#ffd700" strokeWidth="5" strokeLinecap="round" />
            <rect x="154" y={dy - 6} width="6" height="12" fill="#222" />
            <rect x="180" y={dy - 6} width="6" height="12" fill="#222" />
          </g>
        );
      }
      case 'pull_ups': {
        // Hang from horizontal bar (y=50)
        // Hands fixed at x=100 & x=200, y=50
        // Body shifts vertically
        const bodyYOffset = interpolation * 45; // moves from y=0 (hang) to y=45 (chin over bar)
        const neckX = 150;
        const neckY = 120 - bodyYOffset;
        const hipsY = 190 - bodyYOffset;

        // Custom animated elbows
        const leftElbowX = 150 - 30 * (1 - interpolation * 0.5);
        const leftElbowY = 90 - bodyYOffset + 25 * (1 - interpolation);
        const rightElbowX = 150 + 30 * (1 - interpolation * 0.5);
        const rightElbowY = 90 - bodyYOffset + 25 * (1 - interpolation);

        return (
          <g className="transition-all duration-75">
            {/* The Horizontal Bar */}
            <line x1="70" y1="50" x2="230" y2="50" stroke="#777" strokeWidth="4" />
            <line x1="80" y1="50" x2="80" y2="200" stroke="#444" strokeWidth="2" strokeDasharray="3,3" />
            <line x1="220" y1="50" x2="220" y2="200" stroke="#444" strokeWidth="2" strokeDasharray="3,3" />

            {/* Lats Wing Glow */}
            <path 
              d={`M ${neckX - 25} ${neckY + 10} Q ${neckX} ${neckY + 25} ${neckX + 25} ${neckY + 10} L ${neckX + 15} ${hipsY - 20} L ${neckX - 15} ${hipsY - 20} Z`}
              fill={colorActive}
              opacity={interpolation * 0.6 + 0.1}
              className="blur-md"
            />

            {/* Torso Spine Back */}
            <line x1="150" y1={neckY} x2="150" y2={hipsY} stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
            <circle cx="150" cy={neckY - 18} r="11" fill={colorPrimary} opacity="0.8" /> {/* Head */}

            {/* Bent Legs */}
            <polyline points={`150,${hipsY} 145,${hipsY + 30} 135,${hipsY + 45}`} fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />
            <polyline points={`150,${hipsY} 155,${hipsY + 30} 165,${hipsY + 45}`} fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />

            {/* Arms pulling from (100,50) and (200,50) to shoulders */}
            <polyline points={`135,${neckY + 5} ${leftElbowX},${leftElbowY} 100,50`} fill="none" stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />
            <polyline points={`165,${neckY + 5} ${rightElbowX},${rightElbowY} 200,50`} fill="none" stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      }
      case 'lat_pulldown': {
        // Seated on seat
        // Pulley bar is pulled down from y=50 to y=110
        const barY = 50 + interpolation * 50;
        const elbowY = 115 + interpolation * 25;
        const leftElbowX = 150 - 32 + 10 * interpolation;
        const rightElbowX = 150 + 32 - 10 * interpolation;

        return (
          <g className="transition-all duration-75">
            {/* Machine frame */}
            <polyline points="150,200 150,40 180,40" fill="none" stroke="#333" strokeWidth="6" />
            <line x1="110" y1="160" x2="190" y2="160" stroke="#444" strokeWidth="8" strokeLinecap="round" />

            {/* Lats wings heat outline */}
            <path 
              d={`M 130 115 Q 150 140 170 115 L 160 155 L 140 155 Z`}
              fill={colorActive}
              opacity={interpolation * 0.65 + 0.1}
              className="blur-md"
            />

            {/* Spine */}
            <line x1="150" y1="115" x2="150" y2="160" stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
            <circle cx="150" cy="98" r="11" fill={colorPrimary} opacity="0.8" />

            {/* Thighs pad */}
            <rect x="130" y="145" width="40" height="8" rx="2" fill="#555" />

            {/* Leg */}
            <polyline points="150,160 162,185 162,200" fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />

            {/* Pulley Cable */}
            <line x1="150" y1="40" x2="150" y2={barY} stroke="#111" strokeWidth="2" />

            {/* Pully bar */}
            <line x1="95" y1={barY} x2="205" y2={barY} stroke="#aaa" strokeWidth="4" strokeLinecap="round" />

            {/* Arms */}
            <polyline points={`140,115 ${leftElbowX},${elbowY} 105,${barY}`} fill="none" stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />
            <polyline points={`160,115 ${rightElbowX},${elbowY} 195,${barY}`} fill="none" stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      }
      case 'seated_row': {
        // Horizontally pulled pulley
        // Torso tilts slightly
        const pullFactor = interpolation; // 0 to 1
        const torsoHingeX = 145 + pullFactor * 8;
        const shoulderX = 145 + pullFactor * 5;
        const handX = 110 + pullFactor * 55;
        const elbowX = shoulderX - 15 - (1 - pullFactor) * 20;
        const elbowY = 125 + (1 - pullFactor) * 5;

        return (
          <g className="transition-all duration-75">
            {/* Seat and pulley wheel footer */}
            <line x1="60" y1="170" x2="210" y2="170" stroke="#444" strokeWidth="6" />
            <line x1="80" y1="170" x2="80" y2="110" stroke="#333" strokeWidth="4" /> {/* pulley tower stand */}
            <circle cx="80" cy="115" r="10" fill="none" stroke="#555" strokeWidth="3" />

            {/* Midback Row Glow heat map */}
            <circle cx={shoulderX - 12} cy="120" r="12" fill={colorActive} opacity={pullFactor * 0.7 + 0.1} className="blur-sm" />

            {/* Torso Spine */}
            <line x1={torsoHingeX} y1="170" x2={shoulderX} y2="115" stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
            <circle cx={shoulderX} cy="98" r="11" fill={colorPrimary} opacity="0.8" />

            {/* Pulley wire line */}
            <line x1="80" y1="115" x2={handX} y2="115" stroke="#222" strokeWidth="1.5" />

            {/* Sitting leg */}
            <polyline points={`${torsoHingeX},170 120,168 110,135`} fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />

            {/* Arm row */}
            <polyline points={`${shoulderX},118 ${elbowX},${elbowY} ${handX},115`} fill="none" stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      }
      case 'squats': {
        // Hips transition down-back
        const hY = 120 + interpolation * 50;
        const hX = 140 - interpolation * 15;
        const kneeY = 160 + interpolation * 10;
        const kneeX = 175 + interpolation * 5;
        const headY = hY - 45;
        const headX = hX + 5;

        return (
          <g className="transition-all duration-75">
            {/* Floor board */}
            <line x1="90" y1="200" x2="230" y2="200" stroke="#333" strokeWidth="2" />

            {/* Quads and Glutes massive active flashing area */}
            <path 
              d={`M ${hX} ${hY} L ${kneeX} ${kneeY} L 160 200 Z`} 
              fill={colorActive} 
              opacity={interpolation * 0.6 + 0.15}
              className="blur-md"
            />

            {/* Legs Skeletal Bones */}
            {/* Hip to Knee */}
            <line x1={hX} y1={hY} x2={kneeX} y2={kneeY} stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />
            {/* Knee to Foot (static foot at 160, 200) */}
            <line x1={kneeX} y1={kneeY} x2="160" y2="200" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />

            {/* Foot plate */}
            <line x1="145" y1="200" x2="175" y2="200" stroke={colorPrimary} strokeWidth="4" />

            {/* Spine Back Segment */}
            <line x1={hX} y1={hY} x2={hX + 15} y2={hY - 40} stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
            {/* Head */}
            <circle cx={headX} cy={headY} r="11" fill={colorPrimary} opacity="0.8" />

            {/* Arm extension for balance balance */}
            <line x1={hX + 12} y1={hY - 35} x2={hX + 45} y2={hY - 35} stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      }
      case 'lunges': {
        // Sagittal lunge
        const step = interpolation; // 0 to 1
        // Hip center moves vertically down on lunge
        const hipX = 150;
        const hipY = 120 + step * 40;
        const frontFootX = 190;
        const frontFootY = 195;
        const frontKneeX = 190;
        const frontKneeY = hipY + 15 + step * 15;

        // Rear toe is static at x=100, y=195. Heel is raised.
        const rearKneeX = 118 + (1 - step) * 15;
        const rearKneeY = hipY + 18 + step * 18;

        return (
          <g className="transition-all duration-75">
            {/* Ground grid */}
            <line x1="70" y1="195" x2="230" y2="195" stroke="#333" strokeWidth="2" />

            {/* Highlighted active muscles */}
            <polyline points={`${hipX},${hipY} ${frontKneeX},${frontKneeY} ${frontFootX},${frontFootY}`} fill="none" stroke={colorActive} strokeWidth={bodyThickness} opacity={step * 0.5 + 0.15} strokeLinecap="round" className="blur-sm" />
            <polyline points={`${hipX},${hipY} ${rearKneeX},${rearKneeY} 100,195`} fill="none" stroke={colorActive} strokeWidth={bodyThickness} opacity={step * 0.5 + 0.15} strokeLinecap="round" className="blur-sm" />

            {/* Front Leg bones */}
            <polyline points={`${hipX},${hipY} ${frontKneeX},${frontKneeY} ${frontFootX},${frontFootY}`} fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Rear Leg bones */}
            <polyline points={`${hipX},${hipY} ${rearKneeX},${rearKneeY} 100,195`} fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Spine */}
            <line x1={hipX} y1={hipY} x2={hipX} y2={hipY - 40} stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
            <circle cx={hipX} cy={hipY - 55} r="11" fill={colorPrimary} opacity="0.8" />
          </g>
        );
      }
      case 'leg_press': {
        // Platform tilts at 45 degree angle
        // Plate coordinates: start at upper right, slides down towards chest
        const travel = interpolation; // 0 to 1
        const plateY = 80 + travel * 45;
        const plateX = 180 - travel * 45;

        const buttX = 100;
        const buttY = 160;

        // Knee joint flexes
        const kneeX = 100 + (1 - travel) * 20 + travel * 35;
        const kneeY = 160 - (1 - travel) * 45 - travel * 20;

        return (
          <g className="transition-all duration-75">
            {/* Sled tracks */}
            <line x1="75" y1="185" x2="205" y2="55" stroke="#444" strokeWidth="3" strokeDasharray="4,4" />
            {/* Seated frame box */}
            <polyline points="75,185 100,160 90,120" fill="none" stroke="#222" strokeWidth="6" />

            {/* active thigh glow */}
            <path d={`M ${buttX} ${buttY} L ${kneeX} ${kneeY} L ${plateX} ${plateY} Z`} fill={colorActive} opacity={travel * 0.6 + 0.1} className="blur-md" />

            {/* Lower Body Bone segments */}
            <polyline points={`${buttX},${buttY} ${kneeX},${kneeY} ${plateX},${plateY}`} fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Sliding footplate bar */}
            <line x1={plateX - 15} y1={plateY - 15} x2={plateX + 15} y2={plateY + 15} stroke="#888" strokeWidth="5" />

            {/* Spinal support */}
            <line x1={buttX} y1={buttY} x2={115} y2={125} stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
            <circle cx="122" cy="110" r="11" fill={colorPrimary} opacity="0.8" />
          </g>
        );
      }
      case 'plank': {
        // Isometric static plank body holding vector line
        // Forearm at (80, 160) to (110, 160), toes dynamic at x=220, y=160
        // subtle cyclic breathing shifts the torso y values coordinates up and down by 2px
        const breatheY = 153 + Math.sin(time * 3) * 2.5;
        const headX = 75;
        const headY = breatheY - 8;

        return (
          <g className="transition-all duration-75">
            {/* Floor board line */}
            <line x1="60" y1="175" x2="250" y2="175" stroke="#333" strokeWidth="2" />

            {/* Glowing red core center of gravity spot */}
            <circle cx="145" cy={breatheY + 10} r="18" fill={colorActive} opacity="0.65" className="blur-md animate-pulse" />

            {/* Solid full straight trunk frame */}
            <line x1="110" y1={breatheY} x2="220" y2="173" stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
            <circle cx={headX} cy={headY} r="11" fill={colorPrimary} opacity="0.8" />

            {/* Forearm lock triangle */}
            <polyline points={`110,${breatheY} 110,172 85,172`} fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Toe pin */}
            <circle cx="220" cy="173" r="3" fill="#666" />
          </g>
        );
      }
      case 'bicycle_crunch': {
        // Right side crunching rotation loop
        // Left elbow to Right knee, then alternate
        const cycle = interpolation; // oscillating 0 to 1
        const rightKneeX = 135 + cycle * 35;
        const rightKneeY = 155 - cycle * 30;

        const leftKneeX = 185 - cycle * 35;
        const leftKneeY = 125 + cycle * 30;

        return (
          <g className="transition-all duration-75">
            {/* Ground mat */}
            <line x1="70" y1="185" x2="230" y2="185" stroke="#333" strokeWidth="1.5" />

            {/* Spinning Oblique Heat Circle */}
            <circle cx="130" cy="145" r="15" fill={colorActive} opacity="0.6" className="blur-sm animate-pulse" />

            {/* Spine flat support curve */}
            <path d="M 90 150 Q 120 160 160 155" fill="none" stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
            <circle cx="85" cy="138" r="11" fill={colorPrimary} opacity="0.8" />

            {/* Leg A - moving back & forth piston */}
            <polyline points={`160,155 170,${rightKneeY} ${rightKneeX},175`} fill="none" stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />

            {/* Leg B - opposite phase */}
            <polyline points={`160,155 150,${leftKneeY} ${leftKneeX},175`} fill="none" stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />

            {/* Hands behind head crunching elbow frame */}
            <polyline points="105,148 95,125 80,135" fill="none" stroke={colorPrimary} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      }
      case 'leg_raises': {
        // Leg lever raise 0 to 90
        const angle = interpolation * 85 * (Math.PI / 180); // raises up from horizontal
        const hipX = 170;
        const hipY = 165;
        const legLen = 80;

        const footX = hipX - legLen * Math.cos(angle);
        const footY = hipY - legLen * Math.sin(angle);

        return (
          <g className="transition-all duration-75">
            {/* Ground */}
            <line x1="60" y1="170" x2="250" y2="170" stroke="#333" strokeWidth="2" />

            {/* Lower abdomen critical load zone */}
            <circle cx="155" cy="155" r="14" fill={colorActive} opacity={0.6} className="blur-sm" />

            {/* Flat Torso */}
            <line x1="170" y1="165" x2="90" y2="162" stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
            <circle cx="80" cy="152" r="11" fill={colorPrimary} opacity="0.8" />

            {/* Pivot Legs Lever */}
            <line x1={hipX} y1={hipY} x2={footX} y2={footY} stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />
            <circle cx={hipX} cy={hipY} r="5" fill="#aaa" />

            {/* Flashing target muscle bar */}
            <line x1="145" y1="165" x2="168" y2="165" stroke={colorActive} strokeWidth="8" strokeLinecap="round" opacity={0.8} />
          </g>
        );
      }
      default: {
        // Fallback: A highly-polished, category-specific skeletal visualizer that animates dynamically!
        const cycle = interpolation; // 0 to 1 back and forth
        
        if (activeEx.category === 'PUSH') {
          // Horizontal/Vertical Push-up style piston
          const travel = cycle * 35;
          const bodyY = 140 + travel * 0.4;
          return (
            <g className="transition-all duration-75">
              <line x1="60" y1="180" x2="260" y2="180" stroke="#333" strokeWidth="2" />
              {/* Active chest/arms heat glow */}
              <circle cx="130" cy={bodyY} r="16" fill={colorActive} opacity={cycle * 0.6 + 0.1} className="blur-md" />
              {/* Skeleton Frame */}
              <line x1="100" y1={bodyY} x2="200" y2="175" stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
              <polyline points={`100,${bodyY} 95,${bodyY + 20} 80,175`} fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />
              <circle cx="95" cy={bodyY - 10} r="10" fill={colorPrimary} opacity="0.8" />
            </g>
          );
        } else if (activeEx.category === 'PULL') {
          // Lat pull / Row pulling action
          const pullX = 170 - cycle * 40;
          return (
            <g className="transition-all duration-75">
              {/* Cable line */}
              <line x1="220" y1="100" x2={pullX} y2="135" stroke="#555" strokeWidth="2" strokeDasharray="3,3" />
              {/* Back active glow */}
              <circle cx="110" cy="140" r="15" fill={colorActive} opacity={cycle * 0.7 + 0.1} className="blur-lg" />
              {/* Spine and arms */}
              <line x1="100" y1="175" x2="120" y2="120" stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
              <polyline points={`120,120 150,${135 + Math.sin(time)*5} ${pullX},135`} fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />
              <circle cx="123" cy="108" r="10" fill={colorPrimary} opacity="0.8" />
            </g>
          );
        } else if (activeEx.category === 'LEGS') {
          // Squatting movement
          const squatDepth = cycle * 45;
          const hipY = 120 + squatDepth;
          const kneeX = 145 + squatDepth * 0.4;
          const kneeY = 150 + squatDepth * 0.2;
          return (
            <g className="transition-all duration-75">
              <line x1="60" y1="180" x2="260" y2="180" stroke="#333" strokeWidth="2" />
              {/* Quadriceps heat glow */}
              <circle cx={kneeX - 10} cy={kneeY - 10} r="16" fill={colorActive} opacity={cycle * 0.6 + 0.15} className="blur-md" />
              {/* Skeletal leg linkages */}
              <polyline points={`110,${hipY - 25} 110,${hipY} ${kneeX},${kneeY} 160,180`} fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="110" cy={hipY - 38} r="10" fill={colorPrimary} opacity="0.8" />
            </g>
          );
        } else if (activeEx.category === 'CORE') {
          // Isometric floor plank hold / Leg Raise hybrid
          const rotateAngle = cycle * 30 * (Math.PI / 180);
          const pivotX = 150;
          const pivotY = 160;
          const legX = pivotX - 70 * Math.cos(rotateAngle);
          const legY = pivotY - 70 * Math.sin(rotateAngle);
          return (
            <g className="transition-all duration-75">
              <line x1="60" y1="175" x2="260" y2="175" stroke="#333" strokeWidth="2" />
              {/* Abs core active heat */}
              <circle cx="140" cy="155" r="15" fill={colorActive} opacity="0.65" className="blur-sm" />
              {/* Torso */}
              <line x1="90" y1="150" x2={pivotX} y2={pivotY} stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
              <circle cx="80" cy="140" r="11" fill={colorPrimary} opacity="0.8" />
              {/* Legs raising upward */}
              <line x1={pivotX} y1={pivotY} x2={legX} y2={legY} stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" />
            </g>
          );
        } else if (activeEx.category === 'MOBILITY') {
          // Arm circles / gentle thoracic stretch
          const radius = 25;
          const orbitX = 160 + Math.cos(time * 2) * radius;
          const orbitY = 120 + Math.sin(time * 2) * radius;
          return (
            <g className="transition-all duration-75">
              {/* Flow circles */}
              <circle cx="160" cy="120" r={radius} fill="none" stroke={colorActive} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
              {/* Joints anchor */}
              <circle cx="120" cy="118" r="14" fill={colorActive} opacity="0.3" className="blur-md" />
              {/* Skeleton body */}
              <line x1="120" y1="110" x2="120" y2="165" stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
              <circle cx="120" cy="98" r="10" fill={colorPrimary} opacity="0.8" />
              {/* Circling arm track */}
              <polyline points={`120,118 140,120 ${orbitX},${orbitY}`} fill="none" stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />
              {/* Stand base */}
              <line x1="80" y1="175" x2="160" y2="175" stroke="#333" strokeWidth="2" />
            </g>
          );
        } else if (activeEx.category === 'CARDIO') {
          // Standing running high-knees / bounding jump action
          const legHeight = Math.abs(Math.sin(time * 3)) * 40;
          return (
            <g className="transition-all duration-75">
              <line x1="60" y1="180" x2="260" y2="180" stroke="#333" strokeWidth="2" />
              {/* Fast heart / lung glowing heat map */}
              <circle cx="120" cy="122" r="18" fill={colorActive} opacity={cycle * 0.6 + 0.1} className="blur-md shadow-inner" />
              {/* Running spine */}
              <line x1="120" y1="115" x2="120" y2="155" stroke={colorPrimary} strokeWidth={bodyThickness} strokeLinecap="round" />
              <circle cx="120" cy="102" r="10" fill={colorPrimary} opacity="0.8" />
              {/* Leg 1: dynamic pumping high runner knee */}
              <polyline points={`120,155 140,${155 - legHeight} 150,${180 - legHeight * 0.2}`} fill="none" stroke={colorPrimary} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Leg 2: support push-off */}
              <polyline points="120,155 110,165 105,180" fill="none" stroke={colorPrimary} strokeWidth="4" strokeLinecap="round" />
            </g>
          );
        }
        return null;
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* ==========================================
          HEADER PANEL — SYSTEM BRANDING & CONTROLS
          ========================================== */}
      <div className="bg-gradient-to-br from-black via-[#0a0f1d] to-[#040815] border border-cyan-500/20 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -mr-36 -mt-36 pointer-events-none" />
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 relative z-10 shrink-0">
          <Sparkles size={36} className="text-white" />
        </div>
        <div className="flex-1 min-w-[260px] relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[9px] bg-cyan-500/20 border border-cyan-500/35 text-cyan-400 px-2.5 py-0.5 rounded-full font-black tracking-widest uppercase">
              Motion Studio v2.4
            </span>
            <span className="text-[9px] bg-indigo-500/20 border border-indigo-500/35 text-indigo-400 px-2.5 py-0.5 rounded-full font-black tracking-widest uppercase">
              Loopable Vector Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight leading-none uppercase">
            Skeletal Animation System
          </h2>
          <p className="text-[var(--muted)] text-xs sm:text-sm leading-relaxed max-w-xl mt-2 font-medium">
            Loopable multi-angle visualizer guides. Complete matching prompting scripts, 
            keyframe breakdowns, and active muscle maps built for production-ready design integration.
          </p>
        </div>
      </div>

      {/* ==========================================
          FILTER SEARCH BAR CONTROLS
          ========================================== */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-black/40 p-4 rounded-2xl border border-[var(--border)]">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            <Eye size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search movement mechanics..."
            className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white placeholder-[var(--muted)] focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto no-scrollbar gap-1 w-full sm:w-auto pb-1">
          {(['ALL', 'PUSH', 'PULL', 'LEGS', 'CORE', 'MOBILITY', 'CARDIO'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => handleCatFilterChange(cat)}
              className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                catFilter === cat 
                  ? "bg-cyan-500 text-black font-black" 
                  : "bg-white/5 text-[var(--muted)] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ==========================================
          GRID WORKSPACE: LEFT SELECTOR — RIGHT SYSTEM DISPLAY
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Quick Exercise List Selector */}
        <div className="lg:col-span-4 space-y-3 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
          <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-1">
            Exercise Index ({filteredExercises.length})
          </div>
          <div className="space-y-2">
            {filteredExercises.map(ex => {
              const isSelected = activeEx.id === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    setActiveEx(ex);
                    setTime(0);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer group ${
                    isSelected 
                      ? "bg-gradient-to-r from-cyan-950/40 to-black border-cyan-500/50 shadow-lg shadow-cyan-500/5" 
                      : "bg-[var(--card)] border-[var(--border)] hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        ex.category === 'PUSH' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        ex.category === 'PULL' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        ex.category === 'LEGS' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        ex.category === 'CORE' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        ex.category === 'MOBILITY' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                        "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {ex.category}
                      </span>
                      <span className="text-[9px] font-bold text-[var(--muted)]">
                        {ex.lottieBreakdown.duration}s Loop
                      </span>
                    </div>
                    <div className={`text-xs font-black uppercase tracking-tight transition-colors ${
                      isSelected ? "text-cyan-400" : "text-white group-hover:text-cyan-400"
                    }`}>
                      {ex.name}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] font-medium mt-1 truncate max-w-[200px]">
                      {ex.targetMuscles.join(' • ')}
                    </div>
                  </div>
                  <ChevronRight size={16} className={`transition-transform duration-300 ${
                    isSelected ? "translate-x-1 text-cyan-400" : "text-[var(--muted)] group-hover:translate-x-1"
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Dynamic Live Sandbox Canvas & Interactive Specs Tabs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. VISUALIZER PANEL - BLACK GLOW VIEWPORT */}
          <div className="bg-black border border-[var(--border)] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
            
            {/* Ambient neon radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.03)_0%,_transparent_75%)] pointer-events-none" />
            
            {/* Corner CAD marks */}
            <div className="absolute top-4 left-4 text-[9px] font-mono text-[var(--muted)] tracking-wider">SEC_ALIGN_AUTO</div>
            <div className="absolute top-4 right-4 text-[9px] font-mono text-cyan-500 tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>SKELETAL TRACKER ENAB</span>
            </div>

            {/* Model Gender Switch / Model Controls */}
            <div className="w-full flex items-center justify-between mb-4 relative z-10 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-black tracking-widest text-[var(--muted)]">Gender Model</span>
                <div className="bg-[var(--card2)] p-1 rounded-xl border border-[var(--border)] flex gap-1">
                  <button
                    onClick={() => setTempGender('male')}
                    className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                      tempGender === 'male' 
                        ? "bg-cyan-500 text-black font-black" 
                        : "text-[var(--muted)] hover:text-white"
                    }`}
                  >
                    <User size={12} /> Male
                  </button>
                  <button
                    onClick={() => setTempGender('female')}
                    className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                      tempGender === 'female' 
                        ? "bg-cyan-500 text-black font-black" 
                        : "text-[var(--muted)] hover:text-white"
                    }`}
                  >
                    <UserCheck size={12} /> Female
                  </button>
                </div>
              </div>

              {/* Play / Pause / Force Loop Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 sm:p-2.5 rounded-xl bg-[var(--card2)] hover:bg-[#1a1a1a] text-white border border-[var(--border)] active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? "Pause Visualizer" : "Play Visualizer"}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={() => setTime(0)}
                  className="p-2 sm:p-2.5 rounded-xl bg-[var(--card2)] hover:bg-[#1a1a1a] text-[var(--muted)] hover:text-white border border-[var(--border)] active:scale-95 transition-all cursor-pointer"
                  title="Reset Timing"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Dynamic Vector Projection Viewport */}
            <div className="w-full max-w-sm h-64 bg-gradient-to-b from-black to-[#05090f] border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-inner">
              
              {/* Overlay Grid lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00ffff" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridPattern)" />
              </svg>
              
              {/* Interactive Render */}
              <svg viewBox="0 0 350 250" className="w-full h-full p-4 relative z-10">
                {renderSVGFigure()}
              </svg>

              {/* Angle Metadata Overlay */}
              <div className="absolute bottom-3 left-3 bg-black/60 border border-[var(--border)] text-[9px] font-mono text-[var(--muted)] px-2 py-1 rounded-md mb-0.5">
                ANGLE_Z: {(time * 180 / Math.PI).toFixed(0)}° • COMPRES_V: {interpolation.toFixed(2)}
              </div>
            </div>

            {/* Target Muscles Glowing Tags */}
            <div className="w-full mt-4 border-t border-white/5 pt-4 flex flex-wrap gap-2 items-center justify-center">
              <span className="text-[9px] uppercase font-black tracking-wider text-[var(--muted)]">Target Activations:</span>
              {activeEx.targetMuscles.map(mus => (
                <span key={mus} className="text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full select-none">
                  🔥 {mus}
                </span>
              ))}
            </div>
          </div>

          {/* 2. SPECIFICATION NAV CONTROLS */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-[var(--border)] overflow-x-auto no-scrollbar gap-1">
            <button
              onClick={() => setTabIndex('visual')}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer",
                tabIndex === 'visual' ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/10" : "text-[var(--muted)] hover:text-white"
              )}
            >
              <Eye size={12} /> Flow Guide
            </button>
            <button
              onClick={() => setTabIndex('prompts')}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer",
                tabIndex === 'prompts' ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/10" : "text-[var(--muted)] hover:text-white"
              )}
            >
              <Video size={12} /> AI Prompts
            </button>
            <button
              onClick={() => setTabIndex('lottie')}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer",
                tabIndex === 'lottie' ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/10" : "text-[var(--muted)] hover:text-white"
              )}
            >
              <Layers size={12} /> Lottie specs
            </button>
            <button
              onClick={() => setTabIndex('guides')}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer",
                tabIndex === 'guides' ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/10" : "text-[var(--muted)] hover:text-white"
              )}
            >
              <Camera size={12} /> Camera & Style
            </button>
          </div>

          {/* 3. DETAILS DISPLAY WINDOW */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={tabIndex + "_" + activeEx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* A. FLOW GUIDE */}
                {tabIndex === 'visual' && (
                  <div className="space-y-4">
                    <div className="border-l-4 border-cyan-500 pl-4 py-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">Movement Cycle Flow</h4>
                      <p className="text-[11px] text-[var(--muted)] font-medium">Standard orthopaedic motion sequencing template.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-1.5">1. Start Position</div>
                        <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold">{activeEx.description.start}</p>
                      </div>
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1.5">2. Eccentric Descent</div>
                        <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold">{activeEx.description.movement}</p>
                      </div>
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1.5">3. Concentric Joint End</div>
                        <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold">{activeEx.description.end}</p>
                      </div>
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-1.5">4. Repeat & Loop</div>
                        <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold">{activeEx.description.loop}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* B. AI IMAGE & VIDEO PROMPT SCRIPTS */}
                {tabIndex === 'prompts' && (
                  <div className="space-y-6">
                    <div className="border-l-4 border-cyan-500 pl-4 py-1 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight font-display">Video Generator Prompts</h4>
                        <p className="text-[11px] text-[var(--muted)] font-medium">Fully engineered scripts for Sora, Runway Gen-2, or Luma.</p>
                      </div>
                    </div>

                    {/* Male Prompt Panel */}
                    <div className="bg-black/50 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5">
                          <User size={12} /> Male Prompt
                        </span>
                        <button
                          onClick={() => copyToClipboard(activeEx.malePrompt, 'male')}
                          className="text-[10px] font-black uppercase tracking-wider text-cyan-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPrompt === 'male' ? (
                            <>
                              <Check size={12} className="text-emerald-400" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy Script
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold select-all font-mono">
                        {activeEx.malePrompt}
                      </p>
                    </div>

                    {/* Female Prompt Panel */}
                    <div className="bg-black/50 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-pink-500/15 text-pink-400 border border-pink-500/25 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5">
                          <UserCheck size={12} /> Female Prompt
                        </span>
                        <button
                          onClick={() => copyToClipboard(activeEx.femalePrompt, 'female')}
                          className="text-[10px] font-black uppercase tracking-wider text-pink-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPrompt === 'female' ? (
                            <>
                              <Check size={12} className="text-emerald-400" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy Script
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold select-all font-mono">
                        {activeEx.femalePrompt}
                      </p>
                    </div>
                  </div>
                )}

                {/* C. LOTTIE BREAKDOWN KEYFRAMES */}
                {tabIndex === 'lottie' && (
                  <div className="space-y-6">
                    <div className="border-l-4 border-cyan-500 pl-4 py-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">Lottie Body Segment Vectors</h4>
                      <p className="text-[11px] text-[var(--muted)] font-medium">Technical bone coordinates and linear interpolation rates.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Body Segment Actions */}
                      <div className="space-y-3">
                        <div className="text-[10px] font-black text-white uppercase tracking-widest border-b border-white/5 pb-1">
                          Bone Segment Anchors
                        </div>
                        <div className="space-y-2">
                          {activeEx.lottieBreakdown.bodySegments.map(seg => (
                            <div key={seg.segment} className="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="text-xs font-black text-cyan-400 uppercase tracking-tight">{seg.segment}</span>
                              <span className="text-[11px] text-[var(--muted)] font-semibold">{seg.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline Keyframes */}
                      <div className="space-y-3">
                        <div className="text-[10px] font-black text-white uppercase tracking-widest border-b border-white/5 pb-1 flex items-center justify-between">
                          <span>Timeline Keyframes</span>
                          <span className="text-[9px] text-[var(--muted)] font-mono">LoopDuration: {activeEx.lottieBreakdown.duration}s</span>
                        </div>
                        <div className="space-y-2">
                          {activeEx.lottieBreakdown.keyframes.map(kf => (
                            <div key={kf.frame} className="bg-black/30 p-3 rounded-xl border border-white/5">
                              <div className="text-[10px] font-black text-orange-400 uppercase tracking-wider mb-1 font-mono">{kf.frame}</div>
                              <p className="text-[11px] text-[var(--muted)] font-medium leading-normal">{kf.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* D. CAMERA STYLE NOTES */}
                {tabIndex === 'guides' && (
                  <div className="space-y-4">
                    <div className="border-l-4 border-cyan-500 pl-4 py-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">Camera Rig & Visual Matrix</h4>
                      <p className="text-[11px] text-[var(--muted)] font-medium">Stage alignment standards to keep rendering sets consistent.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-start gap-3.5">
                        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
                          <Camera size={16} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1 text-cyan-400">Angle Coordinates</div>
                          <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold">{activeEx.cameraStyle.angle}</p>
                        </div>
                      </div>

                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-start gap-3.5">
                        <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1 text-orange-400">Environment Lighting</div>
                          <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold">{activeEx.cameraStyle.lighting}</p>
                        </div>
                      </div>

                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-start gap-3.5">
                        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                          <Eye size={16} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1 text-purple-400">Scene Backgrounds</div>
                          <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold">{activeEx.cameraStyle.background}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
