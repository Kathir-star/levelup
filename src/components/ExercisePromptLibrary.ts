import { AnimationSpec } from './ExerciseAnimations';

export const ALL_50_EXERCISES: AnimationSpec[] = [
  // =========================================================================
  // PUSH EXERCISES (1-10)
  // =========================================================================
  {
    id: "push_ups",
    name: "Push-ups",
    category: "PUSH",
    targetMuscles: ["Chest", "Triceps", "Anterior Deltoids", "Core"],
    description: {
      start: "Prone position on the floor, hands paced slightly wider than shoulder-width, toes tucked, body forming a perfectly straight line.",
      movement: "Flex the elbows to lower the entire body as a rigid unit until the chest hovers 2 inches above the floor. Elbows at 45 degrees.",
      end: "Press firmly through palms, extending elbows to return back to starting high plank extension under strict control.",
      loop: "Oscillating 3.0-second loop: plank position (0s) -> chest-down deep hover (1.5s) -> high plank position (3.0s)."
    },
    malePrompt: "Athletic male performing Push-ups, correct form, side angle, dark background, neon highlights on Chest, Triceps, Anterior Deltoids, and Core, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Push-ups, correct form, side angle, dark background, neon highlights on Chest, Triceps, Anterior Deltoids, and Core, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "High plank starting alignment. Core braced, arms vertically extended, pelvis locked." },
        { frame: "Frame 45 (Mid)", description: "Low hover position. Chest 2 inches from floor, elbows flexed at a 90-degree angle." },
        { frame: "Frame 90 (End)", description: "Return back up to starting high plank, shoulder blades actively protracted." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Elbow flexion during lowering, then extension pressing back up into a full block." },
        { segment: "Torso", action: "Abdominals fully contracted, holding spine and pelvis in perfect straight vector alignment." },
        { segment: "Legs", action: "Static pivot point anchored flat at toes with calves and glutes fully tensioned." }
      ]
    },
    cameraStyle: {
      angle: "3/4 Profile Right Side view, low-angle perspective for vertical chest-to-pulley spacing.",
      lighting: "Rim lighting in high-contrast neon cyan, with a localized warm pulsing orange glow on pectoral fiber group.",
      background: "Minimalist dark slate grid with subtle isometric floor plane tracking details."
    }
  },
  {
    id: "incline_push_ups",
    name: "Incline Push-ups",
    category: "PUSH",
    targetMuscles: ["Lower Chest", "Triceps", "Anterior Deltoids"],
    description: {
      start: "Hands placed on an elevated bench or platform, body angled diagonally with straight arms and tight core.",
      movement: "Slowly lower chest towards the edge of the elevated platform by bending at the elbows, keeping body rigid.",
      end: "Forcefully push the platform away, extending your elbows to return to the tall diagonal incline stance.",
      loop: "Continuous 3.2-second progression: high diagonal stand (0s) -> chest contact with platform (1.6s) -> incline return (3.2s)."
    },
    malePrompt: "Athletic male performing Incline Push-ups, correct form, side angle, dark background, neon highlights on Lower Chest, Triceps, and Anterior Deltoids, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Incline Push-ups, correct form, side angle, dark background, neon highlights on Lower Chest, Triceps, and Anterior Deltoids, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.2,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Incline plank position, hands on elevation block, shoulders stacked above wrists." },
        { frame: "Frame 48 (Mid)", description: "Lower sternum contacts the elevated edge. Elbows tucked at 45 degrees." },
        { frame: "Frame 96 (End)", description: "Push-off completed, arms locked, shoulder blade anchor points reset." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Slow upper-arm flexion, leading to bench contact, followed by complete push recovery." },
        { segment: "Torso", action: "Erector spinae and rectus abdominis working isometrically to hold straight spine line." },
        { segment: "Feet", action: "Heels elevated, pivoting smoothly on the balls of both feet." }
      ]
    },
    cameraStyle: {
      angle: "Profile view showing the precise platform incline angle relative to the floor grid.",
      lighting: "Sleek top spotlighting contrasting the upper torso, with neon orange highlights on the lower pectorals.",
      background: "Achromatic deep navy matrix grid with technical alignment rings."
    }
  },
  {
    id: "knee_push_ups",
    name: "Knee Push-ups",
    category: "PUSH",
    targetMuscles: ["Chest", "Triceps", "Anterior Deltoids"],
    description: {
      start: "Plank position supporting weight on hands and knees, hips shifted forward so thighs and trunk form a straight diagonal.",
      movement: "Lower chest towards the floor by flexing elbows, maintaining the straight diagonal line from knees to head.",
      end: "Press through palms to return upright, locking out upper arms without letting the lower back sag.",
      loop: "Oscillating 2.8-second loop: knees-up plank (0s) -> chest-down hover on knees (1.4s) -> return (2.8s)."
    },
    malePrompt: "Athletic male performing Knee Push-ups, correct form, side angle, dark background, neon highlights on Chest, Triceps, and Anterior Deltoids, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Knee Push-ups, correct form, side angle, dark background, neon highlights on Chest, Triceps, and Anterior Deltoids, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 2.8,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Strate posture from knees to head. Hands flat, shoulders aligned directly vertically." },
        { frame: "Frame 42 (Mid)", description: "Knees-assisted lowest point of push. Chest 2 inches from ground plane axis." },
        { frame: "Frame 84 (End)", description: "Complete extension of arm bones back to straight starting alignment." }
      ],
      bodySegments: [
        { segment: "Knees", action: "Acts as primary static pivot point, resting on the floor frame cushion." },
        { segment: "Arms", action: "Elbow joints transition from 180 degrees down to 90 degrees and back." },
        { segment: "Pelvis", action: "Kept locked in rigid neutral position during full transit." }
      ]
    },
    cameraStyle: {
      angle: "Side profile orthographic perspective to capture knee-to-shoulder tracking symmetry.",
      lighting: "Soft ambient shadow box, glowing laser tracers outlining correct elbow/shoulder alignment.",
      background: "Matt steel dark panels with tech laser alignment dots."
    }
  },
  {
    id: "bench_press",
    name: "Bench Press",
    category: "PUSH",
    targetMuscles: ["Chest", "Anterior Deltoids", "Triceps"],
    description: {
      start: "Lying flat on bench, bar gripped slightly wider than shoulders, eyes under rack position, feet flat.",
      movement: "Unrack and descend barbell slowly in a soft arc towards the lower chest, keeping wrists and elbows stacked.",
      end: "Press bar straight up in a gentle backward curve, pushing upper torso back into the bench pad.",
      loop: "Continuous 3.5-second cycle: bar at full lock height (0s) -> touches chest (1.75s) -> full locked extension (3.5s)."
    },
    malePrompt: "Athletic male performing Bench Press, correct form, side angle, dark background, neon highlights on Chest, Anterior Deltoids, and Triceps, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Bench Press, correct form, side angle, dark background, neon highlights on Chest, Anterior Deltoids, and Triceps, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.5,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Barbell resting in fully extended arm lock at upper limit." },
        { frame: "Frame 52 (Mid)", description: "Bar touches lower edge of chest. Elbows tucked comfortably at 45 degrees." },
        { frame: "Frame 105 (End)", description: "Bar returns to height limit directly vertical of the shoulder joint pivot." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Shifting elbow vertically inside a 90 to 45 degree angle." },
        { segment: "Torso", action: "Isometric chest retraction, shoulder blades firmly pinned and locked down against the pad." },
        { segment: "Barbell", action: "Perfect vertical-to-curved displacement path tracing." }
      ]
    },
    cameraStyle: {
      angle: "Transverse side profile view, horizontal bench level alignment.",
      lighting: "High dynamic range backlighting, glowing focus spots pointing on chest mechanics.",
      background: "Achromatic black background with fine wireframe engineering layout guides."
    }
  },
  {
    id: "dumbbell_chest_press",
    name: "Dumbbell Chest Press",
    category: "PUSH",
    targetMuscles: ["Pectorals", "Triceps", "Anterior Deltoids"],
    description: {
      start: "Lying flat on bench, holding dumbbells at chest Level, elbows positioned at 45 degrees to the torso.",
      movement: "Press weights vertically in a slow converging arc over the center of chest, keeping wrists firm.",
      end: "Lower weights under deep eccentric control to sides of chest, feeling a deep thoracic stretch, elbows locked.",
      loop: "Steady 3.3-second cycle: weights at stretch position (0s) -> converging peak press (1.65s) -> lower (3.3s)."
    },
    malePrompt: "Athletic male performing Dumbbell Chest Press, correct form, side angle, dark background, neon highlights on Pectorals, Triceps, and Anterior Deltoids, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Dumbbell Chest Press, correct form, side angle, dark background, neon highlights on Pectorals, Triceps, and Anterior Deltoids, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Dumbbells racked at chest level, shoulder blades retracted against the pad." },
        { frame: "Frame 50 (Mid)", description: "Dumbbells pressed overhead, hands converging above sternum center." },
        { frame: "Frame 100 (End)", description: "Controlled eccentric return to the wide chest level starting position." }
      ],
      bodySegments: [
        { segment: "Shoulders", action: "Shoulder blades pinned flat on bench; arm joints glide up/down." },
        { segment: "Arms", action: "Elbow joints extend symmetrically, pointing towards ceiling." },
        { segment: "Core", action: "Isometric bracing keeping feet flat and spine flat on the bench." }
      ]
    },
    cameraStyle: {
      angle: "Oblique 3/4 overhead perspective to show dumbbell convergence path.",
      lighting: "Subtle blue-cyan side lasers tracing the symmetric curved arm vectors.",
      background: "Sleek carbon-fiber textured background grid."
    }
  },
  {
    id: "shoulder_press",
    name: "Shoulder Press",
    category: "PUSH",
    targetMuscles: ["Deltoids", "Triceps", "Upper Chest"],
    description: {
      start: "Seated upright with back supported, dumbbells held at ear height, elbows angled forward slightly around 30 degrees.",
      movement: "Extend arms vertically to press dumbbells directly overhead in a smooth converging arc.",
      end: "Slowly lower the dumbbells back under strict eccentric control to ear level height, reloading the deltoids.",
      loop: "Fluid 3.2-second progression: dumbbells at shoulders (0s) -> pressed overhead peak (1.6s) -> lowered (3.2s)."
    },
    malePrompt: "Athletic male performing Shoulder Press, correct form, side angle, dark background, neon highlights on Deltoids, Triceps, and Upper Chest, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Shoulder Press, correct form, side angle, dark background, neon highlights on Deltoids, Triceps, and Upper Chest, smooth looping animation, clean minimal fitness app style",
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
      angle: "Front-angled 3/4 perspective to see symmetrical arm heights.",
      lighting: "Top spotlighting focusing on shoulder cap fiber density.",
      background: "Matt metallic dark panels with carbon fiber textures."
    }
  },
  {
    id: "arnold_press",
    name: "Arnold Press",
    category: "PUSH",
    targetMuscles: ["Anterior Deltoids", "Lateral Deltoids", "Triceps"],
    description: {
      start: "Seated upright holding dumbbells in front of shoulders with palms facing you (supinated), chest proud.",
      movement: "As you press dumbbells overhead, rotate your wrists outward so palms face forward (pronated) at peak.",
      end: "Reverse the rotation while lowering weights back down under weight control to return palms to facing you.",
      loop: "Continuous 3.6-second twist-and-press cycle: dumbbells at chin (0s) -> overhead peak pronated (1.8s) -> starting twist (3.6s)."
    },
    malePrompt: "Athletic male performing Arnold Press, correct form, side angle, dark background, neon highlights on Anterior Deltoids, Lateral Deltoids, and Triceps, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Arnold Press, correct form, side angle, dark background, neon highlights on Anterior Deltoids, Lateral Deltoids, and Triceps, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.6,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Dumbbells racked high in front of chin. Palms face completely inward." },
        { frame: "Frame 54 (Mid)", description: "Overhead push limit reached. Dumbbells overhead, palms face completely outward." },
        { frame: "Frame 108 (End)", description: "Dumbbells rotated and lowered back to front rack chest orientation." }
      ],
      bodySegments: [
        { segment: "Shoulders", action: "Pronation and external rotation of shoulder socket joints during vertical drive." },
        { segment: "Arms", action: "Elbow execution moving in a spiral rotary path tracing." },
        { segment: "Torso", action: "Rigid posture maintained against backpad to isolate target muscles." }
      ]
    },
    cameraStyle: {
      angle: "Front-right 3/4 profile to witness the rotational transition of dumbbells.",
      lighting: "Dynamic dual-directional side light showcasing both frontal and lateral shoulder fibers.",
      background: "Techno dark sci-fi background with technical lines."
    }
  },
  {
    id: "tricep_dips",
    name: "Tricep Dips",
    category: "PUSH",
    targetMuscles: ["Triceps", "Lower Chest", "Anterior Deltoids"],
    description: {
      start: "Supporting body weight between parallel dip bars, arms fully extended, shoulders pulled down, legs slightly bent.",
      movement: "Inhale, flex elbows to descend torso until upper arms are parallel to floor. Torso slightly forward.",
      end: "Exhale, drive through your hands to extend the elbows, lifting the torso back to initial vertical lock.",
      loop: "Smooth 3.0-second vertical cycle: arms locked tall (0s) -> deep parallel sink (1.5s) -> up lockout (3.0s)."
    },
    malePrompt: "Athletic male performing Tricep Dips, correct form, side angle, dark background, neon highlights on Triceps, Lower Chest, and Anterior Deltoids, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Tricep Dips, correct form, side angle, dark background, neon highlights on Triceps, Lower Chest, and Anterior Deltoids, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Top vertical lock on parallel bars, shoulders packed, elbows extended." },
        { frame: "Frame 45 (Mid)", description: "Lowest point: Elbow shoulder socket flexed past 90 degrees, chest inclined." },
        { frame: "Frame 90 (End)", description: "Return back upright, locking tricep structures solid." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Elbow flexion lowering trunk, followed by violent extension press-up." },
        { segment: "Shoulders", action: "Kept retracted and depressed, avoiding the 'shrug' load collapse." },
        { segment: "Trunks", action: "Slight forward diagonal trunk pivot to transition focal load distribution." }
      ]
    },
    cameraStyle: {
      angle: "Sidelong elevation view capturing elbow flexion depth and parallel bar levels.",
      lighting: "Gleaming lime edge-lights detailing triceps contracture peaks.",
      background: "Minimal wireframe bar tracks in empty slate void."
    }
  },
  {
    id: "diamond_push_ups",
    name: "Diamond Push-ups",
    category: "PUSH",
    targetMuscles: ["Triceps", "Inner Chest", "Core"],
    description: {
      start: "Prone plank position, hands index fingers and thumbs touching to create a diamond shape under center chest.",
      movement: "Lower chest directly down to touch the back of hands by bending elbows, keeping elbows tucked close to ribcage.",
      end: "Forcefully push the floor away, fully locking the arms out while bracing the entire oblique wall.",
      loop: "Oscillating 2.9-second cycle: top diamond plank (0s) -> chest touches diamond hands (1.45s) -> high lockout (2.9s)."
    },
    malePrompt: "Athletic male performing Diamond Push-ups, correct form, side angle, dark background, neon highlights on Triceps, Inner Chest, and Core, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Diamond Push-ups, correct form, side angle, dark background, neon highlights on Triceps, Inner Chest, and Core, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 2.9,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Diamond hands setup. Arms straight, weight loaded on fingers, core tight." },
        { frame: "Frame 43 (Mid)", description: "Deep descent. Sternum contacts the custom hand diamond triangle shape." },
        { frame: "Frame 86 (End)", description: "Extension up-thrust completed. Triceps squeezed excessively hard at top limit." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Elbows tucking narrow along the rib wall, maximizing triceps extension load." },
        { segment: "Trunk", action: "Rigid straight spinal column, zero hip sagging or neck tucking." },
        { segment: "Feet", action: "Slightly wider base of support on toes for structural roll stabilization." }
      ]
    },
    cameraStyle: {
      angle: "Overhead 3/4 right side view to display the diamond hand orientation and elbow path.",
      lighting: "Warm focus neon orange highlighting the inner chest and medial triceps block.",
      background: "Futuristic charcoal blueprint floor panels."
    }
  },
  {
    id: "cable_chest_fly",
    name: "Cable Chest Fly",
    category: "PUSH",
    targetMuscles: ["Pectoral Fibers", "Anterior Deltoids"],
    description: {
      start: "Standing in center of cables, one foot ahead for balance, arms wide, elbows slightly bent, palms facing forward.",
      movement: "Squeeze pectorals to draw hands together in a wide hugging arc, meeting in front of center chest.",
      end: "Slowly release and flare arms back open under resistance, returning back to deep wide stretch position.",
      loop: "Graceful 3.4-second horizontal sweep: hands wide open (0s) -> meeting in center hugs (1.7s) -> slow release (3.4s)."
    },
    malePrompt: "Athletic male performing Cable Chest Fly, correct form, side angle, dark background, neon highlights on Pectoral Fibers and Anterior Deltoids, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Cable Chest Fly, correct form, side angle, dark background, neon highlights on Pectoral Fibers and Anterior Deltoids, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.4,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Cables wide. Chest open to extreme stretch, elbows slightly unlocked." },
        { frame: "Frame 51 (Mid)", description: "Hands meet in front of sternum, knuckles close, chest fully flexed." },
        { frame: "Frame 102 (End)", description: "Resisting the cable return weight, spreading arms back out wide safely." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Hugging arced pathway keeping elbow bend locked at fixed angle." },
        { segment: "Chest", action: "Active adduction pulling arms together into maximum center squeeze." },
        { segment: "Stance", action: "Staggered feet base providing a static anti-pull counter-balance." }
      ]
    },
    cameraStyle: {
      angle: "Low-angle front-oblique view showing pectoral contraction squeeze lines.",
      lighting: "High-contrast glowing wire traces along cable pulls with dual side spotlights.",
      background: "Sleek ink-black with horizontal cyan velocity tracks."
    }
  },

  // =========================================================================
  // PULL EXERCISES (11-20)
  // =========================================================================
  {
    id: "pull_ups",
    name: "Pull-ups",
    category: "PULL",
    targetMuscles: ["Lats", "Rhomboids", "Biceps", "Core"],
    description: {
      start: "Hanging from overhead bar, hands wider than shoulders, palms away. Body perfectly straight, abs engaged.",
      movement: "Retract and depress shoulder blades, then pull elbows actively down towards hip pockets to lift chest.",
      end: "Chest pulls to touch the bar, chin clearing height line, then descend under strict slow control.",
      loop: "Graceful 4.0-second overhead loop: hanging deadhang (0s) -> chin over bar pull (2.0s) -> hang descent (4.0s)."
    },
    malePrompt: "Athletic male performing Pull-ups, correct form, side angle, dark background, neon highlights on Lats, Rhomboids, Biceps, and Core, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Pull-ups, correct form, side angle, dark background, neon highlights on Lats, Rhomboids, Biceps, and Core, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 4,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Hanging deadhang, scapula elevated, legs held straight with minor hollow body." },
        { frame: "Frame 60 (Mid)", description: "Scapula retracted, elbows tucked down, chin raised past bar coordinate." },
        { frame: "Frame 120 (End)", description: "Controlled eccentric return back down to active deadhang base." }
      ],
      bodySegments: [
        { segment: "Scapula", action: "Active depression-retraction phase preceding elbow fold." },
        { segment: "Arms", action: "Elbows flexion pulling down to torso, hands static on overhead pipe." },
        { segment: "Core", action: "Hollow body static lock, denying lower back swinging drift." }
      ]
    },
    cameraStyle: {
      angle: "Back-angled view at 45 degrees, looking slightly up to emphasize lat contraction width.",
      lighting: "Dramatic side lighting framing back contour, neon glow on posterior back wing muscles.",
      background: "Deep ink-black with horizontal cyan velocity markers."
    }
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    category: "PULL",
    targetMuscles: ["Lats", "Rhomboids", "Middle Trapezius", "Forearms"],
    description: {
      start: "Seated, thighs locked under pad, arms elevated holding wide pulldown bar, torso tilted back tiny 10-degrees.",
      movement: "Pull bar down to upper collarbones, pulling from the elbows and contracting back wings, blades depressed.",
      end: "Slowly slide the bar back to top stretch limit under strict muscle load control, resisting pull.",
      loop: "Continuous 3.5-second cable motion: bar at maximum elevation (0s) -> pulled down under chin (1.75s) -> slow return (3.5s)."
    },
    malePrompt: "Athletic male performing Lat Pulldown, correct form, side angle, dark background, neon highlights on Lats, Rhomboids, Middle Trapezius, and Forearms, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Lat Pulldown, correct form, side angle, dark background, neon highlights on Lats, Rhomboids, Middle Trapezius, and Forearms, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.5,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Bar barbell raised, arm line near parallel extension, lats under stretch." },
        { frame: "Frame 52 (Mid)", description: "Bar pulled flush to upper rib junction. Elbows tracking back-downwards." },
        { frame: "Frame 105 (End)", description: "Resisting pull, arms glide back vertically to maximum upward stretch." }
      ],
      bodySegments: [
        { segment: "Shoulders", action: "Scapular depression-retraction dragging cable weight down." },
        { segment: "Arms", action: "Hands hooked on bar, elbows pulling through vertical pulley path." },
        { segment: "Back", action: "Deep contraction contraction of latissimus dorsi, glowing neon orange." }
      ]
    },
    cameraStyle: {
      angle: "Side profile orthographic projection view.",
      lighting: "Soft ambient shadow box, glowing laser tracers detailing cable pull paths.",
      background: "Monochrome technical mesh blueprint pattern."
    }
  },
  {
    id: "seated_row",
    name: "Seated Row",
    category: "PULL",
    targetMuscles: ["Rhomboids", "Middle Trapezius", "Lats", "Rear Delts"],
    description: {
      start: "Seated upright against pad, feet on feetplates, knees slightly soft, arms extended straight ahead holding handle.",
      movement: "Squeeze shoulder blades together, pull handle towards lower ribs, dragging elbows far back past hips.",
      end: "Hold back contraction for 1 second, then extend arms slowly while preventing rounded back posture.",
      loop: "Symmetrical 3.4-second horizontal rowing loop: full extension (0s) -> handles to gut tuck (1.7s) -> release (3.4s)."
    },
    malePrompt: "Athletic male performing Seated Row, correct form, side angle, dark background, neon highlights on Rhomboids, Middle Trapezius, Lats, and Rear Delts, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Seated Row, correct form, side angle, dark background, neon highlights on Rhomboids, Middle Trapezius, Lats, and Rear Delts, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.4,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Cable handle far forward close to pulley, arms fully relaxed extended." },
        { frame: "Frame 51 (Mid)", description: "Handle drawn close to torso belly, back straight, elbows pulled behind." },
        { frame: "Frame 102 (End)", description: "Arms slide back forward under continuous pull resistance, spine solid." }
      ],
      bodySegments: [
        { segment: "Shoulder Blades", action: "Complete horizontal traction retraction-protraction loop." },
        { segment: "Spine", action: "Kept in neutral column, zero front-to-back pelvis swaying." },
        { segment: "Feet", action: "Anchored on heavy metal frame plates." }
      ]
    },
    cameraStyle: {
      angle: "Direct orthogonal profile view, focusing on shoulder/spinal angles.",
      lighting: "Hard key-light showing back muscle split line and traps.",
      background: "Futuristic dark cyber facility background."
    }
  },
  {
    id: "dumbbell_row",
    name: "Dumbbell Row",
    category: "PULL",
    targetMuscles: ["Lats", "Lower Trapezius", "Biceps", "Rear Delts"],
    description: {
      start: "Supporting one knee and same-side hand on flat bench, back parallel to floor, opposite arm hanging loose with DB.",
      movement: "Pull the dumbbell towards hip, keeping elbow tucked close to body, driving from elbow to contract lats.",
      end: "Slowly lower dumbbell back down under control, extending forearm fully without twisting spine.",
      loop: "Continuous 3.2-second rhythm: weight at hand hang (0s) -> row to hip tuck (1.6s) -> release hang (3.2s)."
    },
    malePrompt: "Athletic male performing Dumbbell Row, correct form, side angle, dark background, neon highlights on Lats, Lower Trapezius, Biceps, and Rear Delts, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Dumbbell Row, correct form, side angle, dark background, neon highlights on Lats, Lower Trapezius, Biceps, and Rear Delts, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.2,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Flat spine line parallel to bench, dumbbell hanging in full arm extension." },
        { frame: "Frame 48 (Mid)", description: "Dumbbell rowed up next to hips, elbow driven past rib height, lats clamped." },
        { frame: "Frame 96 (End)", description: "Dumbbell lower back down under active gravity counter-strength." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Unilateral elbow retraction lifting weight in piston-like pattern." },
        { segment: "Spine", action: "Strict horizontal spine line, zero rotation of hips or shoulder belt." },
        { segment: "Scapula", action: "Active retraction at top peak, pulling toward midline." }
      ]
    },
    cameraStyle: {
      angle: "Full level side profile view to verify flat back posture.",
      lighting: "Sharp edge light outlining the arm and side-lat contours.",
      background: "Gym layout lines on muted black grid ground."
    }
  },
  {
    id: "resistance_band_row",
    name: "Resistance Band Row",
    category: "PULL",
    targetMuscles: ["Middle Trapezius", "Rhomboids", "Latissimus Dorsi"],
    description: {
      start: "Standing anchored on band with feet, hinged forward at hips with flat back, holding handles with straight arms.",
      movement: "Pull handles up toward ribs, stretching the band and pulling shoulder blades together forcefully.",
      end: "Controlled descent, resisting band snap-back to stretch targets back to long starting overhang.",
      loop: "Smooth 3.0-second band pulling loop: slack extension (0s) -> maximum stretch peak (1.5s) -> return (3.0s)."
    },
    malePrompt: "Athletic male performing Resistance Band Row, correct form, side angle, dark background, neon highlights on Middle Trapezius, Rhomboids, and Latissimus Dorsi, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Resistance Band Row, correct form, side angle, dark background, neon highlights on Middle Trapezius, Rhomboids, and Latissimus Dorsi, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Hinged forward stance, hands holding elastic band with low pre-tension." },
        { frame: "Frame 45 (Mid)", description: "Band fully stretched to flank. Elbows elevated, rhomboids squeezed tight." },
        { frame: "Frame 90 (End)", description: "Relaxing band force to return arm lines back down." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Rowing motion against linear progressive tension curve." },
        { segment: "Spine", action: "Isometric back alignment holding 45-degree forward incline angle." },
        { segment: "Feet", action: "Locked static on floor loop of the latex band." }
      ]
    },
    cameraStyle: {
      angle: "3/4 profile showing forward trunk incline and band tension vector.",
      lighting: "Soft yellow highlight tracing the band pathway, orange neon glow on middle traps.",
      background: "Futuristic wireframe testing chamber."
    }
  },
  {
    id: "face_pull",
    name: "Face Pull",
    category: "PULL",
    targetMuscles: ["Rear Deltoids", "Rotator Cuff", "Upper Trapezius"],
    description: {
      start: "Standing, holding high cable rope attachment with palms forward, arms extended straight out in front.",
      movement: "Pull rope directly to forehead and temples, flaring elbows wide and rotating shoulders outward (knuckles back).",
      end: "Return rope to extended position under slow eccentric control, allowing shoulder blades to slide forward.",
      loop: "Continuous 3.3-second cycle: arms extended forward (0s) -> split rope pull at face (1.65s) -> return (3.3s)."
    },
    malePrompt: "Athletic male performing Face Pull, correct form, side angle, dark background, neon highlights on Rear Deltoids, Rotator Cuff, and Upper Trapezius, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Face Pull, correct form, side angle, dark background, neon highlights on Rear Deltoids, Rotator Cuff, and Upper Trapezius, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Rope held straight out, shoulders slightly rounded forward." },
        { frame: "Frame 50 (Mid)", description: "Rope pulled to eyes. Elbows held high and wide, wrists rotated back." },
        { frame: "Frame 100 (End)", description: "Smooth eccentric extension回到 starting reach height." }
      ],
      bodySegments: [
        { segment: "Shoulders", action: "Horizontal abduction coupled with extreme shoulder external rotation." },
        { segment: "Arms", action: "Elbows flare out around 90 degrees wide, pulling splits." },
        { segment: "Torso", action: "Statuesque erect stance, abdominals blocked from hyper-extending back." }
      ]
    },
    cameraStyle: {
      angle: "Side profile head-level view to track shoulder rotation angle.",
      lighting: "Intense back spot lighting to separate rear shoulder caps, neon green tracking lasers.",
      background: "Slate cyber lab background."
    }
  },
  {
    id: "reverse_fly",
    name: "Reverse Fly",
    category: "PULL",
    targetMuscles: ["Rear Deltoids", "Rhomboids", "Middle Trapezius"],
    description: {
      start: "Hinged at hips holding light dumbbells hanging under shoulders, palms facing each other, elbows slightly soft.",
      movement: "Squeeze upper back to raise dumbbells out wide to the sides, leading with elbows, locking joint bend.",
      end: "Slowly bring dumbbells back together under center line, preventing weights from banging or momentum swing.",
      loop: "Continuous 3.1-second flying arc: weights hanging (0s) -> horizontal flared wide peak (1.55s) -> lower (3.1s)."
    },
    malePrompt: "Athletic male performing Reverse Fly, correct form, side angle, dark background, neon highlights on Rear Deltoids, Rhomboids, and Middle Trapezius, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Reverse Fly, correct form, side angle, dark background, neon highlights on Rear Deltoids, Rhomboids, and Middle Trapezius, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.1,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Bent over stance. Hands hanging dead central directly down, knuckles facing out." },
        { frame: "Frame 46 (Mid)", description: "Horizontal arms extension, squeezing rear shoulder muscles and rhomboid structures. Elbow bend static." },
        { frame: "Frame 92 (End)", description: "Slow descent, weights meeting back under eyes." }
      ],
      bodySegments: [
        { segment: "Shoulders", action: "Squeeze rear shoulder caps and shoulder blades horizontally outward." },
        { segment: "Arms", action: "Slight locked elbow bend maintaining structural integrity." },
        { segment: "Trunk", action: "Static hinge holding flat diagonal spinal arch." }
      ]
    },
    cameraStyle: {
      angle: "Front-angled 3/4 side camera showcasing back scapular flexion.",
      lighting: "High dynamic pink-blue backlight rendering deltoid separation.",
      background: "Orthogonal vector grids with neon tracking."
    }
  },
  {
    id: "dead_hang",
    name: "Dead Hang",
    category: "PULL",
    targetMuscles: ["Grip Strength", "Forearm Flexors", "Latissimus Dorsi"],
    description: {
      start: "Hanging from standard high grab bar, hands at shoulder width, palms facing away. Body straight, legs hanging free.",
      movement: "Maintain passive hanging position, core braced with passive shoulder elevation to stretch lats, focus on forearm clamp.",
      end: "Hold index point with absolute motionless control. Keep ankles crossed and control dynamic joint micro-sway.",
      loop: "Isometric static loop: microscopic breath expansion (0s -> 3.0s) with blazing orange forearm highlights."
    },
    malePrompt: "Athletic male performing Dead Hang, correct form, side angle, dark background, neon highlights on Grip Strength, Forearm Flexors, and Latissimus Dorsi, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Dead Hang, correct form, side angle, dark background, neon highlights on Grip Strength, Forearm Flexors, and Latissimus Dorsi, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Perfect hanging extension. Scapula elevated, hands wrapped on pipe." },
        { frame: "Frame 45 (Mid)", description: "Subtle thoracic breath chest movement. Wrist joints locked solid under load." },
        { frame: "Frame 90 (End)", description: "Static hold continued. Loop connects seamlessly." }
      ],
      bodySegments: [
        { segment: "Hands/Wrists", action: "Max isometric forearm and grip activation around overhead hanger." },
        { segment: "Shoulders", action: "Extended and raised passivly, offering deep latissimus fascia stretch." },
        { segment: "Lower Body", action: "Ankles crossed, legs long and extended vertically down." }
      ]
    },
    cameraStyle: {
      angle: "Strict sagittal side view tracking full hanging elongation.",
      lighting: "Top spotlighting along bar grip, orange hotspots on forearms and long back borders.",
      background: "Minimal wireframe line background."
    }
  },
  {
    id: "hammer_curl",
    name: "Hammer Curl",
    category: "PULL",
    targetMuscles: ["Brachioradialis", "Biceps Brachii", "Brachialis"],
    description: {
      start: "Standing upright holding dumbbells at sides, palms facing each other (neutral grip), shoulders packed down.",
      movement: "Flex elbows to lift dumbbells upwards, keeping palms parallel, elbows pinned rigidly to the side ribs.",
      end: "Lower weights back down carefully through the eccentric line, stopping just short of hyperextending elbows.",
      loop: "Symmetrical 2.8-second curling loop: weights hanging (0s) -> peak horizontal flex (1.4s) -> lower flat (2.8s)."
    },
    malePrompt: "Athletic male performing Hammer Curl, correct form, side angle, dark background, neon highlights on Brachioradialis, Biceps Brachii, and Brachialis, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Hammer Curl, correct form, side angle, dark background, neon highlights on Brachioradialis, Biceps Brachii, and Brachialis, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 2.8,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Weights resting at thighs, palms facing inwards, elbow joint open around 170 deg." },
        { frame: "Frame 42 (Mid)", description: "Dumbbells curled up to shoulder fronts, elbows still pinned to ribs." },
        { frame: "Frame 84 (End)", description: "Lowering completed, return back to absolute vertical standing rest." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Elbow flexion and extension under constant velocity. Palms face static-neutral." },
        { segment: "Shoulder Caps", action: "Kept fixed down, preventing elbow forward drift shoulder cheat." },
        { segment: "Trunk", action: "Upright standing, core braced preventing pelvic rock." }
      ]
    },
    cameraStyle: {
      angle: "Pure side view with elbow tracking grid displaying the lack of upper arm displacement.",
      lighting: "Glistening neon lines showcasing outer arm (brachioradialis) density.",
      background: "Clean dark cyber space with subtle coordinate circles."
    }
  },
  {
    id: "barbell_curl",
    name: "Barbell Curl",
    category: "PULL",
    targetMuscles: ["Biceps Brachii", "Brachialis", "Forearm Flexors"],
    description: {
      start: "Standing posture, holding straight barbell in front with underhand (supinated) grip, shoulder-width apart.",
      movement: "Exhale, contract biceps to lift bar under a wide arc toward upper chest, keeping elbows locked back.",
      end: "Inhale, slowly lower the barbell down under eccentric load control back to upper thighs, do not shrug.",
      loop: "Rhythmic 3.1-second cycle: barbell at thighs (0s) -> bar curled to chest (1.55s) -> lower down (3.1s)."
    },
    malePrompt: "Athletic male performing Barbell Curl, correct form, side angle, dark background, neon highlights on Biceps Brachii, Brachialis, and Forearm Flexors, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Barbell Curl, correct form, side angle, dark background, neon highlights on Biceps Brachii, Brachialis, and Forearm Flexors, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.1,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Holding barbell over thigh base, under-grip active, arms straight." },
        { frame: "Frame 46 (Mid)", description: "Biceps maximally contracted, barbell raised near mouth level, elbows tucked." },
        { frame: "Frame 92 (End)", description: "Slide barbell back down to resting vertical extension." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Biceps contraction driving elbow flexion inside a 160-to-30 degree range." },
        { segment: "Torso", action: "Erect posture, shoulders pinned back, zero backward lean." },
        { segment: "Barblock", action: "Tracks along circular path curve in front of trunk center." }
      ]
    },
    cameraStyle: {
      angle: "Side profile orthographic model perspective tracking biceps peak bulge.",
      lighting: "Highly dynamic dual-spot lighting focusing on inner and outer bicep fiber blocks.",
      background: "Blueprint dark facility style with digital motion arcs."
    }
  },

  // =========================================================================
  // LEGS EXERCISES (21-30)
  // =========================================================================
  {
    id: "squats",
    name: "Squats",
    category: "LEGS",
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Hamstrings", "Calves"],
    description: {
      start: "Standing upright, feet positioned shoulder-width apart, spine tall and weight evenly loaded across feet.",
      movement: "Hinge at hips, bend knees, and lower weight down as if sitting in a low chair. Keep knees stacked over toes.",
      end: "Lower until thighs sink parallel or deeper. Push through the heels to stand back upright, squeezing glutes.",
      loop: "Fluid 3.0-second vertical cycle: standing tall (0s) -> deep bottom parallel squat (1.5s) -> tall lockout (3.0s)."
    },
    malePrompt: "Athletic male performing Squats, correct form, side angle, dark background, neon highlights on Quadriceps, Gluteus Maximus, Hamstrings, and Calves, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Squats, correct form, side angle, dark background, neon highlights on Quadriceps, Gluteus Maximus, Hamstrings, and Calves, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Standing upright, knees extended, posture vertically aligned." },
        { frame: "Frame 45 (Mid)", description: "Hips sunk to lowest depth parallel, knee joint flexed past 90 degrees." },
        { frame: "Frame 90 (End)", description: "Stand back upright, glutes squeezed tightly." }
      ],
      bodySegments: [
        { segment: "Hips", action: "Posterior hinge lowering vertically and horizontally back, returning upright." },
        { segment: "Knees", action: "Bends outward tracking directly above toes, avoiding inward collapse." },
        { segment: "Ankles", action: "Dorsiflexion supporting heel-loaded balance vector." }
      ]
    },
    cameraStyle: {
      angle: "3/4 side-front profile view, revealing ankle dorsiflexion and spine angle symmetry.",
      lighting: "Omni ambient under-lighting framing thighs, glowing red-orange on glutes and quadriceps.",
      background: "Minimal digital grid space with high-contrast accent lines."
    }
  },
  {
    id: "jump_squats",
    name: "Jump Squats",
    category: "LEGS",
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Calves", "Hip Stabilizers"],
    description: {
      start: "Standing tall, descent into standard half squat, arms swinging backward preparing for leap power.",
      movement: "Explode skyward forcefully extending hips, knees, and ankles (triple extension), swinging arms up high.",
      end: "Land softly on balls of feet, transitioning smoothly directly back into the deep half squat stance.",
      loop: "Rapid 2.6-second explosive jump cycle: half-squat dip (0s) -> mid-air leap extension (1.3s) -> landing dip (2.6s)."
    },
    malePrompt: "Athletic male performing Jump Squats, correct form, side angle, dark background, neon highlights on Quadriceps, Gluteus Maximus, Calves, and Hip Stabilizers, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Jump Squats, correct form, side angle, dark background, neon highlights on Quadriceps, Gluteus Maximus, Calves, and Hip Stabilizers, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 2.6,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Half-squat compression load. Heels active, arms cocked behind pelvis." },
        { frame: "Frame 39 (Mid)", description: "Mid-air apex position. Toes pointed down, body long and vertically extended." },
        { frame: "Frame 78 (End)", description: "Soft landing deceleration, absorbing impact through knee/hip dampening." }
      ],
      bodySegments: [
        { segment: "Legs", action: "Plio-compression load followed by dynamic ankle push-off and landing absorption." },
        { segment: "Shoulders", action: "Dynamic vertical arc swing coordination aiding elevation height." },
        { segment: "Trunks", action: "Kept forward inclined slightly to align central gravity vectors." }
      ]
    },
    cameraStyle: {
      angle: "Wide side views capturing both take-off ground clearing and vertical jump height markers.",
      lighting: "Streaks of blue-yellow velocity paths tracing the path of the center of gravity.",
      background: "Futuristic dark digital grid space."
    }
  },
  {
    id: "lunges",
    name: "Lunges",
    category: "LEGS",
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Hamstrings", "Adductors"],
    description: {
      start: "Standing upright, feet hip-width together, shoulders stacked above hips, gaze forward.",
      movement: "Step one leg forward, dropping pelvis vertically until both knees bend at a perfect 90-degree angle.",
      end: "Push off the front heel to return back to initial standing stance, keeping posture vertical.",
      loop: "Continuous 3.2-second movement: standing (0s) -> deep forward step lower (1.6s) -> stand recovery (3.2s)."
    },
    malePrompt: "Athletic male performing Lunges, correct form, side angle, dark background, neon highlights on Quadriceps, Gluteus Maximus, Hamstrings, and Adductors, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Lunges, correct form, side angle, dark background, neon highlights on Quadriceps, Gluteus Maximus, Hamstrings, and Adductors, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.2,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Standing tall. Feet adjacent, arms at sides." },
        { frame: "Frame 48 (Mid)", description: "Right leg forward step, hip angle dropped low, rear knee 1 inch off floor." },
        { frame: "Frame 96 (End)", description: "Standing press recovery finished, legs aligned side-by-side next to each other." }
      ],
      bodySegments: [
        { segment: "Legs", action: "Unilateral stride forward, pressing vertically up and back through heel force." },
        { segment: "Pelvis", action: "Kept strictly horizontal, zero lateral sway hips tilt." },
        { segment: "Torso", action: "Upright spinal position, shoulders completely level above hip base." }
      ]
    },
    cameraStyle: {
      angle: "Sagittal level view showing knee-to-ankle 90 degree geometry.",
      lighting: "Split-side glowing spotlights, neon orange hot zones on gluteus medius and quads.",
      background: "Slate-gray vector testing board."
    }
  },
  {
    id: "reverse_lunges",
    name: "Reverse Lunges",
    category: "LEGS",
    targetMuscles: ["Glutes", "Quadriceps", "Hamstrings", "Posterior Chain"],
    description: {
      start: "Standing upright, feet together, hands resting on hips or at chest for balance.",
      movement: "Step one leg backward, dropping pelvis vertically until both knees bend at 90-degree angles.",
      end: "Push off ball of rear foot, drawing front heel down to walk back up to initial standing position.",
      loop: "Continuous 3.2-second movement: standing (0s) -> deep reverse step lower (1.6s) -> stepping back (3.2s)."
    },
    malePrompt: "Athletic male performing Reverse Lunges, correct form, side angle, dark background, neon highlights on Glutes, Quadriceps, Hamstrings, and Posterior Chain, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Reverse Lunges, correct form, side angle, dark background, neon highlights on Glutes, Quadriceps, Hamstrings, and Posterior Chain, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.2,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Standing vertically, feet adjacent." },
        { frame: "Frame 48 (Mid)", description: "Left foot far back, left knee hovered 1 inch from floor, front knee at 90 deg." },
        { frame: "Frame 96 (End)", description: "Step up finished to start position, posture checked." }
      ],
      bodySegments: [
        { segment: "Legs", action: "Unilateral stride backwards, dropping gravity center, then exploding back forward." },
        { segment: "Footing", action: "Front heel remains flat; rear foot hinges at toe balls." },
        { segment: "Shoulders", action: "Stacked directly over hip joints, zero vertical torso forward lean." }
      ]
    },
    cameraStyle: {
      angle: "Strict sagittal side view to verify front knee and rear knee angles.",
      lighting: "Soft diffuse studio lights with glowing blue lines showing knee path tracks.",
      background: "Flat deep gray space with high-contrast motion grids."
    }
  },
  {
    id: "bulgarian_split_squat",
    name: "Bulgarian Split Squat",
    category: "LEGS",
    targetMuscles: ["Quadriceps", "Gluteus Medius", "Gluteus Maximus", "Hamstrings"],
    description: {
      start: "Standing in split stance facing forward, back foot elevated on a bench behind you, toes resting flat.",
      movement: "Lower hips vertically, keeping front knee tracking over front foot and keeping trunk tilted forward softly.",
      end: "Drive front heel down to push torso back upright, fully contracting the front glute muscle at peak height.",
      loop: "Continuous 3.5-second unilateral cycle: standing splits tall (0s) -> deep single-leg dip (1.75s) -> return tall (3.5s)."
    },
    malePrompt: "Athletic male performing Bulgarian Split Squat, correct form, side angle, dark background, neon highlights on Quadriceps, Gluteus Medius, Gluteus Maximus, and Hamstrings, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Bulgarian Split Squat, correct form, side angle, dark background, neon highlights on Quadriceps, Gluteus Medius, Gluteus Maximus, and Hamstrings, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.5,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Split elevated stance. Front leg supporting 85% mass weight, straight knees." },
        { frame: "Frame 52 (Mid)", description: "Front hamstring reaches parallel to floor. Rear knee dips deep under bench support." },
        { frame: "Frame 105 (End)", description: "Standing extension completed, hip joint fully re-extended." }
      ],
      bodySegments: [
        { segment: "Glutes", action: "Heavy eccentric dynamic control of outer hip alignment and glute power." },
        { segment: "Knees", action: "Front knee tracks outward directly above foot; posterior knee slides toward floor." },
        { segment: "Feet", action: "Support foot anchored firm, posterior instep lying flat on bench frame." }
      ]
    },
    cameraStyle: {
      angle: "Lateral side view highlighting trunk angle relative to elevated bench support.",
      lighting: "Intense back spot lights highlighting gluteus medius structures and thigh peak density.",
      background: "Dark mechanical fitness lab space with distance tick marks."
    }
  },
  {
    id: "leg_press",
    name: "Leg Press",
    category: "LEGS",
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
    description: {
      start: "Seated deep inside the machine chair, feet placed hip-width centered on the sled plate.",
      movement: "Slowly lower the heavy sled platform down-in towards the chest, flexing hips and knees to 90 degrees.",
      end: "Drive platform away with force by extending knees without locking joints at full extension.",
      loop: "Smooth 3.6-second sled sliding loop: legs extended (0s) -> sled deep at chest (1.8s) -> legs extended (3.6s)."
    },
    malePrompt: "Athletic male performing Leg Press, correct form, side angle, dark background, neon highlights on Quadriceps, Glutes, and Hamstrings, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Leg Press, correct form, side angle, dark background, neon highlights on Quadriceps, Glutes, and Hamstrings, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.6,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Sled high, leg angle extended around 165 degrees." },
        { frame: "Frame 54 (Mid)", description: "Sled retracted close to chest, knees spread at 90 degrees." },
        { frame: "Frame 108 (End)", description: "Legs press sled platform back vertically, muscles fully contracted." }
      ],
      bodySegments: [
        { segment: "Knees", action: "Flexing and pushing in linear alignment; no internal rolling (valgus)." },
        { segment: "Pelvis", action: "Sinks heavy into the seat base, zero tailbone tilted pelvis." },
        { segment: "Sled", action: "Slides along parallel 45-degree angle guides." }
      ]
    },
    cameraStyle: {
      angle: "Side Profile angle tilted slightly forward to show foot landing posture.",
      lighting: "Linear glowing beams tracing the direction of sled displacement force.",
      background: "Futuristic scientific diagnostic grid chamber."
    }
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    category: "LEGS",
    targetMuscles: ["Hamstrings", "Gluteus Maximus", "Erector Spinae"],
    description: {
      start: "Standing holding barbell at thighs, hip-width grip, feet forward, shoulders packed, knees slightly softened.",
      movement: "Push hips horizontally backward, bowing forward from waist, gliding the bar down shins under neutral back.",
      end: "Descend to mid-shin feeling severe hamstring stretch, then drive hips forward to rise up completely.",
      loop: "Continuous 3.4-second hinging loop: standing tall (0s) -> bar at shin/hips pushed back (1.7s) -> hips lock (3.4s)."
    },
    malePrompt: "Athletic male performing Romanian Deadlift, correct form, side angle, dark background, neon highlights on Hamstrings, Gluteus Maximus, and Erector Spinae, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Romanian Deadlift, correct form, side angle, dark background, neon highlights on Hamstrings, Gluteus Maximus, and Erector Spinae, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.4,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Lockout position. Bar rests at anterior hips, chest puffed, spine long." },
        { frame: "Frame 51 (Mid)", description: "Lowest stretch depth. Bar below kneecaps, tailbone pushed far back." },
        { frame: "Frame 102 (End)", description: "Hips driven forward to tap lockout state, spine stacked vertical." }
      ],
      bodySegments: [
        { segment: "Hips", action: "Pure horizontal translation (hinge), hips sliding back then forward." },
        { segment: "Shoulders", action: "Pinned in extension, dragging bar directly tight to shin bones." },
        { segment: "Spine", action: "Zero flexion; lumbar spine column kept strictly flat." }
      ]
    },
    cameraStyle: {
      angle: "Strict sagittal profile view displaying the minimal knee flex and prominent hip translation.",
      lighting: "Glistening neon tracks tracing the straight vertical bar ascent-descent line.",
      background: "Minimalistic graphite gray space background."
    }
  },
  {
    id: "glute_bridge",
    name: "Glute Bridge",
    category: "LEGS",
    targetMuscles: ["Gluteus Maximus", "Hamstrings", "Transverse Abdominis"],
    description: {
      start: "Lying flat in supine position on mat, knees flexed at 90 degrees, feet flat, arms straight along sides.",
      movement: "Drive feet down into floor, squeezing glutes to elevate hips and pelvis into a straight bridge diagonal.",
      end: "Pause 1 second at top alignment (knees-to-shoulder diagonal), then lower hips back under control to mat.",
      loop: "Fluid 3.0-second vertical hip driving cycle: hips on mat flat (0s) -> peak glutes bridge (1.5s) -> lower (3.0s)."
    },
    malePrompt: "Athletic male performing Glute Bridge, correct form, side angle, dark background, neon highlights on Gluteus Maximus, Hamstrings, and Transverse Abdominis, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Glute Bridge, correct form, side angle, dark background, neon highlights on Gluteus Maximus, Hamstrings, and Transverse Abdominis, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Flat on back mat. Heels close to buttocks base, legs bent." },
        { frame: "Frame 45 (Mid)", description: "Bridge elevation peak. Hips fully extended, straight line from knees to chest." },
        { frame: "Frame 90 (End)", description: "Hips lowered softly back down, reloading the glute fibers." }
      ],
      bodySegments: [
        { segment: "Hips", action: "Vertical pelvic drive, squeezing the glutes hard at maximum terminal extension." },
        { segment: "Feet", action: "Anchored flat, loading the downward force vector into the heels." },
        { segment: "Spine", action: "Thighs and pelvis aligned inline with thoracic cavity, zero hyperextension." }
      ]
    },
    cameraStyle: {
      angle: "Sidelong floor-level perspective detailing hip elevation height symmetry.",
      lighting: "Bright warm orange glow concentrating heavily inside gluteal contours.",
      background: "Clean tech dark room setup with fine coordinate guides."
    }
  },
  {
    id: "hip_thrust",
    name: "Hip Thrust",
    category: "LEGS",
    targetMuscles: ["Gluteus Maximus", "Hamstrings", "Quadriceps"],
    description: {
      start: "Upper back (mid-scapula) leaning against bench edge, knees bent at 90, barbell resting on hip crease.",
      movement: "Inhale, drop hips down towards floor, keeping gaze forward and keeping ribs locked down.",
      end: "Exhale, drive hips up vertically until torso is parallel to floor. Shins vertical. Squeeze glutes hard.",
      loop: "Symmetrical 3.3-second heavy hip driving cycle: barbell dropped (0s) -> barbell at horizontal peak (1.65s) -> drop (3.3s)."
    },
    malePrompt: "Athletic male performing Hip Thrust, correct form, side angle, dark background, neon highlights on Gluteus Maximus, Hamstrings, and Quadriceps, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Hip Thrust, correct form, side angle, dark background, neon highlights on Gluteus Maximus, Hamstrings, and Quadriceps, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Glutes hovering near floor, chin tucked forward looking ahead, bar low." },
        { frame: "Frame 50 (Mid)", description: "Hips locked at horizontal bench height. Shins form vertical 90-degree columns." },
        { frame: "Frame 100 (End)", description: "Eased back down, hips lower back down on a vertical sliding trajectory." }
      ],
      bodySegments: [
        { segment: "Pelvis", action: "Posterior pelvic tilt near top peak to completely lock glutes." },
        { segment: "Shins", action: "Held static as vertical load pillars, feet flat on flooring." },
        { segment: "Neck", action: "Gaze kept forward throughout, preventing backward thoracic extension." }
      ]
    },
    cameraStyle: {
      angle: "Side profile showing bench support height and diagonal hip displacement.",
      lighting: "Aggressive neon highlight paths on glute max, under-chest glow.",
      background: "High-contrast cyber facility background with grid coordinates."
    }
  },
  {
    id: "calf_raises",
    name: "Calf Raises",
    category: "LEGS",
    targetMuscles: ["Gastrocnemius", "Soleus", "Tibialis Posterior"],
    description: {
      start: "Standing upright, balls of feet resting on a small edge elevation, heels hanging off, knees straight.",
      movement: "Exhale, push through balls of feet to elevate body weight vertically on tips of toes, ankle fully extended.",
      end: "Inhale, lower heels back down under slow control until a deep tendon stretch is registered in rear calves.",
      loop: "Continuous 2.6-second oscillation: heels dropped wide (0s) -> high tip-toe balance (1.3s) -> lower (2.6s)."
    },
    malePrompt: "Athletic male performing Calf Raises, correct form, side angle, dark background, neon highlights on Gastrocnemius, Soleus, and Tibialis Posterior, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Calf Raises, correct form, side angle, dark background, neon highlights on Gastrocnemius, Soleus, and Tibialis Posterior, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 2.6,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Heels deeply dropped below the horizontal plane (maximum ankle stretch)." },
        { frame: "Frame 39 (Mid)", description: "Feet pointing near vertical. Heel raised high, gastrocnemius squeezed firm." },
        { frame: "Frame 78 (End)", description: "Slow descent, lowering heels beneath block level again." }
      ],
      bodySegments: [
        { segment: "Ankles", action: "Max plantar flexion raising height, transferring to dorsiflexion stretch." },
        { segment: "Knees", action: "Locked completely straight to target gastrocnemius, avoiding quad flex." },
        { segment: "Arms", action: "Steady hold on balance rail inline with upright torso." }
      ]
    },
    cameraStyle: {
      angle: "Close-up sagittal view focusing entirely on ankle pivot block and rear calves.",
      lighting: "Vivid cyan focus line tracing ankle joints, neon orange on calf muscles.",
      background: "Dark charcoal grid framework context."
    }
  },

  // =========================================================================
  // CORE EXERCISES (31-40)
  // =========================================================================
  {
    id: "plank",
    name: "Plank",
    category: "CORE",
    targetMuscles: ["Rectus Abdominis", "Transverse Abdominis", "Obliques", "Shoulders"],
    description: {
      start: "Forearms resting on the floor directly under shoulders, body forming a straight line from ears to heels.",
      movement: "Brace the abdominals and squeeze glutes. Maintain perfect neutral hip placement without dropping spine.",
      end: "Hold index point perfectly still, preventing hip drop throughout the full loop duration.",
      loop: "Isometric static loop: breathing motion of ribcage (0s -> 3.0s) while deep core glows orange."
    },
    malePrompt: "Athletic male performing Plank, correct form, side angle, dark background, neon highlights on Rectus Abdominis, Transverse Abdominis, Obliques, and Shoulders, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Plank, correct form, side angle, dark background, neon highlights on Rectus Abdominis, Transverse Abdominis, Obliques, and Shoulders, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Full forearm support, body parallel to mat. Abdominals clamped." },
        { frame: "Frame 45 (Mid)", description: "Subtle lung expansion breathing shift, spine straight, hips aligned." },
        { frame: "Frame 90 (End)", description: "Spinal axis holds absolutely straight, complete loop transition." }
      ],
      bodySegments: [
        { segment: "Core", action: "Maximum isometric contraction with microscopic movement representing breathing." },
        { segment: "Upper Back", action: "Scapula actively pushed wide to exclude shoulder sinking." },
        { segment: "Pelvis", action: "Tucked in slight posterior tilt, locking out lower back stress." }
      ]
    },
    cameraStyle: {
      angle: "Transverse direct orthogonal side profile.",
      lighting: "High contrast rim light with a high-intensity localized orange abdominal core hotspot.",
      background: "Achromatic matte background with sleek tech data lines."
    }
  },
  {
    id: "side_plank",
    name: "Side Plank",
    category: "CORE",
    targetMuscles: ["Obliques", "Transverse Abdominis", "Gluteus Medius"],
    description: {
      start: "Lying on side, supporting body weight on one forearm aligned under shoulder, feet stacked together.",
      movement: "Lift hip structures high off mat until torso forms a long direct diagonal line from shoulder to heels.",
      end: "Sustain elevation with absolute static rigidity, squeezing lateral abdominal wall from the bottom.",
      loop: "Isometric hold loop: subtle body breathing expansion (0s -> 3.0s) with glowing lateral obliques.",
    },
    malePrompt: "Athletic male performing Side Plank, correct form, side angle, dark background, neon highlights on Obliques, Transverse Abdominis, and Gluteus Medius, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Side Plank, correct form, side angle, dark background, neon highlights on Obliques, Transverse Abdominis, and Gluteus Medius, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Hips raised, bottom oblique wall clamped, forearm pinned vertically." },
        { frame: "Frame 45 (Mid)", description: "Top arm extended straight upwards of shoulder, fingers long, hips high." },
        { frame: "Frame 90 (End)", description: "Static hold loop checkpoint, zero hip dropping detected." }
      ],
      bodySegments: [
        { segment: "Obliques", action: "Deep isometric lateral lock generating support vector against gravity." },
        { segment: "Shoulders", action: "Rotator cuffs and lat muscles locked to maintain vertical stacking block." },
        { segment: "Feet", action: "Lateral edges of feet stacked together, locking knee joints straight." }
      ]
    },
    cameraStyle: {
      angle: "Frontal orthographic profile view showing stack alignment and pelvis elevation.",
      lighting: "Bottom oblique accent edge-lights highlighted inside a blazing red-orange grid color.",
      background: "Minimal charcoal blueprint sheet."
    }
  },
  {
    id: "bicycle_crunch",
    name: "Bicycle Crunch",
    category: "CORE",
    targetMuscles: ["Obliques", "Rectus Abdominis", "Transverse Abdominis"],
    description: {
      start: "Lying flat on back, hands lightly behind head, knees raised at 90-degrees, shoulder blades floating.",
      movement: "Rotate left shoulder towards the right knee while extending left leg perfectly straight out.",
      end: "Immediately switch sides, dragging right shoulder to left knee while extending right leg long.",
      loop: "Symmetrical 2.8-second rapid cycle: left knee in/right out (0s) -> right knee in/left out (1.4s) -> return (2.8s)."
    },
    malePrompt: "Athletic male performing Bicycle Crunch, correct form, side angle, dark background, neon highlights on Obliques, Rectus Abdominis, and Transverse Abdominis, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Bicycle Crunch, correct form, side angle, dark background, neon highlights on Obliques, Rectus Abdominis, and Transverse Abdominis, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 2.8,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Left shoulder rotated up towards right knee (flexed), left leg extended." },
        { frame: "Frame 42 (Mid)", description: "Right shoulder rotated up towards left knee (flexed), right leg extended." },
        { frame: "Frame 84 (End)", description: "Transition back to original leg setup to close loop." }
      ],
      bodySegments: [
        { segment: "Spine", action: "Thoracic crunch with alternate bilateral rotational pivots." },
        { segment: "Legs", action: "Alternating driving pistons extending from 90 to 0 degrees heights." },
        { segment: "Ellbows", action: "Stay wide; rotation originates from the rib cage twist." }
      ]
    },
    cameraStyle: {
      angle: "High-angle oblique view from head level down to hips.",
      lighting: "Swirling neon spiral trail lights illustrating torso twist velocity.",
      background: "Carbon dark grid with running data trackers."
    }
  },
  {
    id: "leg_raises",
    name: "Leg Raises",
    category: "CORE",
    targetMuscles: ["Lower Abdominals", "Hip Flexors", "Rectus Abdominis"],
    description: {
      start: "Lying in supine position, arms flat along sides pressing down, legs straight together on floor.",
      movement: "Exhale, brace core, and pivot hip joints raising straight legs vertically to 90 degrees.",
      end: "Inhale, slowly lower legs back down under extreme control, pausing 1 inch above floor.",
      loop: "Smooth 3.5-second vertical cycle: legs flat hovering (0s) -> legs vertical (1.75s) -> legs flat hover (3.5s)."
    },
    malePrompt: "Athletic male performing Leg Raises, correct form, side angle, dark background, neon highlights on Lower Abdominals, Hip Flexors, and Rectus Abdominis, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Leg Raises, correct form, side angle, dark background, neon highlights on Lower Abdominals, Hip Flexors, and Rectus Abdominis, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.5,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Legs extended flat 1 inch above floor, lower back pressed down." },
        { frame: "Frame 52 (Mid)", description: "Legs raised 90 degrees pointing vertically straight up over pelvis." },
        { frame: "Frame 105 (End)", description: "Eccentric descent finished directly at hover, ready for next reps." }
      ],
      bodySegments: [
        { segment: "Legs", action: "Strict hip flexion-extension lever loop keeping knee joints locked." },
        { segment: "Lower Back", action: "Pressed static hard flat against floor (isometric bracing)." },
        { segment: "Arms", action: "Pushed into floor to leverage pelvic anchoring alignment." }
      ]
    },
    cameraStyle: {
      angle: "Strict orthogonal side profile, focusing on lower abdominal and lumbar alignment.",
      lighting: "Sleek teal accent sweeps on floor plane, with glowing heatmap on deep lower abs.",
      background: "Achromatic black tech space with coordinate lines."
    }
  },
  {
    id: "hanging_leg_raise",
    name: "Hanging Leg Raise",
    category: "CORE",
    targetMuscles: ["Lower Abdominals", "Iliopsoas", "Rectus Abdominis", "Grip Strength"],
    description: {
      start: "Hanging from overhead bar in active deadhang, legs together and pointing straight down towards floor.",
      movement: "Contract lower abs to raise lock-straight legs upward until they are completely parallel to ground.",
      end: "Slowly lower legs back down under strict concentric resistance, ending back in dead hang without body swinging.",
      loop: "Fluid 3.6-second hanging leg flexion loop: hanging straight (0s) -> L-sit perpendicular hover (1.8s) -> straight (3.6s)."
    },
    malePrompt: "Athletic male performing Hanging Leg Raise, correct form, side angle, dark background, neon highlights on Lower Abdominals, Iliopsoas, Rectus Abdominis, and Grip Strength, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Hanging Leg Raise, correct form, side angle, dark background, neon highlights on Lower Abdominals, Iliopsoas, Rectus Abdominis, and Grip Strength, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.6,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Active hanging position, legs fully straight vertical, hips aligned." },
        { frame: "Frame 54 (Mid)", description: "Hip joints bent to 90-degrees. Legs directly horizontal in L-sit elevation." },
        { frame: "Frame 108 (End)", description: "Controlled vertical lowering completed, zero torso swinging sway." }
      ],
      bodySegments: [
        { segment: "Hips", action: "Vertical lifting lever arc spanning 90 angular degrees." },
        { segment: "Shoulders", action: "Pushed down in active scapular depression to lock torso core stabilizers." },
        { segment: "Hands", action: "Static fist grip holding bar frame securely." }
      ]
    },
    cameraStyle: {
      angle: "SAGITTAL level layout tracking the angle block of hips relative to overhead cable.",
      lighting: "Bright neon orange glow radiating around lower mid-center trunk, cyan frame lines.",
      background: "Empty tech void with abstract horizontal grid lines."
    }
  },
  {
    id: "russian_twist",
    name: "Russian Twist",
    category: "CORE",
    targetMuscles: ["Obliques", "Rectus Abdominis", "Core Stabilizers"],
    description: {
      start: "Sitting, knees bent, leaning back at a 45-degree angle, heels hovering slightly off the floor, holding hands together.",
      movement: "Twist your entire torso dynamically to the right side, touching hands to the floor near your hip crease.",
      end: "Rotate through the center to replicate the motion on the left side, keeping lower body stationary and knees close.",
      loop: "Continuous 2.6-second rotary loop: twist right (0s) -> center (0.65s) -> twist left (1.3s) -> center (1.95s) -> right (2.6s)."
    },
    malePrompt: "Athletic male performing Russian Twist, correct form, side angle, dark background, neon highlights on Obliques, Rectus Abdominis, and Core Stabilizers, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Russian Twist, correct form, side angle, dark background, neon highlights on Obliques, Rectus Abdominis, and Core Stabilizers, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 2.6,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Leaning back 45-degrees, heels off floor, torso twisted completely right." },
        { frame: "Frame 39 (Mid)", description: "Symmetrical transition across center, ribs rotating toward left. Hips static." },
        { frame: "Frame 78 (End)", description: "Full twist left achieved, hands brushing side floor plane." }
      ],
      bodySegments: [
        { segment: "Spine", action: "Rotational pivot of upper spine segment while lower segments hold isometric balance." },
        { segment: "Hips/Knees", action: "Lifted in slight knee bend, kept balanced to prevent rocking." },
        { segment: "Obliques", action: "Pulsing neon fire highlights on left/right side ribs." }
      ]
    },
    cameraStyle: {
      angle: "High 3/4 front angle to view spinal rotation and foot balance off-ground.",
      lighting: "Swirling neon blue and orange light vectors tracing shoulder twist rotation.",
      background: "Technical isometric CAD ground plane grid."
    }
  },
  {
    id: "mountain_climbers",
    name: "Mountain Climbers",
    category: "CORE",
    targetMuscles: ["Rectus Abdominis", "Hip Flexors", "Quadriceps", "Shoulders"],
    description: {
      start: "Strong high plank position, hands under shoulders, toes tucked, hips locked in level stance.",
      movement: "Drive one knee forward under chest towards elbow, keeping spine flat and low to the ground.",
      end: "Extend that leg backward to starting position while immediately driving the opposite knee forward.",
      loop: "Rapid piston-like 2.0-second sprint cycle: left knee tucked (0s) -> right knee tucked (1.0s) -> left knee tucked (2.0s)."
    },
    malePrompt: "Athletic male performing Mountain Climbers, correct form, side angle, dark background, neon highlights on Rectus Abdominis, Hip Flexors, Quadriceps, and Shoulders, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Mountain Climbers, correct form, side angle, dark background, neon highlights on Rectus Abdominis, Hip Flexors, Quadriceps, and Shoulders, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 2,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "High plank, left knee driven forward halfway, right leg long on toe pivot." },
        { frame: "Frame 30 (Mid)", description: "Mid-transition transition. Legs passing beneath abdomen; shoulders stacked." },
        { frame: "Frame 60 (End)", description: "Right knee fully forward under chest, left leg locked straight back." }
      ],
      bodySegments: [
        { segment: "Legs", action: "Alternating parallel linear knee tuck extensions, moving like rapid pistons." },
        { segment: "Shoulders", action: "Heavy isometric hold to sustain upper trunk directly above wrists." },
        { segment: "Core", action: "Abs clamped tightly to prevent pelvis bouncing high in the air." }
      ]
    },
    cameraStyle: {
      angle: "Low 3/4 side profile angle revealing the hip levels and rapid leg cycles.",
      lighting: "Vivid cyan velocity trace lines tracking knee horizontal extensions.",
      background: "Achromatic dark space with linear data tracks."
    }
  },
  {
    id: "flutter_kicks",
    name: "Flutter Kicks",
    category: "CORE",
    targetMuscles: ["Lower Abdominals", "Hip Flexors", "Rectus Abdominis"],
    description: {
      start: "Lying supine on mat, hands wedged under glutes for lumbar support, chin raised, legs straight hovered 6 inches off floor.",
      movement: "Raise left leg to 30 degrees while dipping right leg to 2 inches, keeping knees locked straight.",
      end: "Smoothly alternate heights in a scissor-cutting pattern under high abdominal brace.",
      loop: "Rapid 1.8-second scissor flutter: left leg up (0s) -> right leg up (0.9s) -> left leg up (1.8s)."
    },
    malePrompt: "Athletic male performing Flutter Kicks, correct form, side angle, dark background, neon highlights on Lower Abdominals, Hip Flexors, and Rectus Abdominis, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Flutter Kicks, correct form, side angle, dark background, neon highlights on Lower Abdominals, Hip Flexors, and Rectus Abdominis, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 1.8,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Supine pose, hands stacked, left foot at 30 degrees, right foot 2 inches hover." },
        { frame: "Frame 27 (Mid)", description: "Mid-way feet swap. Legs crossing at parallel 15-degrees elevation plane." },
        { frame: "Frame 54 (End)", description: "Right foot elevated to apex height, left foot descended to hovering low." }
      ],
      bodySegments: [
        { segment: "Legs", action: "Short vertical hip oscillating beats keeping knees in rigid straight state." },
        { segment: "Core", action: "Intense lower abdominal wall clamping, keeping lumbar spine flat on carpet." },
        { segment: "Neck", action: "Slight flexion holding chin up off mat to activate upper rectus abs." }
      ]
    },
    cameraStyle: {
      angle: "Floor-level horizontal sagittal profile view displaying vertical leg spacing.",
      lighting: "Neon red-orange fire pulsing around lower pelvis, blue skeletal leg indicators.",
      background: "Clean dark void with fine digital grid grids."
    }
  },
  {
    id: "dead_bug",
    name: "Dead Bug",
    category: "CORE",
    targetMuscles: ["Transverse Abdominis", "Rectus Abdominis", "Deep Core"],
    description: {
      start: "Lying flat on back, arms pointing up, knees raised at 90 degrees directly above hips (tabletop position).",
      movement: "Exhale, lower your right arm backward overhead and extend your left leg straight forward, hovering both above floor.",
      end: "Inhale, contract abdominals to return arm and leg back to vertical tabletop starting coordination. Alternate sides.",
      loop: "Continuous 3.4-second alternating cycle: starting tabletop (0s) -> right arm/left leg down (1.7s) -> return tabletop (3.4s)."
    },
    malePrompt: "Athletic male performing Dead Bug, correct form, side angle, dark background, neon highlights on Transverse Abdominis, Rectus Abdominis, and Deep Core, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Dead Bug, correct form, side angle, dark background, neon highlights on Transverse Abdominis, Rectus Abdominis, and Deep Core, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.4,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Tabletop stance on back. Arms vertical at 90 deg, knees bent at 90 deg." },
        { frame: "Frame 51 (Mid)", description: "Right arm is fully overhead behind, left thigh extended straight 3 inches off mat." },
        { frame: "Frame 102 (End)", description: "Brought back to tabletop, muscle tension held constant." }
      ],
      bodySegments: [
        { segment: "Arms", action: "Alternating overhead rotary drop tracking overhead to vertical." },
        { segment: "Legs", action: "Symmetrical tabletop bend to straight horizontal foot extension swap." },
        { segment: "Torso", action: "Massive abdominal lock, keeping lower back glued to flooring." }
      ]
    },
    cameraStyle: {
      angle: "3/4 profile looking slightly down from side over hips.",
      lighting: "Soft ambient shadow box, glowing neon tracers demonstrating cross-body diagonal vectors.",
      background: "Sleek dark matte blueprint grids."
    }
  },
  {
    id: "toe_touch_crunch",
    name: "Toe Touch Crunch",
    category: "CORE",
    targetMuscles: ["Upper Abdominals", "Rectus Abdominis"],
    description: {
      start: "Lying flat on back, legs extended straight up towards ceiling, forming a 90-degree angle with torso, toes flexed.",
      movement: "Exhale, contract upper abs to lift head and shoulders off mat, reaching hands toward toes.",
      end: "Inhale, lower upper body back under control to mat, keeping legs vertical.",
      loop: "Steady 2.8-second vertical crunching loop: flat upper body (0s) -> shoulder lift toe touch apex (1.4s) -> lower flat (2.8s)."
    },
    malePrompt: "Athletic male performing Toe Touch Crunch, correct form, side angle, dark background, neon highlights on Upper Abdominals and Rectus Abdominis, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Toe Touch Crunch, correct form, side angle, dark background, neon highlights on Upper Abdominals and Rectus Abdominis, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 2.8,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Supine torso, legs straight up forming vertical L shape. Arms relaxed." },
        { frame: "Frame 42 (Mid)", description: "Shoulder blades raise 4 inches. Fingers contact toe bones at vertical limit." },
        { frame: "Frame 84 (End)", description: "Upper back lowered to ground, spine re-lengthened under load control." }
      ],
      bodySegments: [
        { segment: "Torso", action: "Thoracic spine flexion lifting upper girdle off layout mat." },
        { segment: "Legs", action: "Held vertical and statically braced, hamstring tension supporting L shape." },
        { segment: "Arms", action: "Extended straight, reaching toward ankles along the trajectory of legs." }
      ]
    },
    cameraStyle: {
      angle: "Side profile orthographic perspective to capture L-sit alignment and shoulder height lift.",
      lighting: "Localized neon orange fire pulsing at upper abdomen, cool blue lines along vertical legs.",
      background: "Charcoal design lab grid environment."
    }
  },

  // =========================================================================
  // MOBILITY EXERCISES (41-45)
  // =========================================================================
  {
    id: "arm_circles",
    name: "Arm Circles",
    category: "MOBILITY",
    targetMuscles: ["Rotator Cuff", "Deltoids", "Shoulder Girdle"],
    description: {
      start: "Standing upright, feet shoulder-width apart, arms extended out straight to the sides parallel to the floor.",
      movement: "Sway arms in small, smooth, continuous circular paths, keeping shoulders down and arms locked in alignment.",
      end: "Complete the rotational trajectory with absolute fluidity, rotating from the shoulder socket joints.",
      loop: "Continuous 3.0-second smooth rotary cycle: arms horizontal (0s) -> circular sweeps (1.5s) -> completion (3.0s)."
    },
    malePrompt: "Athletic male performing Arm Circles, correct form, side angle, dark background, neon highlights on Rotator Cuff, Deltoids, and Shoulder Girdle, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Arm Circles, correct form, side angle, dark background, neon highlights on Rotator Cuff, Deltoids, and Shoulder Girdle, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Arms fully flared straight out parallel to floor, palms facing down." },
        { frame: "Frame 45 (Mid)", description: "Hands swept to highest vertical arc curve, shoulder ball joints rotating." },
        { frame: "Frame 90 (End)", description: "Return back around horizontal line to complete circle sweep." }
      ],
      bodySegments: [
        { segment: "Shoulders", action: "Continuous circumduction of head of humerus inside glenoid cavity." },
        { segment: "Arms", action: "Straight elbow lock, tracing matching 12-inch circular paths on the sides." },
        { segment: "Torso", action: "Standing vertical vertical alignment plane, core stabilized." }
      ]
    },
    cameraStyle: {
      angle: "Front 3/4 angled view showcasing the circular coordinate patterns.",
      lighting: "Sleek flowing neon halos tracing hand movement paths, green shoulder focus spots.",
      background: "Deep black tech studio background."
    }
  },
  {
    id: "hip_circles",
    name: "Hip Circles",
    category: "MOBILITY",
    targetMuscles: ["Hip Joints", "Gluteus Medius", "Hip Flexors"],
    description: {
      start: "Standing with hands resting on hip bones, feet wider than shoulder width, weight distributed central.",
      movement: "Rotates hips and pelvis in a wide, circular path, swinging forward, left, backward, and right.",
      end: "Return pelvis smoothly to the center, warming up the pelvic girdle and deep hip socket joint fluids.",
      loop: "Smooth 3.2-second circular rotation: pelvis forward (0s) -> side flare (1.6s) -> back sweep (3.2s)."
    },
    malePrompt: "Athletic male performing Hip Circles, correct form, side angle, dark background, neon highlights on Hip Joints, Gluteus Medius, and Hip Flexors, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Hip Circles, correct form, side angle, dark background, neon highlights on Hip Joints, Gluteus Medius, and Hip Flexors, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.2,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Standing tall, pelvis pushed forward slightly, hips centered." },
        { frame: "Frame 48 (Mid)", description: "Hips pushed far back, hinging softly at waist to complete posterior sweep." },
        { frame: "Frame 96 (End)", description: "Rotational orbit completed back around to anterior push." }
      ],
      bodySegments: [
        { segment: "Pelvis", action: "Circumduction path rotating around foot axis coordinates." },
        { segment: "Knees", action: "Kept mostly extended to maximize hip socket articulation stretch." },
        { segment: "Shoulders", action: "Move in a smaller opposing circular orbit to maintain general balance." }
      ]
    },
    cameraStyle: {
      angle: "Oblique 3/4 high-angle tracking hip displacement circles.",
      lighting: "Soft diffuse purple rim lighting with circling neon markers around hips.",
      background: "Futuristic dark tech layout."
    }
  },
  {
    id: "cat_cow_stretch",
    name: "Cat-Cow Stretch",
    category: "MOBILITY",
    targetMuscles: ["Erector Spinae", "Core", "Spine"],
    description: {
      start: "All-fours position (quadruped), hands under shoulders, knees under hips, flat neutral spine.",
      movement: "Cow phase: Inhale, drop belly towards floor, arch back, tilt tailbone and head upwards. Cat phase: Exhale, tuck chin, pull abdominal wall up, and round back.",
      end: "Flow between the two phases smoothly, articulating individual vertebrae.",
      loop: "Continuous 4.0-second undulating loop: cow phase arched (0s) -> tabletop neutral (2.0s) -> cat phase rounded (4.0s)."
    },
    malePrompt: "Athletic male performing Cat-Cow Stretch, correct form, side angle, dark background, neon highlights on Erector Spinae, Core, and Spine, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Cat-Cow Stretch, correct form, side angle, dark background, neon highlights on Erector Spinae, Core, and Spine, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 4,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Cow stance. Hips tilted up, lumbar spine arched downwards, gaze up." },
        { frame: "Frame 60 (Mid)", description: "Transitioning through horizontal tabletop neutral alignment." },
        { frame: "Frame 120 (End)", description: "Cat stance. Abdomen pulled upwards, spine rounded high, chin tucked." }
      ],
      bodySegments: [
        { segment: "Spine", action: "Complete sagittal vertical spinal wave, alternating lordotic and kyphotic curves." },
        { segment: "Pelvis", action: "Anterior pelvic tilt transitioning into posterior tilt." },
        { segment: "Shoulders", action: "Kept stacked above wrists, pushing ground away on the Cat phase." }
      ]
    },
    cameraStyle: {
      angle: "Full direct sagittal side profile tracking the wave of the spine.",
      lighting: "Laser-sharp neon trackers running the full length of the spinal vertebrae.",
      background: "Achromatic black tech studio space."
    }
  },
  {
    id: "downward_dog",
    name: "Downward Dog",
    category: "MOBILITY",
    targetMuscles: ["Hamstrings", "Calves", "Latissimus Dorsi", "Shoulders"],
    description: {
      start: "Plank position, hands under shoulders, feet hip-width. Lift hips up and back, push heels down.",
      movement: "Extend arms, press shoulders open, drive heels into floor, creating an inverted V shape with body.",
      end: "Sustain structural V lock, pulling tailbone vertically and chest through shoulder space.",
      loop: "Isometric mobility cycle: subtle breath pulses of back and calves (0s -> 3.0s) with glowing hamstrings."
    },
    malePrompt: "Athletic male performing Downward Dog, correct form, side angle, dark background, neon highlights on Hamstrings, Calves, Latissimus Dorsi, and Shoulders, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Downward Dog, correct form, side angle, dark background, neon highlights on Hamstrings, Calves, Latissimus Dorsi, and Shoulders, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Inverted V pose, hips high, shoulders open, heels sinking down." },
        { frame: "Frame 45 (Mid)", description: "Heels press firmly flat on floor plane, hips pushed higher back." },
        { frame: "Frame 90 (End)", description: "Subtle sway adjustment to link the continuous loop." }
      ],
      bodySegments: [
        { segment: "Hips", action: "Apex corner of the inverted V structure, held static and pushed up-and-back." },
        { segment: "Shoulders", action: "Extremely open angle, arms inline with torso, head dropped relaxed." },
        { segment: "Legs", action: "Straight knees with calves and hamstrings experiencing deep stretch." }
      ]
    },
    cameraStyle: {
      angle: "Lateral profile view documenting the angular relationship of legs to arms.",
      lighting: "Pulsing purple spotlights illuminating posterior calf and hamstring paths.",
      background: "Blueprint dark floor coordinates."
    }
  },
  {
    id: "cobra_stretch",
    name: "Cobra Stretch",
    category: "MOBILITY",
    targetMuscles: ["Abdominals", "Hip Flexors", "Lumbar Spine", "Pectorals"],
    description: {
      start: "Lying prone on stomach on mat, legs straight back, hands placed on floor under shoulders, elbows tucked.",
      movement: "Push through hands to extend elbows, lifting chest, shoulders, and ribs high off mat.",
      end: "Arch back, keeping hips flat on the ground and shoulders pushed down away from ears.",
      loop: "Continuous 3.5-second movement: flat prone lying (0s) -> upright arched chest lift (1.75s) -> lower prone (3.5s)."
    },
    malePrompt: "Athletic male performing Cobra Stretch, correct form, side angle, dark background, neon highlights on Abdominals, Hip Flexors, Lumbar Spine, and Pectorals, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Cobra Stretch, correct form, side angle, dark background, neon highlights on Abdominals, Hip Flexors, Lumbar Spine, and Pectorals, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.5,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Lying flat prone on floor, forehead down, palms placed." },
        { frame: "Frame 52 (Mid)", description: "Upward cobra arched height. Core stretched, lumbar curved, head tilted back." },
        { frame: "Frame 105 (End)", description: "Slow concentric lowering of ribs back to floor." }
      ],
      bodySegments: [
        { segment: "Spine", action: "Lumbar and thoracic extension bending vertically upwards." },
        { segment: "Arms", action: "Hands anchor push-off, elbows extending to lift chest." },
        { segment: "Pelvis", action: "Glued tight to floor, allowing traction stretch of the core wall." }
      ]
    },
    cameraStyle: {
      angle: "Low sagittal side angle tracking lumbar curvature depth.",
      lighting: "Soft golden light beams projecting from front of chest, orange highlights on abs.",
      background: "Minimal tech dark grid backdrop."
    }
  },

  // =========================================================================
  // CARDIO EXERCISES (46-50)
  // =========================================================================
  {
    id: "burpees",
    name: "Burpees",
    category: "CARDIO",
    targetMuscles: ["Cardiovascular System", "Quadriceps", "Chest", "Core"],
    description: {
      start: "Standing upright, drop down into a squat, placing hands flat on the floor in front of you.",
      movement: "Jump feet backward to land in high plank, lower chest to floor, then jump feet forward back to squat.",
      end: "Explosively leap straight up in the air, throwing hands overhead before landing softly back to start.",
      loop: "Rapid 2.8-second full-body cycle: squat down list (0s) -> plank drop (0.7s) -> jump back in (1.4s) -> sky bounce (2.1s) -> land (2.8s)."
    },
    malePrompt: "Athletic male performing Burpees, correct form, side angle, dark background, neon highlights on Cardiovascular System, Quadriceps, Chest, and Core, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Burpees, correct form, side angle, dark background, neon highlights on Cardiovascular System, Quadriceps, Chest, and Core, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 2.8,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Standing vertically tall, ready for high-intensity movement." },
        { frame: "Frame 20", description: "Hands flat, feet kicked back to pushup plank drop shape." },
        { frame: "Frame 50", description: "Feet jumped under shoulders, knees flexed, chest vertical." },
        { frame: "Frame 78 (End)", description: "Overhead leap peak. Vertically suspended, hands straight up." }
      ],
      bodySegments: [
        { segment: "Full-Body", action: "Multi-joint compound chain, transitioning from vertical standing to horizontal ground plank to takeoff." },
        { segment: "Lungs", action: "Cardio system pulsing. Neon red pulsing lines trace chest core heart rates." },
        { segment: "Shoulders", action: "Throwing arms up dynamically to assist jumping takeoff." }
      ]
    },
    cameraStyle: {
      angle: "Wide side orthographic profile tracking both extreme heights and ground transitions.",
      lighting: "Flashing bright red heart-rate indicator tracks, yellow acceleration vectors.",
      background: "Minimalistic dark cyber playground grids."
    }
  },
  {
    id: "high_knees",
    name: "High Knees",
    category: "CARDIO",
    targetMuscles: ["Cardiovascular System", "Hip Flexors", "Calves", "Hamstrings"],
    description: {
      start: "Standing upright, feet hip-width, chest out, arms bent at a 90-degree angle close to ribs.",
      movement: "Run in place dynamically, driving alternating knees up to hip level, hopping briskly on feet balls.",
      end: "Pistons knees vertically in a direct 180-to-90 degree arc while pumping arms symmetrically.",
      loop: "Brisk 1.4-second running cycle: left knee raised (0s) -> right knee raised (0.7s) -> left knee raised (1.4s)."
    },
    malePrompt: "Athletic male performing High Knees, correct form, side angle, dark background, neon highlights on Cardiovascular System, Hip Flexors, Calves, and Hamstrings, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing High Knees, correct form, side angle, dark background, neon highlights on Cardiovascular System, Hip Flexors, Calves, and Hamstrings, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 1.4,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Standing upright, left knee raised at 90-deg, right foot pivoting on ball." },
        { frame: "Frame 21 (Mid)", description: "Feet swapping in transit. Knees passing midway in speed sprint." },
        { frame: "Frame 42 (End)", description: "Right knee raised to waist height, left foot on support ball." }
      ],
      bodySegments: [
        { segment: "Legs", action: "Alternating quick knee flexion up to anterior level, rapid ankle hops." },
        { segment: "Shoulders", action: "Symmetrical running arm-pumps coordinating opposing legs." },
        { segment: "Spine", action: "Held tall and upright, resisting torso lean tilt." }
      ]
    },
    cameraStyle: {
      angle: "Pure orthogonal sagittal view detailing knee elevation and running postures.",
      lighting: "Gleaming blue motion lines detailing runner kinematics, neon orange calves.",
      background: "Futuristic slate cyber grid tracker."
    }
  },
  {
    id: "jump_rope",
    name: "Jump Rope",
    category: "CARDIO",
    targetMuscles: ["Calves", "Heart Rate", "Deltoids", "Coordination"],
    description: {
      start: "Standing upright, holding matching jump rope handles at hips, elbows tucked, knees soft.",
      movement: "Perform short, vertical hops, clearing matching rotating ropes while wrists rotate in circles.",
      end: "Absorbs hop landing softly on balls of feet, matching jump pacing with the rope's rotation.",
      loop: "Fast 1.2-second rhythm: rope overhead / toes jump flat (0s) -> rope under foot / toes clear (0.6s) -> repeat (1.2s)."
    },
    malePrompt: "Athletic male performing Jump Rope, correct form, side angle, dark background, neon highlights on Calves, Heart Rate, Deltoids, and Coordination, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Jump Rope, correct form, side angle, dark background, neon highlights on Calves, Heart Rate, Deltoids, and Coordination, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 1.2,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Feet flat, ropes rotating overhead, hands cocked out near waist." },
        { frame: "Frame 18 (Mid)", description: "Toes elevated 2 inches off floor. Rope glides smoothly under balls of feet." },
        { frame: "Frame 36 (End)", description: "Soft ankle landing, rope cycling back around vertical plane." }
      ],
      bodySegments: [
        { segment: "Ankles", action: "Extremely rapid vertical spring movements, hopping strictly on toe caps." },
        { segment: "Wrists", action: "Small horizontal circle orbits driving momentum of high-speed rope." },
        { segment: "Shoulders", action: "Held relatively stationary, arms tucked close to lateral rib walls." }
      ]
    },
    cameraStyle: {
      angle: "3/4 profile right side view showing full body and rope sweep clearance.",
      lighting: "Vivid yellow neon spiral highlighting the rotating rope, orange calves.",
      background: "Charcoal technical grid canvas."
    }
  },
  {
    id: "skater_jumps",
    name: "Skater Jumps",
    category: "CARDIO",
    targetMuscles: ["Gluteus Medius", "Quadriceps", "Calves", "Lateral Power"],
    description: {
      start: "Standing, leap bound laterally to the right side, landing dynamically on right foot.",
      movement: "Exhale, drop hips back slightly on landing, sweeping left leg diagonally behind as a counter-balance.",
      end: "Immediately explode laterally back to the left side, swapping load directly onto the left foot.",
      loop: "Rhythmic 2.4-second skating bound cycle: land right foot (0s) -> glide (0.6s) -> land left foot (1.2s) -> glide (1.8s) -> right (2.4s)."
    },
    malePrompt: "Athletic male performing Skater Jumps, correct form, side angle, dark background, neon highlights on Gluteus Medius, Quadriceps, Calves, and Lateral Power, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Skater Jumps, correct form, side angle, dark background, neon highlights on Gluteus Medius, Quadriceps, Calves, and Lateral Power, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 2.4,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Launches laterally. Right leg bent, left foot tucked diagonally behind right heel." },
        { frame: "Frame 36 (Mid)", description: "Mid-air suspended takeoff bounding leftwards. Body angled parallel." },
        { frame: "Frame 72 (End)", description: "Left heel floor contact completed, absorbing lateral hip force, right leg tucked." }
      ],
      bodySegments: [
        { segment: "Hips", action: "Lateral bounding explosion coupled with unilateral deep hip absorption." },
        { segment: "Arms", action: "Diagonal arm-pumps counter-balancing the diagonal leg slides." },
        { segment: "Ankles", action: "Robust lateral stabilization preventing foot rollover on impact." }
      ]
    },
    cameraStyle: {
      angle: "Front-angled 3/4 side camera showcasing horizontal and lateral speed bounds.",
      lighting: "Swirling cyan velocity tracks tracing side-to-side displacement length.",
      background: "Achromatic dark matte layout."
    }
  },
  {
    id: "box_jumps",
    name: "Box Jumps",
    category: "CARDIO",
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Calves", "Hamstrings"],
    description: {
      start: "Standing facing a high wooden box structure, hip-width stance, shoulders packed down.",
      movement: "Half squat down, then explode vertically and forward to land dynamically on top of the box.",
      end: "Stand tall on the box to lock hips, then step or hop down carefully backward to start stance.",
      loop: "Continuous 3.2-second plyometric jumping cycle: ready stance (0s) -> jump taking off (0.8s) -> box land tall (1.6s) -> jump back down (2.4s) -> start (3.2s)."
    },
    malePrompt: "Athletic male performing Box Jumps, correct form, side angle, dark background, neon highlights on Quadriceps, Gluteus Maximus, Calves, and Hamstrings, smooth looping animation, clean minimal fitness app style",
    femalePrompt: "Athletic female performing Box Jumps, correct form, side angle, dark background, neon highlights on Quadriceps, Gluteus Maximus, Calves, and Hamstrings, smooth looping animation, clean minimal fitness app style",
    lottieBreakdown: {
      duration: 3.2,
      keyframes: [
        { frame: "Frame 0 (Start)", description: "Standing vertically tall facing the box. Hips quiet, arms straight." },
        { frame: "Frame 24", description: "Takeoff leap apex. Mid-air flexion of hip joints, lifting feet towards chest." },
        { frame: "Frame 51", description: "Soft touchdown on wood platform. Knees flexed to absorb landing, standing." },
        { frame: "Frame 102 (End)", description: "Step back down completed, landing on carpet to reset standing tall." }
      ],
      bodySegments: [
        { segment: "Hips/Knees", action: "Explosive triple extension followed by rapid knee flexion to clear box edge." },
        { segment: "Footing", action: "Flat foot absorption on top of box deck; ball-of-foot landing on ground reset." },
        { segment: "Trunk", action: "Bends forward 30-degrees on landing, stabilizing pelvis coordinates." }
      ]
    },
    cameraStyle: {
      angle: "Side profile orthographic perspective detailing box landing height and thigh levels.",
      lighting: "Vivid golden tracks illustrating takeoff trajectory curves.",
      background: "Technical black testing room with box guidelines."
    }
  }
];
