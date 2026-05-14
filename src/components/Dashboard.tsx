import { useState, useEffect, useMemo } from 'react';
import DailyMotivation from './wellness/DailyMotivation';
import MoodTracker from './wellness/MoodTracker';
import BreathingExercise from './wellness/BreathingExercise';
import WaterTracker from './WaterTracker';
import SleepTracker from './SleepTracker';
import { WorkoutEntry, UserProfile, DailyMission } from '../types';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight, TrendingUp, Activity, Footprints, Droplets, Zap, Target, CheckCircle2 } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, Cell 
} from 'recharts';

interface DashboardProps {
  data: Record<string, WorkoutEntry[]>;
  profile: UserProfile;
  steps: Record<string, number>;
  water: number;
  waterGoal: number;
  missions: DailyMission[];
  completeMission: (id: string, text: string, xpReward: number) => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Dashboard({ data, profile, steps, water, waterGoal, missions, completeMission }: DashboardProps) {
  const [calOffset, setCalOffset] = useState(0);
  const [calories, setCalories] = useState(0);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [xp, setXp] = useState(0);

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

  // Resolve current workout type for dynamic quotes
  const currentWorkoutType = useMemo(() => {
    const entries = data[today] || [];
    if (entries.length === 0) return undefined;
    
    // Get last logged muscle
    const lastMuscle = entries[entries.length - 1].muscle.toLowerCase();
    
    if (['legs', 'glutes', 'hamstrings', 'quadriceps'].includes(lastMuscle)) return 'legs';
    if (['chest', 'triceps', 'shoulder'].includes(lastMuscle)) return 'push';
    if (['back', 'biceps'].includes(lastMuscle)) return 'pull';
    return undefined;
  }, [data, today]);

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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* XP Progress Bar */}
      <div className="glass-card p-6 bg-gradient-to-r from-[var(--card)] to-[var(--bg)] border-l-4 border-l-[var(--accent)] mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--red)] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[var(--accent)]/20 tracking-tighter">
              Lvl {level}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Elite Performance</h2>
              <p className="text-xs text-[var(--muted)] font-black uppercase tracking-widest">{xp} Total XP Earned</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black italic text-[var(--accent)]">{100 - xpInLevel} XP</div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">To Level {level + 1}</p>
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--red)] transition-all duration-1000 shadow-[0_0_15px_var(--accent-glow)]"
            style={{ width: `${progressToNextLevel}%` }}
          />
        </div>
      </div>

      {/* Motivation Header */}
      <DailyMotivation workoutType={currentWorkoutType as any} />

      {/* Daily Missions */}
      <div className="glass-card p-6 border border-[var(--border)] relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--accent)]/10 transition-all pointer-events-none" />
         <div className="flex items-center justify-between mb-6">
            <h3 className="tab-heading flex items-center gap-2">
               <Target size={16} className="text-[var(--accent)]" />
               Daily Missions
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Gain XP</span>
         </div>
         <div className="flex flex-col gap-3">
            {missions.map(mission => (
               <div key={mission.id} className={cn("flex justify-between items-center p-4 rounded-2xl border transition-all", mission.completed ? "bg-[var(--accent)]/10 border-[var(--accent)]/30" : "bg-[var(--sub)] border-[var(--border)] hover:border-[var(--muted)]")}>
                  <div className="flex items-center gap-3">
                     <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-all", mission.completed ? "bg-[var(--accent)] text-white shadow-[0_0_15px_var(--accent-glow)]" : "bg-black/20 text-[var(--muted)]")}>
                        {mission.completed ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-[var(--muted)]" />}
                     </div>
                     <span className={cn("text-sm font-bold", mission.completed ? "text-white line-through opacity-70" : "text-white")}>{mission.text}</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">+{mission.xpReward} XP</span>
                     {!mission.completed && (
                        <button onClick={() => completeMission(mission.id, mission.text, mission.xpReward)} className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">Claim</button>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Wellness Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoodTracker />
        <BreathingExercise />
      </div>

      {/* Tracker Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterTracker />
        <SleepTracker />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="glass-card p-6 flex flex-col justify-between group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--blue)]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[var(--blue)]/10 transition-all" />
            <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 bg-[var(--blue)]/10 rounded-xl flex items-center justify-center text-[var(--blue)]">
                  <Footprints size={20} />
               </div>
               <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Steps</span>
            </div>
            <div>
               <div className="text-4xl font-black tracking-tighter">{(steps[today] || 0).toLocaleString()}</div>
               <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-[var(--sub)] rounded-full overflow-hidden">
                     <div className="h-full bg-[var(--blue)]" style={{ width: `${Math.min(100, ((steps[today] || 0) / 10000) * 100)}%` }} />
                  </div>
                  <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Goal: 10K</span>
               </div>
            </div>
         </div>

         <div className="glass-card p-6 flex flex-col justify-between group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--red)]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[var(--red)]/10 transition-all" />
            <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 bg-[var(--red)]/10 rounded-xl flex items-center justify-center text-[var(--red)]">
                  <Zap size={20} />
               </div>
               <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Active Burn</span>
            </div>
            <div>
               <div className="text-4xl font-black tracking-tighter">{calories}</div>
               <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-1">Kcal Est. Today</p>
            </div>
         </div>

         <div className="glass-card p-6 flex flex-col justify-between group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--green)]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[var(--green)]/10 transition-all" />
            <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 bg-[var(--green)]/10 rounded-xl flex items-center justify-center text-[var(--green)]">
                  <Activity size={20} />
               </div>
               <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Workout Time</span>
            </div>
            <div>
               <div className="text-4xl font-black tracking-tighter">{workoutTime}m</div>
               <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-1">Active Duration</p>
            </div>
         </div>

         <div className="glass-card p-6 flex flex-col justify-between group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--blue)]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[var(--blue)]/10 transition-all" />
            <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 bg-[var(--blue)]/10 rounded-xl flex items-center justify-center text-[var(--blue)]">
                  <Droplets size={20} />
               </div>
               <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Hydration</span>
            </div>
            <div>
               <div className="text-4xl font-black tracking-tighter">{water}/{waterGoal}</div>
               <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-1">Glasses Logged</p>
            </div>
         </div>
      </div>

      {/* Live Data Chain Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="tab-heading text-white">🔗 Live Data Chain</h3>
           <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] animate-pulse shadow-[0_0_10px_var(--accent-glow)]">🔥 82% Users Trained Today</span>
        </div>
        {loggedDays.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {loggedDays.map((d, i) => {
              const entries = data[d];
              const muscles = Array.from(new Set(entries.map(e => e.muscle)));
              return (
                <div key={d} className="flex-shrink-0 flex items-center gap-4">
                  <div className="bg-[var(--card)] border border-[var(--accent)] rounded-2xl p-4 min-w-[140px] shadow-lg">
                    <div className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">{d.split('-').slice(1).join('/')}</div>
                    <div className="text-sm font-bold text-white mt-1">LINK {loggedDays.length - i}</div>
                    <div className="text-[10px] text-[var(--muted)] uppercase font-black tracking-tighter mt-2">{muscles.join(', ')}</div>
                  </div>
                  {i < loggedDays.length - 1 && <span className="text-[var(--accent)] text-xl opacity-30">→</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed border-[var(--border)] rounded-2xl text-[var(--muted)] text-xs font-bold uppercase tracking-widest">No links in chain yet. Start training!</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-10">
             <h3 className="tab-heading flex items-center gap-2">
               <Activity size={16} className="text-[var(--accent)]" />
               Calorie Trends
             </h3>
             <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Last 7 Days</div>
          </div>
          <div className="h-72 w-full">
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
                <Area type="monotone" dataKey="calories" stroke="var(--accent)" fillOpacity={1} fill="url(#colorCals)" strokeWidth={4} animationDuration={2000} />
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
                <Bar dataKey="steps" fill="var(--blue)" radius={[8, 8, 0, 0]} barSize={28} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="tab-heading text-xl">📆 Training Consistency</h2>
          <div className="flex gap-2">
            <button onClick={() => setCalOffset(prev => prev - 1)} className="p-3 rounded-2xl bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)] transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCalOffset(prev => prev + 1)} className="p-3 rounded-2xl bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)] transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="glass-card p-8 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[var(--accent)] group-hover:w-4 transition-all" />
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]">
                 <Target size={28} />
              </div>
              <div>
                <h4 className="text-2xl font-display font-black uppercase tracking-tight">
                   {MONTHS[new Date(new Date().getFullYear(), new Date().getMonth() + calOffset, 1).getMonth()]} {new Date(new Date().getFullYear(), new Date().getMonth() + calOffset, 1).getFullYear()}
                </h4>
                <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest italic">Syncing live from training logs</p>
              </div>
            </div>
            <button onClick={() => setCalOffset(0)} className="tab-heading text-[var(--accent)] hover:underline">Return Today</button>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} className="text-center text-[10px] text-[var(--muted)] font-black uppercase tracking-[0.3em]">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3">
            {renderCalendar()}
          </div>
          
          <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-lg bg-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Session Logged</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-lg border-2 border-[var(--yellow)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Current Day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
