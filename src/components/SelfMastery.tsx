import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { 
  ShieldCheck, 
  Flame, 
  Zap, 
  Clock, 
  Heart, 
  Compass, 
  Award, 
  Info, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  Dumbbell, 
  Activity,
  Play, 
  Pause, 
  RotateCcw,
  Plus,
  Moon,
  TrendingUp,
  X,
  PlusCircle,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface SelfMasteryProps {
  onAddXp: (amount: number) => void;
  triggerToast: (message: string, type?: string) => void;
  hasWorkoutLoggedToday: boolean;
  waterIntakeLiters: number;
}

const RESPECT_MESSAGES = [
  "Strong men protect, they do not harm. Discipline is the foundation of character.",
  "Self-control is strength. Right thought is mastery. Calmness is power.",
  "Dopamine balance is the secret key to sustained ambition, memory, and cognitive focus.",
  "Discipline builds respect. Control your mind, control your destiny.",
  "True success isn't conquering others. It is dominating your own base impulses.",
  "A quiet mind can tolerate delay and friction. Protect your attention from mindless scrolling.",
  "Character is how you treat those who can do absolutely nothing for you."
];

const ALTERNATIVES = [
  { title: "Physical Training", desc: "Do a quick 5-min core burner or 20 pushups.", actionName: "Open Male Plans", category: "workout" },
  { title: "Skill Acquisition", desc: "Spend 10 minutes reading a book chapter or coding tutorial.", actionName: "Read Alternative", category: "reading" },
  { title: "Mind Reset Breathing", desc: "Engage in 2 minutes of calming box-breathing to normalize dopamine.", actionName: "Calibrate Breath", category: "mindfulness" },
  { title: "Somatic Journaling", desc: "Write down exactly what triggered the impulse and release it.", actionName: "Log Trigger", category: "journal" }
];

export default function SelfMastery({ onAddXp, triggerToast, hasWorkoutLoggedToday, waterIntakeLiters }: SelfMasteryProps) {
  const today = new Date().toLocaleDateString('en-CA');
  
  // Rotating Respect Message
  const [msgIndex, setMsgIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % RESPECT_MESSAGES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // STATE & OFF-GRID LOCALSTORAGE
  const [detoxStreak, setDetoxStreak] = useState<number>(() => {
    return Number(localStorage.getItem('sm_detox_streak') || '0');
  });
  const [detoxAnswerToday, setDetoxAnswerToday] = useState<'yes' | 'no' | null>(() => {
    return (localStorage.getItem(`sm_detox_answer_${today}`) as any) || null;
  });
  
  const [disciplineTasks, setDisciplineTasks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`sm_tasks_${today}`);
    if (saved) return JSON.parse(saved);
    return {
      avoidHarmful: false,
      workout: false,
      water: false,
      focusTask: false
    };
  });

  const [distractionsLogged, setDistractionsLogged] = useState<number>(() => {
    return Number(localStorage.getItem(`sm_distractions_${today}`) || '0');
  });

  const [dopamineScore, setDopamineScore] = useState<number>(75); // computed below dynamically

  // Purpose Driven Weekly Challenges
  const [weeklyChallenges, setWeeklyChallenges] = useState(() => {
    const defaultChallenges = [
      { id: 'wc1', name: "7 Days Self-Control Challenge", desc: "Decline destructive content & log 4 daily masteries in a row.", progress: 0, target: 4, xp: 100, claimed: false },
      { id: 'wc2', name: "Mind Over Machine Week", desc: "Maintain Dopamine Focus rating above 80% for 3 full check-ins.", progress: 0, target: 3, xp: 150, claimed: false },
      { id: 'wc3', name: "Somatic Endurance", desc: "Run Pomodoro Focus sessions for 60 cumulative minutes.", progress: 0, target: 60, xp: 120, claimed: false }
    ];
    const saved = localStorage.getItem('sm_weekly_challenges');
    return saved ? JSON.parse(saved) : defaultChallenges;
  });

  // Somatic Timer States (Pomodoro-style)
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDurationPreset, setTimerDurationPreset] = useState(25); // 5, 15, 25
  const timerRef = useRef<any>(null);

  // Breathing Visualizer States
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'HoldOut'>('Inhale');
  const [breathCounter, setBreathCounter] = useState(4);
  const [breathingActive, setBreathingActive] = useState(false);
  const breathingTimerRef = useRef<any>(null);

  // Custom Habit Alternatives trigger modal
  const [activeAlternativeModal, setActiveAlternativeModal] = useState<string | null>(null);
  const [journalNote, setJournalNote] = useState('');
  const [somaticImpulseTriggered, setSomaticImpulseTriggered] = useState(false);

  // SYNC SYSTEM STATS IN REALTIME
  useEffect(() => {
    setDisciplineTasks(prev => {
      const updated = {
        ...prev,
        workout: hasWorkoutLoggedToday,
        water: waterIntakeLiters >= 3.0
      };
      localStorage.setItem(`sm_tasks_${today}`, JSON.stringify(updated));
      return updated;
    });
  }, [hasWorkoutLoggedToday, waterIntakeLiters, today]);

  // Compute Dopamine Focus rating in realtime
  useEffect(() => {
    let score = 50; // default baseline
    
    // Add points for completing discipline checklists
    if (disciplineTasks.avoidHarmful) score += 20;
    if (disciplineTasks.workout) score += 15;
    if (disciplineTasks.water) score += 10;
    if (disciplineTasks.focusTask) score += 15;
    
    // Streak multipliers
    score += Math.min(15, detoxStreak * 2);

    // Soft penalization for distractions
    score -= Math.max(0, distractionsLogged * 12);

    // Bound between 5 and 100%
    const finalScore = Math.max(5, Math.min(100, score));
    setDopamineScore(finalScore);
    localStorage.setItem(`sm_dopamine_index_${today}`, String(finalScore));
  }, [disciplineTasks, detoxStreak, distractionsLogged, today]);

  // Handle Daily Detox Checkins
  const handleDetoxCheckIn = (choice: 'yes' | 'no') => {
    setDetoxAnswerToday(choice);
    localStorage.setItem(`sm_detox_answer_${today}`, choice);

    const oldStreak = detoxStreak;

    if (choice === 'yes') {
      const newStreak = oldStreak + 1;
      setDetoxStreak(newStreak);
      localStorage.setItem('sm_detox_streak', String(newStreak));
      
      // Update Daily Tasks check
      const updatedTasks = { ...disciplineTasks, avoidHarmful: true };
      setDisciplineTasks(updatedTasks);
      localStorage.setItem(`sm_tasks_${today}`, JSON.stringify(updatedTasks));

      // Propagate progress to weekly challenge 1
      setWeeklyChallenges(prev => {
        const next = prev.map(c => {
          if (c.id === 'wc1') {
            const newProgress = Math.min(c.target, c.progress + 1);
            return { ...c, progress: newProgress };
          }
          if (c.id === 'wc2' && dopamineScore >= 80) {
            const newProgress = Math.min(c.target, c.progress + 1);
            return { ...c, progress: newProgress };
          }
          return c;
        });
        localStorage.setItem('sm_weekly_challenges', JSON.stringify(next));
        return next;
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#047857', '#10b981', '#34d399']
      });
      triggerToast("🔥 Self-Control Streak Maintained! Dopamine receptors healing.", "success");
      onAddXp(25); // reward discipline
    } else {
      // Avoid blaming! Just reset streak and offer encouraging training support alternative
      setDetoxStreak(0);
      localStorage.setItem('sm_detox_streak', '0');
      
      const updatedTasks = { ...disciplineTasks, avoidHarmful: false };
      setDisciplineTasks(updatedTasks);
      localStorage.setItem(`sm_tasks_${today}`, JSON.stringify(updatedTasks));

      setSomaticImpulseTriggered(true);
      triggerToast("💪 It's okay. Discipline is built in moments of friction. Reset and start stronger today!", "warning");
    }
  };

  // Log distraction event
  const handleLogDistraction = () => {
    const updated = distractionsLogged + 1;
    setDistractionsLogged(updated);
    localStorage.setItem(`sm_distractions_${today}`, String(updated));
    triggerToast("⚡ Distraction logged. Take a deep breath to reclaim your focus. Refuse secondary impulses.", "info");
  };

  const handleClaimWeeklyChallenge = (id: string, xpReward: number) => {
    setWeeklyChallenges(prev => {
      const next = prev.map(c => c.id === id ? { ...c, claimed: true } : c);
      localStorage.setItem('sm_weekly_challenges', JSON.stringify(next));
      return next;
    });
    onAddXp(xpReward);
    confetti({
      particleCount: 150,
      spread: 100,
      colors: ['#3b82f6', '#fbbf24', '#f59e0b']
    });
    triggerToast(`🏆 Challenge Mastered! You received +${xpReward} XP for consistent discipline!`, "success");
  };

  // Re-start weekly cycles
  const handleResetChallengeCycle = () => {
    const resetList = weeklyChallenges.map(c => ({ ...c, progress: 0, claimed: false }));
    setWeeklyChallenges(resetList);
    localStorage.setItem('sm_weekly_challenges', JSON.stringify(resetList));
    triggerToast("⚔️ Weekly Combat Self-Control cycle restarted.", "success");
  };

  // POMODORO FOCUS TIMER LOOP
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            // Completed Pomodoro session
            setTimerActive(false);
            clearInterval(timerRef.current);
            triggerToast("🎉 Focus Block Complete! High level discipline demonstrated. Recovers dopamine baseline.", "success");
            onAddXp(35);
            
            // Log under current tasks
            setDisciplineTasks(prev => {
              const updated = { ...prev, focusTask: true };
              localStorage.setItem(`sm_tasks_${today}`, JSON.stringify(updated));
              return updated;
            });

            // Increment wc3 progress
            setWeeklyChallenges(prev => {
              const next = prev.map(c => {
                if (c.id === 'wc3') {
                  const newProgress = Math.min(c.target, c.progress + timerDurationPreset);
                  return { ...c, progress: newProgress };
                }
                return c;
              });
              localStorage.setItem('sm_weekly_challenges', JSON.stringify(next));
              return next;
            });

            // Reset
            setTimerMinutes(timerDurationPreset);
            setTimerSeconds(0);
          } else {
            setTimerMinutes(prev => prev - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(prev => prev - 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timerSeconds, timerMinutes, timerDurationPreset, today]);

  // Set preset for Timer
  const handleSetTimerPreset = (mins: number) => {
    setTimerActive(false);
    setTimerDurationPreset(mins);
    setTimerMinutes(mins);
    setTimerSeconds(0);
  };

  // Visual breathing simulator effect
  useEffect(() => {
    if (breathingActive) {
      breathingTimerRef.current = setInterval(() => {
        setBreathCounter(prev => {
          if (prev <= 1) {
            setBreathingPhase(curr => {
              if (curr === 'Inhale') return 'Hold';
              if (curr === 'Hold') return 'Exhale';
              if (curr === 'Exhale') return 'HoldOut';
              return 'Inhale';
            });
            return 4; // Reset to 4-seconds Box technique
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    }
    return () => {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, [breathingActive]);

  const handleToggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
      setBreathCounter(4);
      setBreathingPhase('Inhale');
    } else {
      setBreathingActive(true);
      setBreathCounter(4);
      setBreathingPhase('Inhale');
      triggerToast("🧘 Box-breathing active. Focus entirely on the timing loop to lower cortisol.", "info");
    }
  };

  // Alternatives triggering Somatic exercises
  const executeAlternativeAction = (act: string, cat: string) => {
    if (cat === 'mindfulness') {
      // Auto-trigger box-breathing visualizer and scroll into view or activate
      setBreathingActive(true);
      setBreathCounter(4);
      setBreathingPhase('Inhale');
      triggerToast("🧘 Re-centered: Commencing Somatic Calibrator box-breathing.", "success");
    } else {
      triggerToast(`🍀 Alternative selected: ${act}. Keep dominating!`, "success");
    }
    setActiveAlternativeModal(null);
  };

  // Handle manual journal logging of somatic urges
  const handleSaveUrgeLog = () => {
    if (!journalNote.trim()) return;
    const urgeListKey = `sm_urge_logs_${today}`;
    const stored = localStorage.getItem(urgeListKey);
    const urgeArray = stored ? JSON.parse(stored) : [];
    urgeArray.push({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: journalNote.trim()
    });
    localStorage.setItem(urgeListKey, JSON.stringify(urgeArray));
    setJournalNote('');
    setSomaticImpulseTriggered(false);
    triggerToast("🛡️ Log registered cleanly. Your awareness weakens the impulse. Stand firm!", "success");
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Dynamic Awareness Header */}
      <div className="relative overflow-hidden glass-card p-6 bg-gradient-to-r from-[var(--card)] to-black border-l-4 border-[var(--accent)] rounded-[2.2rem]">
        <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-2xl flex items-center justify-center shadow-lg animate-pulse shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
              Self-Mastery Sanctuary <span className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] px-2.5 py-1 rounded-full border border-[var(--accent)]/20 tracking-widest font-black uppercase">DISCIPLINE RATING DEPLOYED</span>
            </h2>
            <div className="h-6 overflow-hidden mt-1 relative">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={msgIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-xs text-[var(--muted)] truncate font-semibold uppercase tracking-wider"
                >
                  " {RESPECT_MESSAGES[msgIndex]} "
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* CORE GRID: DIGITAL DETOX & DOPAMINE BALANCER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Digital Detox Tracker */}
        <div className="lg:col-span-4 bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-505/10 bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Flame size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-white tracking-widest">Digital Detox Guard</h3>
                  <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-wider">Harmful Content & Addiction Shield</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400 flex items-center justify-end gap-1">
                  🔥 {detoxStreak}
                </div>
                <div className="text-[8px] font-black uppercase text-[var(--muted)] tracking-wider">Day Streak</div>
              </div>
            </div>

            <p className="text-xs text-white/90 leading-relaxed font-semibold">
              Reducing excessive exposure to high-dopamine harmful visual content is crucial to reset neural path mechanisms and boost physical recovery.
            </p>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center space-y-3 pt-5">
              <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Daily Verification: Avoided Harmful/Toxic Media Today?</h4>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleDetoxCheckIn('yes')}
                  className={cn(
                    "flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all cursor-pointer",
                    detoxAnswerToday === 'yes'
                      ? "bg-emerald-500 text-black font-black border-emerald-500 shadow-lg shadow-emerald-500/20"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  )}
                  disabled={detoxAnswerToday !== null}
                >
                  ✓ Yes, Clear Mind
                </button>
                <button
                  onClick={() => handleDetoxCheckIn('no')}
                  className={cn(
                    "flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all cursor-pointer",
                    detoxAnswerToday === 'no'
                      ? "bg-red-500 text-white font-black border-red-500 shadow-lg shadow-red-500/20"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  )}
                  disabled={detoxAnswerToday !== null}
                >
                  No, I slipped
                </button>
              </div>

              {detoxAnswerToday === 'no' && (
                <div className="text-[10px] text-red-300 font-semibold italic mt-2">
                  "It's okay. Restart stronger today. Accept the slip-up, don't self-criticize, and reset." 💪
                </div>
              )}
              {detoxAnswerToday === 'yes' && (
                <div className="text-[10px] text-emerald-400 font-black uppercase tracking-wider mt-2">
                  ✓ Verified cleanly. 25 XP and Dopamine index protected!
                </div>
              )}
              {detoxAnswerToday === null && (
                <div className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest">
                  ⏱ Logging resets at midnight local timezone.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] mt-4">
            <button
              onClick={() => { setSomaticImpulseTriggered(true); }}
              className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              ⚠️ Experiencing Somatic Urges or Triggers? Click Here
            </button>
          </div>
        </div>

        {/* Center-Right Col: Dopamine Balance System Meter & Checklist */}
        <div className="lg:col-span-8 bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <Zap size={20} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-white tracking-tight">Dopamine Focus level</h3>
                <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-wider">Neuro-chemical Focus Efficiency Rating</p>
              </div>
            </div>

            {/* Premium Meter Circle Value */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 py-1.5 px-3.5 rounded-full">
              <span className="text-xs font-bold uppercase tracking-wider text-white">Focus Level:</span>
              <span className="text-sm font-black text-[var(--accent)]">{dopamineScore}%</span>
            </div>
          </div>

          {/* Dopamine Meter Visualizer Grid */}
          <div className="space-y-2">
            <div className="h-4 bg-white/5 p-0.5 rounded-full overflow-hidden border border-white/5 relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-[var(--accent)] rounded-full shadow-[0_0_15px_var(--accent-glow)]"
                style={{ width: `${dopamineScore}%` }}
                animate={{ width: `${dopamineScore}%` }}
                transition={{ duration: 0.8 }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-3 text-[8px] font-black text-white/50 uppercase tracking-widest pointer-events-none">
                <span>Depleted</span>
                <span>Calibrated Peak Focus</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest">
              <span>⚠️ Logs of distractions deplete charge</span>
              <span>✓ Workout + hydration check boosts balance</span>
            </div>
          </div>

          {/* Core Daily Self-Mastery Tasks checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--sub)]/30 border border-[var(--border)] rounded-2xl space-y-3.5">
              <h4 className="text-[11px] font-black uppercase text-white tracking-wider">Discipline Checklist</h4>
              
              <div className="space-y-2.5">
                {/* Task 1 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <span className="text-xs font-bold text-white/90">Avoid Harmful Content</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-1 rounded",
                    disciplineTasks.avoidHarmful ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-white/50"
                  )}>
                    {disciplineTasks.avoidHarmful ? "✓ DONE" : "PENDING"}
                  </span>
                </div>

                {/* Task 2 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <span className="text-xs font-bold text-white/90">Complete Workout</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-1 rounded",
                    disciplineTasks.workout ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-white/50"
                  )}>
                    {disciplineTasks.workout ? "✓ DONE" : "GOTO PLANS"}
                  </span>
                </div>

                {/* Task 3 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <span className="text-xs font-bold text-white/90">Drink 3-4L Hydration</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-1 rounded",
                    disciplineTasks.water ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-white/50"
                  )}>
                    {disciplineTasks.water ? "✓ DONE" : "GOTO WATER"}
                  </span>
                </div>

                {/* Task 4 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <span className="text-xs font-bold text-white/90">Deep Focus (1 hour)</span>
                  <button
                    onClick={() => {
                      if (!disciplineTasks.focusTask) {
                        const updated = { ...disciplineTasks, focusTask: true };
                        setDisciplineTasks(updated);
                        localStorage.setItem(`sm_tasks_${today}`, JSON.stringify(updated));
                        triggerToast("🔥 Focus challenge registered. Re-balancing system.", "success");
                        onAddXp(15);
                      }
                    }}
                    className={cn(
                      "text-[9px] font-black uppercase px-2.5 py-1 rounded cursor-pointer",
                      disciplineTasks.focusTask ? "bg-emerald-500/10 text-emerald-400 cursor-default" : "bg-indigo-500 hover:bg-indigo-600 text-white shadow"
                    )}
                  >
                    {disciplineTasks.focusTask ? "✓ DONE" : "+ CLAIM"}
                  </button>
                </div>
              </div>
            </div>

            {/* Log distracting events card */}
            <div className="p-4 bg-gradient-to-tr from-amber-500/5 to-transparent border border-[var(--border)] rounded-2xl space-y-3.5 flex flex-col justify-between">
              <div>
                <h4 className="text-[11px] font-black uppercase text-amber-400 tracking-wider">Log Distractions Softly</h4>
                <p className="text-[10px] text-[var(--muted)] leading-relaxed mt-1">
                  Did you succumb to mindless scrolling, infinite tabs, or games? Logging distraction trains awareness and resets Dopamine scores softly.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-xl">
                  <span className="font-bold text-white">Daily Slip count:</span>
                  <span className="text-sm font-black text-amber-400">{distractionsLogged} times</span>
                </div>

                <button
                  onClick={handleLogDistraction}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 font-display font-black text-[9px] uppercase tracking-widest text-black rounded-xl active:scale-95 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  Log Slip-up / Distraction ⚡
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MID SECTION: SOMATIC SELF-CONTROL TRAINING COMPANION (TIMER & BREATHING) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Breathing Box Visualizer Calibrator */}
        <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-8 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                <Compass size={20} className={cn(breathingActive && "animate-spin")} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-white tracking-tight">Box-Breathing Calibrator</h3>
                <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-wider">4-4-4 Somatic autonomic nervous check</p>
              </div>
            </div>

            <p className="text-xs text-white/90 leading-relaxed font-semibold">
              Deep box-breathing drops cardiac cortisol levels and instantly calms extreme chemical urges to check notifications, scrolling pages, or unhealthy media.
            </p>

            {/* Realistic Breathing Stage Circle */}
            <div className="flex items-center justify-center p-6 h-56 relative border border-white/5 rounded-2xl bg-[#030303]">
              
              <AnimatePresence>
                {breathingActive ? (
                  <motion.div 
                    animate={{
                      scale: breathingPhase === 'Inhale' 
                        ? [1, 1.7] 
                        : breathingPhase === 'Hold' 
                          ? 1.7 
                          : breathingPhase === 'Exhale' 
                            ? [1.7, 1] 
                            : 1
                    }}
                    transition={{
                      duration: 4,
                      ease: "easeInOut",
                      repeat: Infinity
                    }}
                    className={cn(
                      "w-24 h-24 rounded-full flex flex-col items-center justify-center font-display font-black text-xs uppercase tracking-widest text-white border-2 absolute transition-all",
                      breathingPhase === 'Inhale' && "bg-emerald-500/10 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]",
                      breathingPhase === 'Hold' && "bg-amber-500/10 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]",
                      breathingPhase === 'Exhale' && "bg-indigo-500/10 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.3)]",
                      breathingPhase === 'HoldOut' && "bg-red-500/10 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]",
                    )}
                  >
                    <div className="text-[14px] text-white font-black leading-none">{breathingPhase}</div>
                    <div className="text-[11px] opacity-70 mt-1">{breathCounter}s</div>
                  </motion.div>
                ) : (
                  <div className="text-center space-y-2">
                    <span className="text-3xl">🧘</span>
                    <h5 className="text-xs font-black text-white uppercase tracking-widest">Breathing Offline</h5>
                    <p className="text-[9px] text-[var(--muted)] max-w-xs uppercase tracking-wider">Tap start to cycle biological parameters</p>
                  </div>
                )}
              </AnimatePresence>

              {breathingActive && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-white/40 font-black uppercase tracking-widest animate-pulse">
                  🌬️ Focus on your core diaphragm
                </div>
              )}
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleToggleBreathing}
              className={cn(
                "w-full py-3.5 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2",
                breathingActive
                  ? "bg-red-500/20 border border-red-500/30 text-red-400"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
              )}
            >
              {breathingActive ? "⏹ Emergency Halt Breathing" : "▶ Start 4-Sec Box Breathing Calibrator"}
            </button>
          </div>
        </div>

        {/* Somatic Focus Timer card */}
        <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-8 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl flex items-center justify-center animate-pulse">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-white tracking-tight">Somatic Pomodoro Block</h3>
                <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-wider">Uninterrupted focus timer & chemical isolation</p>
              </div>
            </div>

            <p className="text-xs text-white/90 leading-relaxed font-semibold">
              Force 25 minutes of deep focus without screens, games, or distractions. Completing this block awards 35 XP and locks in discipline levels.
            </p>

            {/* Countdown Screen */}
            <div className="bg-[#030303] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center h-56 space-y-4">
              <div className="text-5xl font-mono font-black tracking-widest text-[#fbbf24] animate-pulse">
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </div>
              <div className="flex gap-2">
                {([5, 15, 25] as const).map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSetTimerPreset(mins)}
                    className={cn(
                      "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer",
                      timerDurationPreset === mins
                        ? "bg-amber-400 text-black font-black"
                        : "bg-white/5 text-[var(--muted)] hover:text-white hover:bg-white/10"
                    )}
                  >
                    {mins}m Check
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className={cn(
                "flex-2 py-3.5 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2",
                timerActive
                  ? "bg-red-500/15 border border-red-500/30 text-red-400"
                  : "bg-amber-400 hover:bg-amber-500 text-black shadow-lg shadow-amber-400/20 active:scale-95"
              )}
            >
              {timerActive ? <Pause size={14} /> : <Play size={14} />}
              {timerActive ? "Pause Block" : "Begin Focus Period"}
            </button>
            <button
              onClick={() => handleSetTimerPreset(timerDurationPreset)}
              className="px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Reset Timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ADDICTION REDUCTION: ALTERNATIVE SYSTEMS */}
      <div className="bg-[var(--card)] p-6 rounded-[2.5rem] border border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-400" />
            <h4 className="text-sm font-black uppercase tracking-tight text-white">Addiction Alternative Launcher</h4>
          </div>
          <p className="text-xs text-white/90 leading-relaxed font-semibold">
            When standard high-dopamine triggers manifest in your environment, instant behavior rerouting weakens the neural pathways. Commit to any healthy replacement below:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {ALTERNATIVES.map((alt) => (
              <div key={alt.title} className="p-4 bg-[var(--sub)]/40 border border-[var(--border)] rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-white">{alt.title}</h5>
                  <p className="text-[10px] text-[var(--muted)] leading-relaxed mt-1 font-semibold">{alt.desc}</p>
                </div>
                <button
                  onClick={() => { setActiveAlternativeModal(alt.category); }}
                  className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 hover:brightness-110 text-white font-display font-black text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                >
                  {alt.actionName} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PURPOSE-DRIVEN CHALLENGES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="tab-heading flex items-center gap-2">
            <Award size={16} className="text-[var(--accent)]" />
            Purpose Driven self Challenges
          </h3>
          <button
            onClick={handleResetChallengeCycle}
            className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-xl border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-all cursor-pointer"
          >
            Reset Chal Cycles
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {weeklyChallenges.map((chal: any) => {
            const pct = Math.min(100, Math.round((chal.progress / chal.target) * 100));
            const isFinished = chal.progress >= chal.target;
            return (
              <div key={chal.id} className="glass-card p-6 border-2 border-dashed border-[var(--border)] rounded-3xl relative overflow-hidden group flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-black uppercase tracking-tight text-white leading-tight pr-2">{chal.name}</span>
                    <span className="text-[9px] bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 px-2 py-0.5 rounded font-black tracking-widest uppercase shrink-0">
                      +{chal.xp} XP
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--muted)] leading-relaxed font-semibold">{chal.desc}</p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-[9px] font-black text-white/80 uppercase">
                    <span>Progress: {chal.progress}/{chal.target}</span>
                    <span className="text-[var(--accent)]">{pct}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                    <div className="h-full bg-[var(--accent)] transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>

                  <div className="pt-2">
                    {chal.claimed ? (
                      <span className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5">
                        ✓ Reward Claimed
                      </span>
                    ) : isFinished ? (
                      <button
                        onClick={() => handleClaimWeeklyChallenge(chal.id, chal.xp)}
                        className="w-full py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-display font-black text-[9px] uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                      >
                        Claim +{chal.xp} XP Bonus
                      </button>
                    ) : (
                      <span className="w-full py-2 bg-white/5 text-[var(--muted)] font-black text-[9px] uppercase tracking-widest rounded-xl flex items-center justify-center">
                        Locked (Verify More Days)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SOMATIC RESET & REFLECTION LOGGING DRAWER OVERLAYS */}
      <AnimatePresence>
        {somaticImpulseTriggered && (
          <div className="fixed inset-0 z-[650] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-gradient-to-b from-[var(--card)] to-black border-2 border-[var(--accent)] p-6 sm:p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛡️</span>
                  <h4 className="text-sm font-black uppercase text-white tracking-widest">Somatic Impulse Reflection Log</h4>
                </div>
                <button 
                  onClick={() => setSomaticImpulseTriggered(false)} 
                  className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--muted)] hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-white/90 leading-relaxed font-semibold">
                An urge lasts average 15 minutes. By writing about your somatic environmental triggers, you externalize and dilute them. No judgment. No shame. Just release.
              </p>

              <div className="space-y-3">
                <textarea
                  value={journalNote}
                  onChange={(ev) => setJournalNote(ev.target.value)}
                  placeholder="What triggered your urge? (e.g. scrolling late at night, exhaustion, feeling bored etc.) How does your breathing feel?"
                  rows={4}
                  className="w-full bg-[var(--card2)] border border-[var(--border)] rounded-2xl p-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)] transition-all leading-relaxed"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setSomaticImpulseTriggered(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-[800] text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveUrgeLog}
                    disabled={!journalNote.trim()}
                    className="flex-1 py-3 bg-[var(--accent)] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Log Reflection urge
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeAlternativeModal && (
          <div className="fixed inset-0 z-[650] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-[var(--card2)] border border-[var(--border)] p-6 rounded-[2rem] w-full max-w-sm text-center space-y-5"
            >
              <span className="text-4xl text-center block">🍀</span>
              <h4 className="text-sm font-black uppercase tracking-widest text-white">Rerouted Successfully!</h4>
              
              <p className="text-xs text-[var(--muted)] leading-relaxed uppercase tracking-wider font-semibold">
                By choosing alternative active actions instead of slips, you've strengthened self-determination.
              </p>

              <div className="bg-white/5 p-4 rounded-xl text-left text-xs space-y-1">
                <div className="font-bold text-white">Alternate system route:</div>
                <div className="text-[var(--muted)] font-semibold">Trigger processed. Neural pathways calibrated to constructive habits. Keep up-shifting.</div>
              </div>

              <button
                onClick={() => executeAlternativeAction("Complete", activeAlternativeModal)}
                className="w-full py-3 bg-[var(--accent)] text-white font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer"
              >
                Acknowledge & Commence
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
