import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Activity, 
  Apple, 
  Sparkles, 
  Dumbbell, 
  Scale, 
  Calendar, 
  Brain, 
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Workout, PersonalRecord, ProgressLog, ProteinLog, UserProfile } from '../types';

interface DashboardProps {
  userProfile: UserProfile | null;
  workouts: Workout[];
  prs: PersonalRecord[];
  weightLogs: ProgressLog[];
  proteinLogs: ProteinLog[];
  onNavigateTo: (tab: 'workout' | 'protein' | 'progress' | 'pr') => void;
}

export default function Dashboard({ userProfile, workouts, prs, weightLogs, proteinLogs, onNavigateTo }: DashboardProps) {
  const [coachThinking, setCoachThinking] = useState(false);
  const [coachResponse, setCoachResponse] = useState<string | null>(null);

  // Compute key stats
  const streak = userProfile?.streakCount || 0;
  const totalWorkouts = workouts.length;
  
  // Calculate today's protein
  const todayStr = new Date().toISOString().split('T')[0];
  const todayProteinLogs = proteinLogs.filter(log => log.date === todayStr);
  const totalProteinToday = todayProteinLogs.reduce((acc, curr) => acc + curr.amount, 0);
  const proteinGoal = 150;
  const proteinPercent = Math.min(100, Math.round((totalProteinToday / proteinGoal) * 100));

  // Latest weight
  const latestWeight = weightLogs[0]?.weight || null;
  const targetWeight = userProfile?.weightTarget || 80;

  // Recent 3 workouts
  const recentWorkouts = [...workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Dynamic analysis for AI Coach Suggestions!
  const triggerAICoach = () => {
    setCoachThinking(true);
    setCoachResponse(null);

    setTimeout(() => {
      let analysisText = `### LevelUp AI Coach Report 🧠🔥\n*Targeting Optimal Performance*\n\n`;

      // 1. Consistency Analysis
      if (workouts.length === 0) {
        analysisText += `- **Routine Status:** No active routine found in cloud storage. Forge your commitment by logging your first workout session today. Consistency is our currency.\n`;
      } else {
        analysisText += `- **Consistency Rating:** Excellent! You have completed **${totalWorkouts} sessions** so far, maintaining a **${streak}-day active streak**. Keeping the momentum alive is critical to muscle memory.\n`;
      }

      // 2. Protein Analysis
      if (totalProteinToday === 0) {
        analysisText += `- **Macro Alert:** You have logged **0g** out of your daily **${proteinGoal}g target** today. Consume high-quality amino acids (e.g., protein shakes, eggs, or chicken) within the anabolic window to stimulate recovery.\n`;
      } else if (totalProteinToday < proteinGoal) {
        analysisText += `- **Macro Progress:** You are currently at **${totalProteinToday}g** (**${proteinPercent}%** of target). Solid job, but you are still short by **${proteinGoal - totalProteinToday}g**. Keep hydrating and secure another snack to meet structural limits.\n`;
      } else {
        analysisText += `- **Macro Victory:** Masterful macro logging! You hit **${totalProteinToday}g**, fully crushing your **${proteinGoal}g daily goal**. Your muscles have sufficient nitrogen storage for synthesis!\n`;
      }

      // 3. Weight target Analysis
      if (latestWeight) {
        const diff = latestWeight - targetWeight;
        if (Math.abs(diff) < 0.5) {
          analysisText += `- **Weight Target:** You are sitting at **${latestWeight}kg**, virtually matching your **${targetWeight}kg goal**! Maintain current caloric expenditure and focus on strength gains.\n`;
        } else if (diff > 0) {
          analysisText += `- **Weight Target:** Current weight is **${latestWeight}kg** (goal: **${targetWeight}kg**). To target body recomposition, maintain a slight caloric deficit (300-500 kcal) and preserve high intensity lifting to spare muscle tissue.\n`;
        } else {
          analysisText += `- **Weight Target:** Current weight is **${latestWeight}kg** (goal: **${targetWeight}kg**). You are in a favorable position for clean bulking. A steady surplus with progressive overload is key.\n`;
        }
      } else {
        analysisText += `- **Weight Indexing:** No weight logs found. Register a starting weight in the 'Progress Hub' to estimate BMI and body fat percentage trends.\n`;
      }

      // 4. Recommendation PR Action
      if (prs.length > 0) {
        const bestPR = [...prs].sort((a,b) => b.weight - a.weight)[0];
        analysisText += `- **Next Challenge:** Your current top record is **${bestPR.exercise} at ${bestPR.weight} lbs**. Try introducing a 2.5% progressive overload increase next week to continue provoking neuromuscular adaptation.\n`;
      } else {
        analysisText += `- **Next Challenge:** No PRs logged yet. Pick your favorite exercise (like Bench Press or Deadlift) during your next workout and lock in a benchmark weight.\n`;
      }

      analysisText += `\n> *“Discipline Over Motivation. No excuses, just progress.”*`;

      setCoachResponse(analysisText);
      setCoachThinking(false);
    }, 1200);
  };

  // Sort logs ascending for trend
  const sortedProgress = [...weightLogs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(log => ({
      date: new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      Weight: log.weight,
      'Body Fat %': log.bodyFat
    }));

  return (
    <div className="space-y-6">
      
      {/* Dynamic Slogan Bar */}
      <div className="bg-gradient-to-r from-neutral-900/40 via-amber-500/5 to-neutral-900/40 border border-white/2 rounded-2xl px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-neutral-300 uppercase">
            MOTTO: DISCIPLINE OVER MOTIVATION.
          </span>
        </div>
        <div className="flex gap-4 text-[10px] font-mono text-neutral-500 uppercase">
          <span>“ Track. Improve. Dominate. ”</span>
          <span className="hidden md:inline">•</span>
          <span>“ No excuses. Just progress. ”</span>
        </div>
      </div>

      {/* Bento Stats Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak card */}
        <div className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex items-start justify-between relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-[10px] font-bold font-mono text-neutral-500 uppercase block">Daily Streak</span>
            <div className="text-3xl font-black text-white font-mono flex items-center gap-1.5">
              <Flame className="w-7 h-7 text-amber-500 animate-bounce" />
              {streak} Days
            </div>
            <p className="text-[10px] text-neutral-400">Streak stays alive with consistent entries.</p>
          </div>
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Workout Counter card */}
        <div className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex items-start justify-between relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-[10px] font-bold font-mono text-neutral-500 uppercase block">Active Routines</span>
            <div className="text-3xl font-black text-white font-mono">
              {totalWorkouts} Sessions
            </div>
            <p className="text-[10px] text-neutral-400">Total logged fitness records.</p>
          </div>
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Dumbbell className="w-5 h-5" />
          </div>
        </div>

        {/* Today's Protein tracking */}
        <button
          onClick={() => onNavigateTo('protein')}
          className="bg-neutral-900/60 hover:bg-neutral-800/40 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex items-start justify-between text-left transition-all active:scale-98"
        >
          <div className="space-y-2 w-full">
            <span className="text-[10px] font-bold font-mono text-neutral-500 uppercase block">Today's Protein</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white font-mono">{totalProteinToday}g</span>
              <span className="text-xs text-neutral-400">/ {proteinGoal}g</span>
            </div>
            {/* Minimal Progress Bar */}
            <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl shrink-0 ml-3">
            <Apple className="w-5 h-5" />
          </div>
        </button>

        {/* Weight Target progress */}
        <button
          onClick={() => onNavigateTo('progress')}
          className="bg-neutral-900/60 hover:bg-neutral-800/40 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex items-start justify-between text-left transition-all active:scale-98"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold font-mono text-neutral-500 uppercase block">Weight / Goal</span>
            <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1.5">
              {latestWeight ? `${latestWeight}kg` : 'None'}
              <span className="text-xs text-neutral-400">→ {targetWeight}kg</span>
            </div>
            <p className="text-[10px] text-neutral-400">
              {latestWeight ? `${Math.abs(latestWeight - targetWeight).toFixed(1)}kg left to target.` : 'Awaiting weight entry.'}
            </p>
          </div>
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Scale className="w-5 h-5" />
          </div>
        </button>

      </div>

      {/* Main Grid: AI Coach Suggestions & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Fitness Coach Panel */}
        <div className="lg:col-span-2 bg-neutral-900/60 border border-white/5 p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg text-neutral-950">
                <Brain className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                LevelUp AI Fitness Coach
              </h3>
            </div>
            <p className="text-xs text-neutral-400">Get customized workouts suggestions, macro critiques, and streak analysis instantly.</p>
          </div>

          <div className="flex-1 min-h-[200px] bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between overflow-y-auto max-h-[300px]">
            <AnimatePresence mode="wait">
              {coachThinking ? (
                <motion.div 
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-48 space-y-3"
                >
                  <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-bold font-mono text-amber-500 uppercase tracking-widest animate-pulse">
                    Analyzing cloud database logs...
                  </p>
                </motion.div>
              ) : coachResponse ? (
                <motion.div
                  key="response"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 text-xs leading-relaxed text-neutral-300 font-sans"
                >
                  {coachResponse.split('\n').map((line, idx) => {
                    if (line.startsWith('###')) {
                      return <h4 key={idx} className="text-sm font-black text-white mt-2 border-b border-white/5 pb-1 uppercase tracking-wider font-mono">{line.replace('###', '')}</h4>;
                    }
                    if (line.startsWith('**')) {
                      return <p key={idx} className="font-semibold text-neutral-200">{line}</p>;
                    }
                    if (line.startsWith('-')) {
                      return <div key={idx} className="flex gap-2 items-start mt-2">
                        <span className="text-amber-500 shrink-0 mt-1">•</span>
                        <span>{line.replace('-', '').trim()}</span>
                      </div>;
                    }
                    if (line.startsWith('>')) {
                      return <blockquote key={idx} className="border-l-2 border-amber-500/50 pl-3 italic text-neutral-400 my-4 bg-white/2 p-2 rounded-r-lg font-mono">{line.replace('>', '').trim()}</blockquote>;
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  className="flex flex-col items-center justify-center h-full text-center space-y-3 py-10"
                >
                  <Sparkles className="w-10 h-10 text-amber-500 animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-neutral-300">LevelUp Analysis Ready</p>
                    <p className="text-[10px] text-neutral-500 max-w-xs mx-auto leading-relaxed">
                      Our intelligence module analyzes logged sets, weights, streak parameters, and targets to provide professional coach actions.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={triggerAICoach}
            disabled={coachThinking}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            {coachThinking ? "COMPILING SUGGESTIONS..." : "GET COACH SUGGESTIONS"}
          </button>
        </div>

        {/* Right side: Recent Workouts & Smart Reminders */}
        <div className="space-y-4">
          
          {/* Recent Workouts list */}
          <div className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Recent Sessions
              </h4>
              <button 
                onClick={() => onNavigateTo('workout')}
                className="text-[10px] text-indigo-400 font-bold hover:underline flex items-center"
              >
                View all
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {recentWorkouts.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 text-[10px] border border-dashed border-white/5 rounded-xl">
                  No registered workouts yet.
                </div>
              ) : (
                recentWorkouts.map(wk => (
                  <div key={wk.id} className="bg-black/30 border border-white/5 p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 font-semibold">{wk.date}</span>
                      <p className="text-xs font-bold text-neutral-200 mt-0.5">{wk.exercises.length} Exercises Logged</p>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-amber-500 uppercase bg-neutral-950 px-2 py-0.5 rounded">
                      {wk.intensity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Smart Reminders card */}
          <div className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Smart Reminders
            </h4>

            <div className="space-y-2 text-[11px] leading-relaxed text-neutral-400">
              <div className="flex items-start gap-2 bg-black/25 p-2.5 rounded-xl border border-white/2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div>
                  <strong className="text-neutral-200 font-semibold block">Hydration Target</strong>
                  Drink 2.5L water today to support cellular nutrient transport.
                </div>
              </div>

              <div className="flex items-start gap-2 bg-black/25 p-2.5 rounded-xl border border-white/2">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <strong className="text-neutral-200 font-semibold block">Anabolic Windows</strong>
                  Feed structural muscle groups within 2 hours of deep lifting.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Progress Weight Chart Trends (Optional mini if there are logs) */}
      {sortedProgress.length >= 2 && (
        <div className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md">
          <div className="mb-4">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
              Weight Index Trend Curve
            </h4>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sortedProgress} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="miniW" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#444" fontSize={9} />
                <YAxis stroke="#444" fontSize={9} domain={['auto', 'auto']} />
                <Tooltip />
                <Area type="monotone" dataKey="Weight" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#miniW)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}
