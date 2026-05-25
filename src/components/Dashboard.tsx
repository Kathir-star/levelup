import { useState, useEffect, useMemo } from 'react';
import DailyMotivation from './wellness/DailyMotivation';
import MoodTracker from './wellness/MoodTracker';
import BreathingExercise from './wellness/BreathingExercise';
import WaterTracker from './WaterTracker';
import SleepTracker from './SleepTracker';
import { WorkoutEntry, UserProfile, DailyMission } from '../types';
import { cn } from '../lib/utils';
import { 
  ChevronLeft, ChevronRight, TrendingUp, Activity, Footprints, Droplets, Zap, Target, 
  CheckCircle2, Share2, Copy, Sparkles, Check, Brain, Wind, Play, Shield, Award,
  Github, Linkedin, Instagram, Code
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import canvasConfetti from 'canvas-confetti';

interface DashboardProps {
  data: Record<string, WorkoutEntry[]>;
  profile: UserProfile;
  steps: Record<string, number>;
  water: number;
  waterGoal: number;
  missions: DailyMission[];
  completeMission: (id: string, text: string, xpReward: number) => void;
  setActiveTab?: (tab: string) => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const RESPECT_MESSAGES = [
  "Strong men protect, they do not harm. Discipline is the foundation of character. 💪",
  "Self-control is strength. Right thought is mastery. Calmness is power. 🛡️",
  "Dopamine balance is the secret key to sustained ambition, memory, and cognitive focus. 🧠",
  "Discipline builds respect. Control your mind, control your life. ⚡",
  "True success isn't conquering others. It is dominating your own base impulses. 🧘",
  "A quiet mind can tolerate delay and friction. Protect your attention from mindless scrolling. 📱",
  "Character is how you treat those who can do absolutely nothing for you. ✨"
];

interface DailyActivity {
  dayName: string;
  dateStr: string;
  muscles: string[];
  stepsCount: number;
  caloriesBurned: number;
  exercisesCount: number;
}

const sectionTitleCls = "text-3xl sm:text-4xl font-display font-black tracking-widest text-white uppercase italic leading-tight";
const subTitleCls = "text-xs sm:text-sm font-bold text-neutral-400 font-mono tracking-widest leading-relaxed";
const taglineCls = "text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed tracking-wide italic";
const cardTitleCls = "text-2xl font-display font-black text-white tracking-widest uppercase italic leading-snug group-hover:text-blue-400 transition-colors duration-300";
const cardBodyCls = "text-xs sm:text-sm text-neutral-400 leading-relaxed sm:leading-loose tracking-wide font-medium";

export default function Dashboard({ 
  data, 
  profile, 
  steps, 
  water, 
  waterGoal, 
  missions, 
  completeMission, 
  setActiveTab 
}: DashboardProps) {
  const [calOffset, setCalOffset] = useState(0);
  const [calories, setCalories] = useState(0);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [xp, setXp] = useState(0);
  
  // Weekly Performance Export Feature
  const [exportPreset, setExportPreset] = useState<'beast' | 'standard' | 'aesthetic'>('standard');
  const [isCopied, setIsCopied] = useState(false);

  // 🧘 Reset Mind / Focus States
  const [showResetMind, setShowResetMind] = useState(false);
  const [resetPhase, setResetPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [resetTimer, setResetTimer] = useState(4);
  const [resetCycles, setResetCycles] = useState(0);
  
  // Custom screen notifications
  const [innerNotification, setInnerNotification] = useState<string | null>(null);

  // Retrieve current XP from localStorage
  useEffect(() => {
    const savedXp = localStorage.getItem('user-xp');
    if (savedXp) setXp(parseInt(savedXp));
    
    const handleStorage = () => {
      const updatedXp = localStorage.getItem('user-xp');
      if (updatedXp) setXp(parseInt(updatedXp));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const progressToNextLevel = (xpInLevel / 100) * 100;

  const today = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  // Dynamic Smart Insights Calculation
  const smartInsights = useMemo(() => {
    const todayObj = new Date();
    let currentWeekVolume = 0;
    let prevWeekVolume = 0;
    
    let currentWeekCount = 0;
    let prevWeekCount = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(todayObj);
      d.setDate(todayObj.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const entries = data[dateStr] || [];
      if (entries.length > 0) {
        currentWeekCount++;
      }
      entries.forEach(e => {
        currentWeekVolume += (e.weight || 1) * (e.reps || 1) * (e.sets || 1);
      });
    }

    for (let i = 8; i < 15; i++) {
      const d = new Date(todayObj);
      d.setDate(todayObj.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const entries = data[dateStr] || [];
      if (entries.length > 0) {
        prevWeekCount++;
      }
      entries.forEach(e => {
        prevWeekVolume += (e.weight || 1) * (e.reps || 1) * (e.sets || 1);
      });
    }

    let progressPct = 0;
    if (prevWeekVolume > 0) {
      progressPct = Math.round(((currentWeekVolume - prevWeekVolume) / prevWeekVolume) * 100);
    } else if (currentWeekVolume > 0) {
      progressPct = 12; // Realistic baseline if starting fresh
    }

    const targetWorkouts = 4;
    const missedWorkouts = Math.max(0, targetWorkouts - currentWeekCount);
    const consistencyAdvice = currentWeekCount >= 4 ? "Great consistency!" : "Physical adaptation underway!";

    return {
      progressPct,
      missedWorkouts,
      consistencyAdvice,
      currentWeekCount,
      isOvertraining: currentWeekCount >= 5
    };
  }, [data]);

  // Dynamic day suggested slit split
  const recommendedSplit = useMemo(() => {
    const day = new Date().getDay();
    switch(day) {
      case 0: return { label: "REST & RECOVERY SPLIT", desc: "Prioritize sleep & cellular rebuilding." };
      case 1: return { label: "MONDAY CHEST & TRICEPS", desc: "High fuel push split. Blast chest volume!" };
      case 2: return { label: "BACK & PULL INTENSITY", desc: "Scale lats, rows, and arm thickness." };
      case 3: return { label: "SAVAGE LEG BONUS DAY", desc: "Leg Day Bonus: +100 XP active today!" };
      case 4: return { label: "SHOULDERS & DELTOIDS", desc: "Refine joint symmetry and anterior posture." };
      case 5: return { label: "METABOLIC POWER SPLIT", desc: "Core, high intensity, and cardio drills." };
      default: return { label: "SQUAT & POSTURE MASTER", desc: "Heavy squats, deep lunges, zero excuses." };
    }
  }, []);

  // 🧘 Reset Mind Sound & Timing Loop
  useEffect(() => {
    let interval: number | undefined;
    if (showResetMind) {
      interval = window.setInterval(() => {
        setResetTimer(prev => {
          if (prev <= 1) {
            setResetPhase(curr => {
              if (curr === 'Inhale') return 'Hold';
              if (curr === 'Hold') return 'Exhale';
              if (curr === 'Exhale') return 'Pause';
              
              setResetCycles(v => v + 1);
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setResetPhase('Inhale');
      setResetTimer(4);
      setResetCycles(0);
    }
    return () => clearInterval(interval);
  }, [showResetMind]);

  // Completions logic for Reset Mind Box Breathing
  useEffect(() => {
    if (resetCycles >= 3 && showResetMind) {
      setShowResetMind(false);
      
      const currentXp = parseInt(localStorage.getItem('user-xp') || '0');
      const earnedXp = 25;
      localStorage.setItem('user-xp', String(currentXp + earnedXp));
      window.dispatchEvent(new Event('storage'));

      // Clean Web Audio context synthesizer sound feedback
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 string
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      } catch (e) {}

      // Ambient fireworks splash celebration
      canvasConfetti({
        particleCount: 150,
        spread: 80,
        colors: ['#3b82f6', '#10b981', '#ffffff']
      });

      setInnerNotification("🧠 Focus Calibrated! Core cortisol dropped, dopamine balance secured. Received +25 XP!");
      setTimeout(() => setInnerNotification(null), 5000);
    }
  }, [resetCycles, showResetMind]);

  // Resolve current workout type for dynamic quotes
  const currentWorkoutType = useMemo(() => {
    const entries = data[today] || [];
    if (entries.length === 0) return undefined;
    
    const lastMuscle = entries[entries.length - 1].muscle.toLowerCase();
    
    if (['legs', 'glutes', 'hamstrings', 'quadriceps'].includes(lastMuscle)) return 'legs';
    if (['chest', 'triceps', 'shoulder'].includes(lastMuscle)) return 'push';
    if (['back', 'biceps'].includes(lastMuscle)) return 'pull';
    return undefined;
  }, [data, today]);

  // Daily statistics calculation
  useEffect(() => {
    const entries = data[today] || [];
    let setsSum = 0;
    entries.forEach(e => setsSum += (e.sets || 1));
    const timeMins = setsSum * 3;
    setWorkoutTime(timeMins);

    const w = profile.weight || 70;
    const activeCals = timeMins * (w * 0.08);
    const stepCount = steps[today] || 0;
    const stepCals = stepCount * 0.04;
    setCalories(Math.round(activeCals + stepCals));
  }, [data, profile, steps, today]);

  // Recharts Trends Cache
  const chartData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      last7Days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        steps: steps[dateStr] || 0,
        workouts: data[dateStr] ? data[dateStr].length : 0,
        calories: Math.round((steps[dateStr] || 0) * 0.04 + (data[dateStr] ? data[dateStr].length * 15 * 5 : 0)),
      });
    }
    return last7Days;
  }, [data, steps]);

  const renderCalendar = () => {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth() + calOffset, 1);
    const y = base.getFullYear(), m = base.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`blank-${i}`} className="h-12" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(y, m, i).toLocaleDateString('en-CA');
      const done = !!data[d];
      const isT = d === today;
      const isFut = d > today;
      const setsCount = done ? data[d].length : 0;

      days.push(
        <div 
          key={d} 
          className={cn(
            "h-12 border border-[var(--border)] rounded-2xl flex flex-col items-center justify-center text-xs font-black relative transition-all group cursor-pointer",
            done && "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)] shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]",
            isT && "ring-2 ring-[var(--yellow)] ring-offset-2 ring-offset-black text-[var(--yellow)]",
            isFut && !done && "opacity-20",
            !done && !isT && !isFut && "hover:border-[var(--muted)]"
          )}
          title={done ? data[d].map(e => e.muscle).join(', ') : ''}
        >
          <div>{i}</div>
          {done && <div className="text-[8px] opacity-80 mt-1 font-bold">{setsCount}x</div>}
          {done && <div className="absolute top-1 right-1 text-[8px] animate-pulse">⚡</div>}
        </div>
      );
    }
    return days;
  };

  const loggedDays = useMemo(() => {
    return Object.keys(data).sort((a, b) => b.localeCompare(a)).slice(0, 10);
  }, [data]);

  // Social text aggregation
  const weeklyStatsText = useMemo(() => {
    const todayObj = new Date();
    let workoutsCount = 0;
    let totalSteps = 0;
    let totalCals = 0;
    let totalExercises = 0;
    const daysActivity: DailyActivity[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayObj);
      d.setDate(todayObj.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const entries = data[dateStr] || [];
      const musclesSet = new Set<string>();
      entries.forEach(e => {
        if (e.muscle) musclesSet.add(e.muscle);
      });
      const muscles = Array.from(musclesSet);
      const stepsCount = steps[dateStr] || 0;
      const caloriesBurned = Math.round(stepsCount * 0.04 + entries.length * 15 * 5);

      if (entries.length > 0) {
        workoutsCount++;
        totalExercises += entries.length;
      }
      totalSteps += stepsCount;
      totalCals += caloriesBurned;

      daysActivity.push({
        dayName,
        dateStr,
        muscles,
        stepsCount,
        caloriesBurned,
        exercisesCount: entries.length
      });
    }

    const consistencyPct = Math.round((workoutsCount / 7) * 100);
    const athleteName = profile.name || 'Champion';

    if (exportPreset === 'beast') {
      const breakdown = daysActivity
        .map(day => {
          if (day.muscles.length > 0) {
            return `• ${day.dayName}: ${day.muscles.join(', ')} (${day.exercisesCount} exercises logged) 🔥`;
          } else {
            return `• ${day.dayName}: Active Rest 🔋`;
          }
        })
        .join('\n');

      return `🔥 LEVELUP BEAST MODE WEEKLY STATS 🔥\n` +
        `Athlete: ${athleteName}\n` +
        `Workout Frequency: ${workoutsCount} / 7 days\n` +
        `Total Step Count: ${totalSteps.toLocaleString()} 👟\n` +
        `Est. Active Burn: ${totalCals.toLocaleString()} Kcal ⚡\n` +
        `Exercises Crushed: ${totalExercises} completed\n\n` +
        `Weekly Breakdown:\n${breakdown}\n\n` +
        `Consistency Core: ${consistencyPct}% Locked in. No excuses! ⚔️\n` +
        `#LevelUp #WeeklyPerformance #BeastMode #Discipline`;
    }

    if (exportPreset === 'aesthetic') {
      return `Weekly Grind Complete! ✅\n` +
        `• Active workout days: ${workoutsCount}\n` +
        `• Footsteps tracked: ${totalSteps.toLocaleString()} steps 💧\n` +
        `• Total kinetic calorie output: ${totalCals.toLocaleString()} kcal est.\n\n` +
        `"Self-control is strength. Right thought is mastery. Calmness is power."\n\n` +
        `#LevelUp #Mindfulness #HabitLoop #Wellness`;
    }

    const muscleListSet = new Set<string>();
    daysActivity.flatMap(day => day.muscles).forEach(m => {
      if (m) muscleListSet.add(m);
    });
    const muscleList = Array.from(muscleListSet);
    const musclesTrained = muscleList.length > 0 ? muscleList.join(', ') : 'Active Recovery';

    return `🚀 LEVELUP WEEKLY PERFORMANCE REPORT 🚀\n` +
      `Active Days: ${workoutsCount} / 7\n` +
      `Weekly Calorie Burn: ${totalCals.toLocaleString()} Kcal\n` +
      `Total Weekly Footsteps: ${totalSteps.toLocaleString()} steps\n` +
      `Focus Muscles: ${musclesTrained}\n\n` +
      `Consistency Rating: ${consistencyPct}% ✅ \n\n` +
      `Powered by LevelUp. Leveling up daily! 💪⚡\n` +
      `#LevelUp #FitnessStreak #WorkoutMotivation #Discipline`;
  }, [data, steps, profile.name, exportPreset]);

  // Dynamic values for Weekly combat checklist status
  const workoutsLast7Days = useMemo(() => {
    let count = 0;
    const todayObj = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(todayObj);
      d.setDate(todayObj.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      if (data[dateStr] && data[dateStr].length > 0) {
        count++;
      }
    }
    return count;
  }, [data]);

  const targetWorkouts = 4;
  const progressPct = Math.min(100, Math.round((workoutsLast7Days / targetWorkouts) * 100));
  const isCompleted = workoutsLast7Days >= targetWorkouts;
  
  const [isClaimed, setIsClaimed] = useState(false);
  useEffect(() => {
    const lastClaimed = localStorage.getItem('lv_weekly_challenge_claimed_ts');
    if (lastClaimed) {
      const diffMs = Date.now() - parseInt(lastClaimed);
      if (diffMs < 604800000) {
        setIsClaimed(true);
      }
    }
  }, []);

  const handleClaimWeeklyBonus = () => {
    if (!isCompleted || isClaimed) return;
    localStorage.setItem('lv_weekly_challenge_claimed_ts', String(Date.now()));
    setIsClaimed(true);
    const currentXp = parseInt(localStorage.getItem('user-xp') || '0');
    localStorage.setItem('user-xp', String(currentXp + 150));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ⚡ Tactical Command Core & Smart Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        
        {/* Quick Action Button Card */}
        <div className="glass-card p-4 sm:p-5 bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-md shadow-red-950/5">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all" />
          <div className="flex flex-col gap-2.5">
            <div className="w-9 h-9 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center shrink-0">
              <Play size={16} fill="currentColor" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest leading-none">{recommendedSplit.desc}</h4>
              <div className="text-lg font-display font-black tracking-tight text-white/95 mt-0.5 leading-tight">{recommendedSplit.label}</div>
            </div>
          </div>
          <button 
            onClick={() => {
              if (setActiveTab) {
                setActiveTab('sessions');
              }
            }}
            className="w-full mt-3 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-display font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-red-500/15"
          >
            ▶ Start Today's Split
          </button>
        </div>

        {/* Reset Mind Button Card */}
        <div className="glass-card p-4 sm:p-5 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-md shadow-blue-950/5">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
          <div className="flex flex-col gap-2.5">
            <div className="w-9 h-9 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
              <Wind size={16} />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest leading-none">Somatic Cortisol Reducer</h4>
              <div className="text-lg font-display font-black tracking-tight text-white/95 mt-0.5 leading-tight">Calm & Focus baseline</div>
            </div>
          </div>
          <button 
            onClick={() => setShowResetMind(true)}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-display font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-blue-500/15"
          >
            🧘 Reset Mind (Box Breathing)
          </button>
        </div>

        {/* Smart Insights Bento Column */}
        <div className="glass-card p-4 sm:p-5 bg-gradient-to-br from-amber-500/5 to-transparent border border-white/5 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-md">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 leading-none">
              <Sparkles size={13} className="text-amber-400 animate-pulse" />
              <h4 className="text-[10px] font-black text-white/90 uppercase tracking-widest">Coach Smart Insights</h4>
            </div>
            
            <div className="space-y-2 mt-0.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--muted)] font-black uppercase text-[10px]">Weekly Growth</span>
                <span className={cn(
                  "font-[950] text-[11px]",
                  smartInsights.progressPct >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {smartInsights.progressPct >= 0 ? "+" : ""}{smartInsights.progressPct}% this week
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--muted)] font-black uppercase text-[10px]">Workouts Tracker</span>
                <span className="text-white font-[950] text-[11px]">
                  {smartInsights.missedWorkouts === 0 ? "✓ Optimization" : `${smartInsights.missedWorkouts} missed`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--muted)] font-black uppercase text-[10px]">Coach Rating</span>
                <span className="text-yellow-400 font-[950] text-[10px] truncate max-w-[140px]">{smartInsights.consistencyAdvice}</span>
              </div>
            </div>
          </div>
          
          <div className="text-[8px] uppercase font-bold text-[var(--muted)] tracking-wider mt-3 pt-2.5 border-t border-white/[0.03]">
            {smartInsights.isOvertraining ? "⚠️ CNS ALERT: 5+ workout days. Rest required!" : "✓ CNS baseline within adaptive buffer."}
          </div>
        </div>

      </div>

      {/* Inline inner Notification Alert banner */}
      <AnimatePresence>
        {innerNotification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-3 bg-emerald-500/15 border border-emerald-500/35 rounded-2xl text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center justify-between gap-4 shadow-lg shadow-emerald-500/5"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{innerNotification}</span>
            </div>
            <button onClick={() => setInnerNotification(null)} className="text-emerald-300 hover:text-white pb-0.5">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP Progress Bar */}
      <div className="glass-card p-4 sm:p-5 bg-gradient-to-r from-[var(--card)] to-[var(--bg)] border-l-4 border-l-[var(--accent)] rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--red)] flex items-center justify-center text-white text-base font-black shadow-md shadow-[var(--accent)]/15 tracking-tighter">
              Lvl {level}
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-white leading-tight">Elite Performance</h2>
              <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-wider leading-none mt-0.5">{xp} Total XP Earned</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black italic text-[var(--accent)] leading-none">{100 - xpInLevel} XP</div>
            <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] mt-0.5">To Level {level + 1}</p>
          </div>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--red)] transition-all duration-1000 shadow-[0_0_10px_var(--accent-glow)]"
            style={{ width: `${progressToNextLevel}%` }}
          />
        </div>
      </div>

      {/* ⚔️ Weekly Challenge Card System */}
      <div className="glass-card p-4 sm:p-5 bg-gradient-to-r from-purple-500/5 to-pink-500/10 border border-purple-500/20 rounded-2xl relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <span className="text-base">⚔️</span>
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-1.5 leading-none">
                Weekly Combat Training <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-black tracking-widest">ACTIVE</span>
              </h4>
              <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-wider leading-none mt-1">Maintain muscle synthesis with 4 active logs a week</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-black uppercase text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20">
              REWARD: +150 XP
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-[800] uppercase tracking-wider leading-none">
            <span className="text-white/90">Challenge Status: {workoutsLast7Days} / {targetWorkouts} workouts logged</span>
            <span className="text-purple-400 font-black">{progressPct}% Complete</span>
          </div>

          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-400 to-amber-400 rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <div className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest flex items-center gap-1">
              🔒 Resets weekly based on last log verification.
            </div>
            {isCompleted ? (
              isClaimed ? (
                <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1">
                  ✓ Claimed
                </span>
              ) : (
                <button
                  onClick={handleClaimWeeklyBonus}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-display font-black text-[9px] uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Claim +150 XP
                </button>
              )
            ) : (
              <span className="text-[9px] text-[var(--muted)] font-black uppercase bg-white/5 px-2.5 py-1 rounded-lg tracking-widest">
                Lockout Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 📊 Weekly Performance Social Export Section */}
      <div className="glass-card p-4 sm:p-5 bg-gradient-to-br from-[var(--card)] to-black border border-white/5 rounded-2xl relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <Share2 size={16} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-1.5 leading-none">
                Weekly Performance Export <span className="text-[8px] bg-[var(--accent)]/20 text-[var(--accent)] px-1.5 py-0.5 rounded font-black tracking-widest">NEW</span>
              </h4>
              <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-wider leading-none mt-1">Aggregate and share your last 7 days of raw performance</p>
            </div>
          </div>
          
          {/* Preset Buttons for custom styles */}
          <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 sm:self-center">
            {(['beast', 'standard', 'aesthetic'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setExportPreset(preset)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  exportPreset === preset
                    ? "bg-[var(--accent)] text-white shadow shadow-[var(--accent-glow)] scale-[1.02]"
                    : "text-[var(--muted)] hover:text-white"
                )}
              >
                {preset === 'beast' && '🔥 Beast'}
                {preset === 'standard' && '⚡ Standard'}
                {preset === 'aesthetic' && '🌱 Aesthetic'}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic customized text generator layout */}
        <div className="space-y-3">
          <div className="bg-black/40 border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all">
            <textarea
              value={weeklyStatsText}
              readOnly
              className="w-full text-[11px] text-white/90 bg-transparent border-0 outline-none resize-none font-mono min-h-[110px] leading-relaxed select-all"
              placeholder="Collecting performance metrics..."
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-0.5">
            <div className="text-[9px] text-[var(--muted)] font-semibold uppercase tracking-widest flex items-center gap-1 leading-none text-center sm:text-left">
              <Sparkles size={11} className="text-[var(--yellow)] animate-pulse" /> 
              Click copy to share to Instagram, Twitter or WhatsApp!
            </div>

            <button
              onClick={() => {
                try {
                  navigator.clipboard.writeText(weeklyStatsText);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2500);
                } catch (err) {
                  const textArea = document.createElement("textarea");
                  textArea.value = weeklyStatsText;
                  document.body.appendChild(textArea);
                  textArea.select();
                  try {
                    document.execCommand('copy');
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2500);
                  } catch (e) {}
                  document.body.removeChild(textArea);
                }
              }}
              className={cn(
                "w-full sm:w-auto py-2.5 px-4 rounded-xl transition-all font-display font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer min-w-[150px]",
                isCopied 
                  ? "bg-emerald-500 text-white shadow-emerald-500/10" 
                  : "bg-white text-black hover:bg-neutral-200"
              )}
            >
              {isCopied ? (
                <>
                  <Check size={13} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={13} /> Copy Summary
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Smart Health & Safety Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* BMI & Body Index */}
        <div className="glass-card p-4 sm:p-5 border border-[var(--border)] rounded-2xl relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--accent)]/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3 leading-none">
             <h3 className="tab-heading flex items-center gap-2">
                <Activity size={15} className="text-[var(--accent)]" />
                BMI & Body Index
             </h3>
             <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Calculated Summary</span>
          </div>
          <div className="flex items-baseline gap-3 mt-1.5">
            <span className="text-4xl font-black tracking-tighter text-white">
              {profile.height && profile.weight ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : "—"}
            </span>
            <span className={cn(
              "text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full",
              !(profile.height && profile.weight) ? "bg-white/5 text-white/50" : 
              (profile.weight / ((profile.height / 100) ** 2)) < 18.5 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
              (profile.weight / ((profile.height / 100) ** 2)) < 25 ? "bg-green-500/10 text-green-400 border border-green-500/20" :
              (profile.weight / ((profile.height / 100) ** 2)) < 30 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
            )}>
              {!(profile.height && profile.weight) ? "Update profile" : 
               (profile.weight / ((profile.height / 100) ** 2)) < 18.5 ? "Underweight" : 
               (profile.weight / ((profile.height / 100) ** 2)) < 25 ? "Normal Weight" : 
               (profile.weight / ((profile.height / 100) ** 2)) < 30 ? "Overweight" : "Obese"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
            <div>Weight: <strong className="text-white">{profile.weight || "—"} kg</strong></div>
            <div>Height: <strong className="text-white">{profile.height || "—"} cm</strong></div>
          </div>
        </div>

        {/* Dynamic Recovery & Safety Rules */}
        <div className="glass-card p-4 sm:p-5 border border-[var(--border)] rounded-2xl relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-5 w-32 h-32 bg-[var(--yellow)]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--yellow)]/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3 leading-none">
             <h3 className="tab-heading flex items-center gap-2">
                <Target size={15} className="text-[var(--yellow)]" />
                Coach Recovery Rule
             </h3>
             <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Activity Watch</span>
          </div>
          <div className="space-y-2 mt-1.5">
            {Object.keys(data).filter(k => {
              const diff = Math.abs(new Date().getTime() - new Date(k).getTime());
              return diff <= (1000 * 60 * 60 * 24 * 7);
            }).length >= 5 ? (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="text-[11px] text-white/90 leading-tight">
                  <strong>⚠️ High Frequency Overtraining:</strong> You have trained 5+ days in the last week. Schedule a 48H pure recovery break!
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="text-[11px] text-white/90 leading-tight">
                  <strong>💧 Hydration & Recovery:</strong> Consume 3.5 liters of water on lift days to assist filtration and complete protein synthesis.
                </div>
              </div>
            )}
            <p className="text-[9px] text-[var(--muted)] uppercase font-[800] tracking-wider leading-none">
              * Joint protection requires active warm-ups & ROM.
            </p>
          </div>
        </div>
      </div>

      {/* Motivation Header */}
      <DailyMotivation workoutType={currentWorkoutType as any} />

      {/* Daily Missions */}
      <div className="glass-card p-4 sm:p-5 border border-[var(--border)] rounded-2xl relative overflow-hidden group shadow-sm">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--accent)]/10 transition-all pointer-events-none" />
         <div className="flex items-center justify-between mb-4 leading-none">
            <h3 className="tab-heading flex items-center gap-2">
               <Target size={15} className="text-[var(--accent)]" />
               Daily Missions
            </h3>
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Gain XP</span>
         </div>
         <div className="flex flex-col gap-2">
            {missions.map(mission => (
               <div key={mission.id} className={cn("flex justify-between items-center p-3 rounded-2xl border transition-all", mission.completed ? "bg-[var(--accent)]/10 border-[var(--accent)]/30" : "bg-[var(--sub)] border-[var(--border)] hover:border-[var(--muted)]")}>
                  <div className="flex items-center gap-2.5">
                     <div className={cn("w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0", mission.completed ? "bg-[var(--accent)] text-white shadow-[0_0_10px_var(--accent-glow)]" : "bg-black/20 text-[var(--muted)]")}>
                        {mission.completed ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />}
                     </div>
                     <span className={cn("text-xs font-bold leading-tight", mission.completed ? "text-white line-through opacity-70" : "text-white")}>{mission.text}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                     <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">+{mission.xpReward} XP</span>
                     {!mission.completed && (
                        <button onClick={() => completeMission(mission.id, mission.text, mission.xpReward)} className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all">Claim</button>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Self-Discipline & Dopamine Scorecard */}
      <div className="glass-card p-4 sm:p-5 bg-gradient-to-br from-[var(--card)] to-[#070707] border border-[var(--border)] rounded-2xl relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛡️</span>
            <div>
              <h3 className="text-sm font-black uppercase text-white tracking-widest leading-none">Self-Mastery Core Status</h3>
              <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-wider leading-none mt-1">Subtle neurological alignment indicators</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              🔥 Streak: <span className="font-black">{localStorage.getItem('sm_detox_streak') || '0'} Days</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
              ⚡ Focus: <span className="font-black">{localStorage.getItem(`sm_dopamine_index_${today}`) || '75'}%</span>
            </div>
          </div>
        </div>

        {/* Subtle rotate quotes inside Dashboard */}
        <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-center">
          <p className="text-[10px] text-white/90 italic leading-normal">
            " {RESPECT_MESSAGES[Math.floor(Date.now() / 86400000) % RESPECT_MESSAGES.length]} "
          </p>
        </div>
      </div>

      {/* Wellness Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <MoodTracker />
        <BreathingExercise />
      </div>

      {/* Tracker Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <WaterTracker />
        <SleepTracker />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
         <div className="glass-card p-3 sm:p-4 rounded-xl flex flex-col justify-between group overflow-hidden relative shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--blue)]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[var(--blue)]/10 transition-all" />
            <div className="flex items-center justify-between mb-3 leading-none">
               <div className="w-8 h-8 bg-[var(--blue)]/10 rounded-xl flex items-center justify-center text-[var(--blue)] border border-[var(--blue)]/10 shrink-0">
                  <Footprints size={16} />
               </div>
               <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Steps</span>
            </div>
            <div>
               <div className="text-2xl sm:text-3xl font-black tracking-tighter text-white">{(steps[today] || 0).toLocaleString()}</div>
               <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-white/[0.03]">
                  <div className="flex-1 h-1 bg-[var(--sub)] rounded-full overflow-hidden">
                     <div className="h-full bg-[var(--blue)]" style={{ width: `${Math.min(100, ((steps[today] || 0) / 10000) * 100)}%` }} />
                  </div>
                  <span className="text-[8px] font-black text-[var(--muted)] uppercase tracking-tight shrink-0">Goal: 10K</span>
               </div>
            </div>
         </div>

         <div className="glass-card p-3 sm:p-4 rounded-xl flex flex-col justify-between group overflow-hidden relative shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--red)]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[var(--red)]/10 transition-all" />
            <div className="flex items-center justify-between mb-3 leading-none">
               <div className="w-8 h-8 bg-[var(--red)]/10 rounded-xl flex items-center justify-center text-[var(--red)] border border-[var(--red)]/10 shrink-0">
                  <Zap size={16} />
               </div>
               <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Burn</span>
            </div>
            <div>
               <div className="text-2xl sm:text-3xl font-black tracking-tighter text-white">{calories}</div>
               <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mt-1.5 pt-1.5 border-t border-white/[0.03] leading-none">Kcal Today</p>
            </div>
         </div>

         <div className="glass-card p-3 sm:p-4 rounded-xl flex flex-col justify-between group overflow-hidden relative shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--green)]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[var(--green)]/10 transition-all" />
            <div className="flex items-center justify-between mb-3 leading-none">
               <div className="w-8 h-8 bg-[var(--green)]/10 rounded-xl flex items-center justify-center text-[var(--green)] border border-[var(--green)]/10 shrink-0">
                  <Activity size={16} />
               </div>
               <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Time</span>
            </div>
            <div>
               <div className="text-2xl sm:text-3xl font-black tracking-tighter text-white">{workoutTime}m</div>
               <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mt-1.5 pt-1.5 border-t border-white/[0.03] leading-none">Active time</p>
            </div>
         </div>

         <div className="glass-card p-3 sm:p-4 rounded-xl flex flex-col justify-between group overflow-hidden relative shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--blue)]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[var(--blue)]/10 transition-all" />
            <div className="flex items-center justify-between mb-3 leading-none">
               <div className="w-8 h-8 bg-[var(--blue)]/10 rounded-xl flex items-center justify-center text-[var(--blue)] border border-[var(--blue)]/10 shrink-0">
                  <Droplets size={16} />
               </div>
               <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Water</span>
            </div>
            <div>
               <div className="text-2xl sm:text-3xl font-black tracking-tighter text-white">{water}/{waterGoal}</div>
               <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mt-1.5 pt-1.5 border-t border-white/[0.03] leading-none">Logged Glass</p>
            </div>
         </div>
      </div>

      {/* Live Data Chain Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between leading-none">
           <h3 className="tab-heading text-white">🔗 Live Data Chain</h3>
           <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] animate-pulse shadow-[0_0_8px_var(--accent-glow)] bg-[var(--accent)]/10 px-2 py-1 rounded border border-[var(--accent)]/15">🔥 82% Users Trained Today</span>
        </div>
        {loggedDays.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {loggedDays.map((d, i) => {
              const entries = data[d];
              const muscles = Array.from(new Set(entries.map(e => e.muscle)));
              return (
                <div key={d} className="flex-shrink-0 flex items-center gap-3">
                  <div className="bg-[var(--card)] border border-[var(--accent)] rounded-xl p-3 min-w-[125px] shadow">
                    <div className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest leading-none">{d.split('-').slice(1).join('/')}</div>
                    <div className="text-xs font-bold text-white mt-1 leading-none">LINK {loggedDays.length - i}</div>
                    <div className="text-[10px] text-[var(--muted)] uppercase font-black tracking-tighter mt-2">{muscles.join(', ')}</div>
                  </div>
                  {i < loggedDays.length - 1 && <span className="text-[var(--accent)] text-lg opacity-30 select-none">→</span >}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-4 border border-dashed border-[var(--border)] rounded-xl text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest">No links in chain yet. Start training!</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4 leading-none">
             <h3 className="tab-heading flex items-center gap-2">
                <Activity size={15} className="text-[var(--accent)]" />
                Calorie Trends
             </h3>
             <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Last 7 Days</div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: 'var(--text)' }}
                />
                <Area type="monotone" dataKey="calories" stroke="var(--accent)" fillOpacity={1} fill="url(#colorCals)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-10">
             <h3 className="tab-heading flex items-center gap-2">
               <Activity size={16} className="text-[var(--blue)]" />
               Daily Activity
             </h3>
             <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Step Statistics</div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--sub)' }}
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }}
                />
                <Bar dataKey="steps" fill="var(--blue)" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between leading-none">
          <h2 className="tab-heading text-lg">📆 Training Consistency</h2>
          <div className="flex gap-2">
            <button onClick={() => setCalOffset(prev => prev - 1)} className="p-2 rounded-xl bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCalOffset(prev => prev + 1)} className="p-2 rounded-xl bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="glass-card p-4 sm:p-5 group relative overflow-hidden rounded-2xl shadow-sm">
          <div className="absolute top-0 left-0 w-2 h-full bg-[var(--accent)] group-hover:w-3 transition-all" />
          
          <div className="flex items-center justify-between mb-4 leading-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-[var(--accent)] shadow-md shadow-[var(--accent-glow)]">
                 <Target size={18} />
              </div>
              <div>
                <h4 className="text-lg font-display font-black uppercase tracking-tight">
                   {MONTHS[new Date(new Date().getFullYear(), new Date().getMonth() + calOffset, 1).getMonth()]} {new Date(new Date().getFullYear(), new Date().getMonth() + calOffset, 1).getFullYear()}
                </h4>
                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest italic leading-none mt-1">Syncing live from logs</p>
              </div>
            </div>
            <button onClick={() => setCalOffset(0)} className="tab-heading text-[10px] text-[var(--accent)] hover:underline cursor-pointer">Return Today</button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} className="text-center text-[9px] text-[var(--muted)] font-black uppercase tracking-wider">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {renderCalendar()}
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-md bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Session Loged</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-md border-2 border-[var(--yellow)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Current Day</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Premium Branded End Screen Section by Kathiravan */}
      <motion.div 
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 pt-8 border-t border-white/5 space-y-6"
      >
        {/* Section Identity */}
        <div className="text-center space-y-3 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest font-mono">Discipline Protocol</span>
          </div>
          
          <h2 className="text-xl font-display font-black tracking-tight text-white uppercase italic leading-none">
            🚀 Built for Discipline
          </h2>
          
          <div className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">
            LevelUp System by <span className="text-white border-b border-white/20 pb-0.5 hover:text-blue-400 hover:border-blue-400/40 transition-colors duration-200">Kathiravan</span>
          </div>
          
          <p className="text-xs text-[var(--muted)] italic">
            "Transform your body. Master your mind. Control your life."
          </p>
        </div>

        {/* Highlighted Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 max-w-7xl mx-auto">
          {/* Creator Profile Card */}
          <motion.div
            whileHover={{ 
              scale: 1.01, 
              boxShadow: "0 20px 40px -12px rgba(59, 130, 246, 0.2)",
              borderColor: "rgba(59, 130, 246, 0.3)"
            }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="group relative overflow-hidden bg-gradient-to-b from-[#0c0c10] to-[#040406] border border-white/[0.05] rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] min-h-[300px]"
          >
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-500/20 transition-all duration-300 shadow-md">
                  <Code size={18} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-mono leading-none">
                  👨‍💻 About the Developer
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-display font-black uppercase tracking-tight text-white leading-tight">
                  Kathiravan
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Developer, creator, and builder of systems focused on discipline, self-control, and performance optimization.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-2">
              <a
                href="https://kathir-star.github.io/portfolio_kathiravan/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full min-h-[40px] items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-mono font-black text-xs uppercase tracking-widest transition-all duration-200 shadow shadow-blue-500/20 hover:shadow-blue-500/35 cursor-pointer"
              >
                View Portfolio ↗
              </a>
            </div>
          </motion.div>

          {/* Project Showcase Card */}
          <motion.div
            whileHover={{ 
              scale: 1.01, 
              boxShadow: "0 20px 40px -12px rgba(168, 85, 247, 0.2)",
              borderColor: "rgba(168, 85, 247, 0.3)"
            }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="group relative overflow-hidden bg-gradient-to-b from-[#0c0c10] to-[#040406] border border-white/[0.05] rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] min-h-[300px]"
          >
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-500" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 group-hover:bg-purple-500/20 transition-all duration-300 shadow-md">
                  <Sparkles size={18} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-mono leading-none">
                  ⚡ Featured System
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 leading-none">
                  <h3 className="text-lg font-display font-black uppercase tracking-tight text-white leading-none">
                    Chronix Flow
                  </h3>
                  <span className="text-[9px] font-mono tracking-widest font-black uppercase text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md border border-[var(--accent)]/20 shadow-sm leading-none">
                    Productivity
                  </span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 font-mono leading-none">
                  Smart Productivity Engine
                </p>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  A powerful task management and productivity system designed to help you stay focused and execute consistently.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-2">
              <a
                href="https://kathir-star.github.io/chronix_Flow/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full min-h-[40px] items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-mono font-black text-xs uppercase tracking-widest transition-all duration-200 shadow shadow-purple-500/20 hover:shadow-purple-500/35 cursor-pointer"
              >
                Explore Chronix Flow ↗
              </a>
            </div>
          </motion.div>
        </div>

        {/* Social Connect Row */}
        <div className="glass-card bg-[#09090c]/85 border border-white/[0.05] rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shadow-md">
              <span className="text-lg">🌐</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase text-white tracking-widest">Connect</h4>
              <p className="text-[10px] text-[var(--muted)] font-mono uppercase tracking-widest leading-relaxed">Instant channels of execution and builds</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {[
              {
                name: "GitHub",
                link: "https://github.com/Kathir-star",
                icon: <Github size={16} />,
                color: "hover:bg-neutral-800 hover:border-neutral-700 hover:text-white"
              },
              {
                name: "LinkedIn",
                link: "https://www.linkedin.com/in/kathiravan-v-160555395",
                icon: <Linkedin size={16} />,
                color: "hover:bg-[#0077b5]/10 hover:border-[#0077b5]/30 hover:text-[#0077b5]"
              },
              {
                name: "Instagram",
                link: "https://www.instagram.com/_kathir_offlx/",
                icon: <Instagram size={16} />,
                color: "hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-400"
              }
            ].map((social) => (
              <motion.a
                key={social.name}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.03 }}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.06] bg-black/45 text-neutral-300 text-xs font-black font-mono uppercase tracking-widest transition-all duration-300 min-h-[44px] cursor-pointer shadow-sm",
                  social.color
                )}
              >
                <span className="opacity-80 group-hover:opacity-100">{social.icon}</span>
                <span>{social.name}</span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Subtle Footer Line */}
        <div className="text-center pt-8 pb-4">
          <p className="text-[11px] sm:text-xs text-[var(--muted)] font-black uppercase tracking-widest leading-loose">
            LevelUp isn’t just fitness — it’s a system for life. 🔥
          </p>
        </div>
      </motion.div>

      {/* 🧘 Reset Mind Fullscreen Immersive Breathing Overlay Modal */}
      <AnimatePresence>
        {showResetMind && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Ambient glowing fields */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative max-w-sm w-full flex flex-col items-center space-y-8 z-10">
              <div className="flex flex-col items-center">
                <Wind size={40} className="text-blue-400 animate-pulse mb-3" />
                <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-wider">RESET MIND ACTIVE</h2>
                <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] mt-1">Somatic Cortisol Reducer Active</div>
              </div>

              {/* Breathing Sphere */}
              <div className="w-60 h-60 flex items-center justify-center relative">
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-dashed border-blue-400/20"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                />
                
                <motion.div 
                  className={cn(
                    "rounded-full flex flex-col items-center justify-center transition-colors duration-1000 shadow-2xl relative",
                    resetPhase === 'Inhale' && "bg-blue-500/10 border-2 border-blue-400 shadow-blue-500/20",
                    resetPhase === 'Hold' && "bg-purple-500/10 border-2 border-purple-400 shadow-purple-500/20",
                    resetPhase === 'Exhale' && "bg-emerald-500/10 border-2 border-emerald-400 shadow-emerald-500/20",
                    resetPhase === 'Pause' && "bg-white/5 border-2 border-white/20 shadow-white/5"
                  )}
                  animate={{
                    scale: resetPhase === 'Inhale' ? [1, 1.3] :
                           resetPhase === 'Hold' ? 1.3 :
                           resetPhase === 'Exhale' ? [1.3, 1] : 1
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  style={{ width: '160px', height: '160px' }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={resetPhase}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-center"
                    >
                      <span className="text-xl font-display font-black text-white uppercase italic tracking-widest">{resetPhase}</span>
                      <div className="text-3xl font-black text-white/95 mt-1">{resetTimer}s</div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Box Progress Indicators */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-xs justify-center">
                {(['Inhale', 'Hold', 'Exhale', 'Pause'] as const).map((p) => {
                  const isCurrent = resetPhase === p;
                  return (
                    <div className="flex flex-col items-center gap-1.5" key={p}>
                      <div className={cn(
                        "h-1.5 w-full rounded-full transition-all duration-500",
                        isCurrent ? "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" : "bg-white/10"
                      )} />
                      <span className="text-[8px] font-black uppercase text-[var(--muted)] tracking-wider">{p}</span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full">
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Cycle Progression</div>
                <div className="text-sm font-bold text-white mt-1">Cycle {resetCycles + 1} of 3 • Deep Diaphragmatic Balance</div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3 border border-white/5">
                  <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${(resetCycles / 3) * 100}%` }} />
                </div>
              </div>

              <button 
                onClick={() => setShowResetMind(false)}
                className="px-6 py-2 bg-white/5 text-[var(--muted)] hover:text-white border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
              >
                Interrupt Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
