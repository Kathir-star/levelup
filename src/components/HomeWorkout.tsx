import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { 
  Home, 
  Zap, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  CheckCircle2, 
  Flame,
  ChevronRight,
  Timer as TimerIcon,
  X,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Level = 'beginner' | 'intermediate' | 'advanced';
type Gender = 'male' | 'female';

interface HomeExercise {
  name: string;
  duration: number; // in seconds
}

const WORKOUT_PLANS: Record<Gender, Record<Level, HomeExercise[]>> = {
  male: {
    beginner: [
      { name: 'Jumping Jacks', duration: 60 },
      { name: 'Push-ups', duration: 60 },
      { name: 'Bodyweight Squats', duration: 60 },
      { name: 'Plank', duration: 60 },
      { name: 'Mountain Climbers ', duration: 60 },
    ],
    intermediate: [
      { name: 'Incline Push-ups', duration: 60 },
      { name: 'Lunges', duration: 60 },
      { name: 'Mountain Climbers', duration: 60 },
      { name: 'Plank Shoulder Taps', duration: 60 },
      { name: 'Plank', duration: 60 },
    ],
    advanced: [
      { name: 'Jumping Jacks', duration: 60 },
      { name: 'Burpees', duration: 60 },
      { name: 'inclint - Push-ups', duration: 60 },
      { name: 'Decline Push-ups', duration: 60 },
      { name: 'Jump Squats', duration: 60 },
      { name: 'High Knees', duration: 60 },
    ],
  },
  female: {
    beginner: [
      { name: 'Jumping Jacks', duration: 60 },
      { name: 'Knee Push-ups', duration: 60 },
      { name: 'Bodyweight Squats', duration: 60 },
      { name: 'Plank', duration: 60 },
      { name: 'Mountain Climbers ', duration: 60 },
    ],
    intermediate: [
      { name: 'Push-ups', duration: 60 },
      { name: 'Walking Lunges', duration: 60 },
      { name: 'Mountain Climbers', duration: 60 },
      { name: 'Bird Dog', duration: 60 },
    ],
    advanced: [
      { name: 'Burpees', duration: 60 },
      { name: 'Diamond Push-ups', duration: 60 },
      { name: 'Jump Squats', duration: 60 },
      { name: 'Plank Jacks', duration: 60 },
      { name: 'Plank', duration: 60 },
    ],
  },
};

const MOTIVATIONAL_TEXTS = [
  "Suffer now, smile later! 🌟",
  "Consistency is key! 🔑",
  "Pain is temporary! ⏳",
  "Make yourself proud! 🎖️",
  "No pain, no gain! 💥",
  "Reset, refocus, restart! 🔄",
  "Finish strong! 🏁",
  "Excuses don't burn calories! 🔥",
  "Do it for future you! 🔮",
  "Nothing can stop you! 🛡️",
  "Level up today! 🎮",
  "Break through the wall! 🧱",
  "Sweat today, shine tomorrow! ✨",
  "Better than yesterday! 📈",
  "Action cures fear! ⚡",
  "Leave it all on the floor! 🌪️",
  "Unleash your potential! 🔓",
  "Be your own hero! 🦸‍♂️",
  "Greatness takes time! ⏳",
  "You didn't come this far to fail! 🛑",

];

export default function HomeWorkout() {
  const [level, setLevel] = useState<Level>('beginner');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [motivation, setMotivation] = useState(MOTIVATIONAL_TEXTS[0]);

  // Use gender from context/props if needed, but for now we keep local state or sync with profile
  const [gender, setGender] = useState<Gender>('male');

  const timerRef = useRef<number | null>(null);
  const currentPlan = WORKOUT_PLANS[gender][level];

  // Sync gender with local storage or profile if needed
  useEffect(() => {
    const savedGender = document.documentElement.dataset.gender as Gender;
    if (savedGender && (savedGender === 'male' || savedGender === 'female')) {
      setGender(savedGender);
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isResting) {
        // End of rest, start next exercise
        setIsResting(false);
        setTimeLeft(60);
        setIsActive(true);
      } else {
        // End of exercise, start rest or finish
        if (currentExerciseIndex < currentPlan.length - 1) {
          setIsResting(true);
          setTimeLeft(15); // 15s rest
          setIsActive(true);
        } else {
          setIsActive(false);
          setIsComplete(true);
        }
      }
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, isResting, currentExerciseIndex]);

  // Motivation Rotator
  useEffect(() => {
    if (isSessionActive && !isComplete && !isResting) {
      const interval = window.setInterval(() => {
        setMotivation(MOTIVATIONAL_TEXTS[Math.floor(Math.random() * MOTIVATIONAL_TEXTS.length)]);
      }, 5000);
      return () => window.clearInterval(interval);
    }
  }, [isSessionActive, isComplete, isResting]);

  const startSession = () => {
    setCurrentExerciseIndex(0);
    setTimeLeft(currentPlan[0].duration);
    setIsSessionActive(true);
    setIsActive(true);
    setIsComplete(false);
    setIsResting(false);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const handleNext = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    
    if (isResting) {
      setIsResting(false);
      setTimeLeft(60);
      setIsActive(true);
    } else {
      if (currentExerciseIndex < currentPlan.length - 1) {
        const nextIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextIndex);
        setTimeLeft(currentPlan[nextIndex].duration);
        setIsActive(true);
        setIsResting(false);
      } else {
        setIsActive(false);
        setIsComplete(true);
      }
    }
  };

  const resetSession = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setCurrentExerciseIndex(0);
    setTimeLeft(currentPlan[0].duration);
    setIsActive(true);
    setIsComplete(false);
    setIsResting(false);
  };

  const exitSession = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setIsSessionActive(false);
    setIsActive(false);
    setIsComplete(false);
    setIsResting(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isSessionActive) {
    if (isComplete) {
      return (
        <div className="min-h-[600px] flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--card)] border-2 border-[var(--green)] rounded-3xl p-12 text-center shadow-[0_0_50px_rgba(29,185,84,0.2)] max-w-md w-full"
          >
            <div className="w-24 h-24 bg-[var(--green)] rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-[var(--green)]/20">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="font-display text-4xl text-white tracking-wider mb-4">Workout Complete 🎉</h2>
            <p className="text-[var(--muted)] mb-8">Fantastic job! You've successfully completed your {level} home session. Keep up the consistency!</p>
            <button 
              onClick={exitSession}
              className="w-full py-4 rounded-xl bg-[var(--green)] text-white font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg"
            >
              Back to Plans
            </button>
          </motion.div>
        </div>
      );
    }

    const currentExercise = currentPlan[currentExerciseIndex];

    return (
      <div className="min-h-[600px] flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
        {/* Left Side: Exercise List */}
        <div className="lg:w-1/3 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl text-white tracking-wider">Workout List</h3>
            <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">
              Exercise {currentExerciseIndex + 1} / {currentPlan.length}
            </span>
          </div>
          <div className="space-y-3">
            {currentPlan.map((ex, idx) => (
              <div 
                key={idx}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                  idx === currentExerciseIndex 
                    ? "bg-[var(--accent)]/10 border-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]" 
                    : idx < currentExerciseIndex 
                      ? "bg-[var(--sub)] border-[var(--border)] opacity-50" 
                      : "bg-[var(--card)] border-[var(--border)]"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    idx === currentExerciseIndex 
                      ? isResting ? "bg-[var(--blue)] text-white" : "bg-[var(--accent)] text-white" 
                      : "bg-[var(--sub)] text-[var(--muted)]"
                  )}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className={cn(
                      "font-bold text-sm uppercase tracking-tight",
                      idx === currentExerciseIndex ? "text-white" : "text-[var(--muted)]"
                    )}>
                      {ex.name}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">
                      {idx === currentExerciseIndex && isResting ? "RESTING..." : "1:00 Duration"}
                    </div>
                  </div>
                </div>
                {idx < currentExerciseIndex && <CheckCircle2 size={16} className="text-[var(--green)]" />}
                {idx === currentExerciseIndex && (
                  isResting 
                    ? <TimerIcon size={16} className="text-[var(--blue)] animate-spin-slow" /> 
                    : <Flame size={16} className="text-[var(--accent)] animate-pulse" />
                )}
              </div>
            ))}
          </div>
          
          <button 
            onClick={exitSession}
            className="w-full mt-8 py-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-[var(--muted)] text-[10px] font-black uppercase tracking-widest hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all flex items-center justify-center gap-2"
          >
            <X size={14} />
            Cancel Session
          </button>
        </div>

        {/* Right Side: Timer & Controls */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border)]">
            <motion.div 
              className="h-full bg-[var(--accent)]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentExerciseIndex + 1) / currentPlan.length) * 100}%` }}
            />
          </div>

          <div className="text-center space-y-2">
            <h2 className="font-display text-5xl text-[var(--accent)] tracking-widest uppercase animate-pulse">
              {isResting ? 'REST' : currentExercise.name}
            </h2>
            <div className="text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.3em]">
              {isResting ? 'Prepare for next exercise' : `${gender} • ${level}`}
            </div>
          </div>

          <div className="relative">
            <svg className="w-64 h-64 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="var(--border)"
                strokeWidth="4"
                fill="transparent"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke={isResting ? "var(--blue)" : "var(--accent)"}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={753.98}
                strokeDashoffset={753.98 - (timeLeft / (isResting ? 15 : 60)) * 753.98}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear filter drop-shadow-[0_0_15px_var(--accent-glow)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "font-display text-7xl tracking-tighter font-black",
                isResting ? "text-[var(--blue)]" : "text-white"
              )}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.4em] mt-2">
                {isResting ? 'Resting' : 'Time Remaining'}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={motivation}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-6 py-2 rounded-full"
            >
              <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest">{motivation}</span>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-8">
            <button 
              onClick={resetSession}
              className="p-5 rounded-full bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-lg text-[var(--muted)] hover:text-[var(--accent)]"
              title="Reset Workout"
            >
              <RotateCcw size={24} />
            </button>
            <button 
              onClick={toggleTimer}
              className="w-24 h-24 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-2xl shadow-[var(--accent-glow)] hover:scale-105 active:scale-95 transition-all"
            >
              {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={handleNext}
              className="p-5 rounded-full bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-lg text-[var(--muted)] hover:text-[var(--accent)]"
              title="Next Exercise"
            >
              <SkipForward size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-[#0d0000] to-[#1a0000] border border-[var(--accent)] rounded-3xl p-8 flex flex-wrap items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="w-24 h-24 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[var(--accent-glow)] relative z-10">
          <Home size={48} />
        </div>
        <div className="flex-1 min-w-[280px] relative z-10">
          <h2 className="text-4xl font-black text-white ml-[-2px] tracking-tight mb-2 uppercase">Workout Plan</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed max-w-lg italic font-bold">
            Professional bodyweight training designed for your level. No equipment needed. 
            Select your profile and start your transformation today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 space-y-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Select Gender</label>
                <div className="flex bg-[var(--sub)] rounded-2xl p-1.5 border border-[var(--border)]">
                  <button 
                    onClick={() => setGender('male')} 
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", 
                      gender === 'male' ? "bg-[var(--blue)] text-white shadow-lg shadow-[var(--blue)]/20" : "text-[var(--muted)] hover:text-white"
                    )}
                  >
                    ♂ Male
                  </button>
                  <button 
                    onClick={() => setGender('female')} 
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", 
                      gender === 'female' ? "bg-[#ff69b4] text-white shadow-lg shadow-[#ff69b4]/20" : "text-[var(--muted)] hover:text-white"
                    )}
                  >
                    ♀ Female
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Select Level</label>
                <div className="flex bg-[var(--sub)] rounded-2xl p-1.5 border border-[var(--border)]">
                  {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
                    <button 
                      key={l} 
                      onClick={() => setLevel(l)} 
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                        level === l ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]" : "text-[var(--muted)] hover:text-white"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={startSession}
                className="w-full py-6 rounded-2xl bg-[var(--accent)] text-white font-black text-2xl tracking-[0.2em] uppercase shadow-2xl shadow-[var(--accent-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
              >
                <Zap size={28} className="group-hover:animate-pulse" />
                Start Session
              </button>
            </div>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
            <h3 className="tab-heading text-white mb-6 flex items-center gap-3">
              <TimerIcon size={20} className="text-[var(--accent)]" />
              Workout Preview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WORKOUT_PLANS[gender][level].map((ex, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)] group hover:border-[var(--accent)]/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[var(--card)] flex items-center justify-center text-[var(--accent)] font-black text-sm border border-[var(--border)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-black text-sm uppercase tracking-tight text-white">{ex.name}</div>
                    <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">60 Seconds</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[var(--sub)] to-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
            <h3 className="tab-heading text-white mb-6 uppercase">Why Home Workout?</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] flex-shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Zero Equipment</div>
                  <p className="text-xs text-[var(--muted)] mt-1">Use your own bodyweight to build strength and endurance anywhere.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--blue)]/10 flex items-center justify-center text-[var(--blue)] flex-shrink-0">
                  <TimerIcon size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Time Efficient</div>
                  <p className="text-xs text-[var(--muted)] mt-1">High-intensity sessions designed to give maximum results in minimum time.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--yellow)]/10 flex items-center justify-center text-[var(--yellow)] flex-shrink-0">
                  <Trophy size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Progressive</div>
                  <p className="text-xs text-[var(--muted)] mt-1">Plans that evolve with you, from absolute beginner to elite athlete.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--accent)] rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <h4 className="tab-heading text-white text-xl mb-2 uppercase">Ready to LevelUp?</h4>
            <p className="text-white/80 text-xs leading-relaxed mb-6 font-bold uppercase tracking-widest italic">Consistency is the only secret to results. Start your first session now and feel the difference.</p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
              Join 10,000+ Champions <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
