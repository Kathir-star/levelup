import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Dumbbell, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Utensils, 
  Activity, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  RefreshCw,
  Flame,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';
import AnimatedCard from './AnimatedCard';
import { generateStructuredPlan, GeneratedDay, GeneratedExercise } from '../../utils/planGenerator';
import confetti from 'canvas-confetti';

interface PlanGeneratorProps {
  userProfile: {
    name: string;
    goal?: 'loss' | 'maintain' | 'gain';
    level?: 'beginner' | 'intermediate' | 'advanced';
    weight?: number;
    gender?: 'male' | 'female';
  };
  onPlanActivated: (plan: any[]) => void;
  triggerToast?: (msg: string, type?: string) => void;
}

export default function PlanGenerator({ userProfile, onPlanActivated, triggerToast }: PlanGeneratorProps) {
  // Input states initialized from userProfile
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(userProfile.level || 'beginner');
  const [goal, setGoal] = useState<'loss' | 'maintain' | 'gain'>(userProfile.goal || 'loss');
  const [gender, setGender] = useState<'male' | 'female'>(userProfile.gender || 'male');
  const [weight, setWeight] = useState<number>(userProfile.weight || 75);

  // Generate dynamic plan on input change
  const [generatedDays, setGeneratedDays] = useState<GeneratedDay[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>("Monday");

  useEffect(() => {
    const plan = generateStructuredPlan(level, goal, weight, gender);
    setGeneratedDays(plan);
  }, [level, goal, weight, gender]);

  // Activate the plan
  const handleActivatePlan = () => {
    // We need to map our generated days back into the exact format expected by Planner schedulerPlan
    const formattedPlan = generatedDays.map(day => ({
      day: day.day,
      focus: day.focus,
      rest: day.isRest,
      type: day.type,
      exercises: day.exercises.map(ex => ({
        name: ex.name,
        sets: String(ex.sets),
        reps: ex.reps,
        rest: ex.rest
      }))
    }));

    onPlanActivated(formattedPlan);

    // Save configuration states so the profile values are synchronized
    localStorage.setItem('lvl_ai_generated_level', level);
    localStorage.setItem('lvl_ai_generated_goal', goal);

    // Trigger feedback
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#3b82f6', '#ef4444']
    });

    if (triggerToast) {
      triggerToast(`🚀 Adaptive AI Program (${level.toUpperCase()} - ${goal.toUpperCase()}) successfully compiled and deployed to your Weekly Split!`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic AI Config Panel */}
      <div className="glass-card p-5 bg-gradient-to-br from-cyan-950/15 to-neutral-950/90 border border-cyan-500/15 rounded-2xl relative overflow-hidden shadow-xl">
        {/* Neon accent grid */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 shadow-md">
              <Sparkles size={12} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest font-mono">Neural Program Architect</span>
            </div>
            <h3 className="text-xl font-display font-black text-white uppercase italic leading-none mt-1">
              🛠️ Custom Adaptive Program Generator
            </h3>
            <p className="text-xs text-neutral-400">
              Instantly compile custom weekly schedules from our certified exercise library mapped dynamically to your biological parameters.
            </p>
          </div>
          
          <button
            onClick={handleActivatePlan}
            className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-neutral-950 hover:text-white transition font-display font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-center"
          >
            <Zap size={14} fill="currentColor" />
            Deploy AI Program to Scheduler
          </button>
        </div>

        {/* Input variables select grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {/* Level selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Program Level</label>
            <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-xl border border-white/5">
              {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "py-1.5 px-1 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition",
                    level === l ? "bg-cyan-500 text-neutral-950" : "text-neutral-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {l.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Goal selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Training Goal</label>
            <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-xl border border-white/5">
              {(['loss', 'maintain', 'gain'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={cn(
                    "py-1.5 px-1 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition",
                    goal === g ? "bg-cyan-500 text-neutral-950" : "text-neutral-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {g === 'maintain' ? 'power' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Gender selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Biological Gender</label>
            <div className="grid grid-cols-2 gap-1 bg-neutral-950 p-1 rounded-xl border border-white/5">
              {(['male', 'female'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition",
                    gender === g ? "bg-cyan-500 text-neutral-950" : "text-neutral-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Weight selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Weight Metric (KG)</label>
            <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-xl border border-white/5 justify-between">
              <button 
                onClick={() => setWeight(prev => Math.max(40, prev - 1))}
                className="w-6 h-6 rounded-md bg-neutral-900 border border-white/5 text-xs text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer font-bold"
              >
                -
              </button>
              <span className="text-xs font-black text-white font-mono">{weight} kg</span>
              <button 
                onClick={() => setWeight(prev => Math.min(150, prev + 1))}
                className="w-6 h-6 rounded-md bg-neutral-900 border border-white/5 text-xs text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Program Preview Timeline */}
      <div className="space-y-3">
        <h3 className="tab-heading text-white flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          Neural Program Preview (7-Day Microcycle)
        </h3>

        <div className="grid grid-cols-1 gap-3.5">
          {generatedDays.map((day) => {
            const isExpanded = expandedDay === day.day;
            return (
              <div 
                key={day.day} 
                className={cn(
                  "bg-neutral-900/60 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300",
                  isExpanded ? "ring-1 ring-cyan-500/30 border-cyan-500/20 shadow-lg shadow-cyan-950/10" : "hover:border-white/15"
                )}
              >
                {/* Day Header Accordion */}
                <div 
                  onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-neutral-950/35 border-b border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex flex-col items-center justify-center text-cyan-400 font-mono shrink-0">
                      <span className="text-[10px] uppercase font-black leading-none">{day.day.slice(0, 3)}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 leading-none">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{day.day}</span>
                        <span className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                          day.type === 'Strength' ? "bg-red-500/10 text-red-400 border border-red-500/15" :
                          day.type === 'HIIT' ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
                          day.type === 'Cardio' ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" :
                          "bg-neutral-900 text-neutral-500 border border-white/5"
                        )}>
                          {day.type}
                        </span>
                      </div>
                      <h4 className="text-base font-display text-white uppercase italic tracking-wider mt-1.5 leading-none">
                        {day.focus}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                    {!day.isRest && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 bg-neutral-950/50 border border-white/5 py-1 px-2.5 rounded-lg">
                        <Clock size={13} className="text-cyan-400" />
                        {day.totalTime}
                      </div>
                    )}
                    <span className="text-neutral-500">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>
                </div>

                {/* Day Details Expandable Panel */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-neutral-950/15">
                        
                        {/* Training Panel */}
                        <div className="space-y-3">
                          <h5 className="text-[10px] font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                            <Dumbbell size={13} className="text-cyan-400" />
                            Session Exercises ({day.exercises.length})
                          </h5>

                          {day.isRest ? (
                            <div className="p-5 bg-neutral-950 border border-white/5 rounded-xl text-center space-y-2">
                              <span className="text-xl">🔋</span>
                              <h6 className="text-xs font-black text-emerald-400 uppercase">Dynamic Recovery Rest Period</h6>
                              <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xs mx-auto">
                                No heavy loading. Prioritize neurological recovery, active stretching, and hydration.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Optional Morning Session */}
                              {day.morningSession && (
                                <div className="p-3 bg-gradient-to-r from-blue-950/10 to-neutral-950 border border-blue-500/10 rounded-xl space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/15 py-0.5 px-2 rounded font-black uppercase tracking-wider">
                                      🌅 {day.morningSession.title}
                                    </span>
                                    <span className="text-[9px] font-mono text-neutral-400">{day.morningSession.totalTime}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {day.morningSession.exercises.map(ex => (
                                      <span key={ex.name} className="text-[10px] bg-neutral-950 px-2 py-1 rounded-md border border-white/5 text-neutral-300">
                                        {ex.name} ({ex.sets}x{ex.reps})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Normal / Evening Session */}
                              <div className="space-y-2">
                                {day.exercises.map((ex, index) => (
                                  <div key={ex.id} className="p-3 bg-neutral-950 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-[9px] font-mono text-neutral-500">#{index + 1}</span>
                                      <div>
                                        <div className="font-black text-white uppercase tracking-tight leading-tight">{ex.name}</div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-bold uppercase mt-1">
                                          <span>{ex.sets} sets x {ex.reps} reps</span>
                                          <span className="w-1 h-1 rounded-full bg-white/15" />
                                          <span>Rest: {ex.rest}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-[9px] font-mono text-neutral-400 bg-neutral-900 border border-white/5 px-2 py-0.5 rounded-md">
                                      {ex.duration}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Mapped Diet Panel */}
                        <div className="space-y-3">
                          <h5 className="text-[10px] font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                            <Utensils size={13} className="text-emerald-400" />
                            Daily Linked Diet program ({day.diet.calories} kcal)
                          </h5>

                          <div className="bg-neutral-950 border border-white/5 rounded-xl divide-y divide-white/5">
                            {/* Title & Macros */}
                            <div className="p-3 flex items-center justify-between">
                              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">{day.diet.title}</span>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                                <span className="text-emerald-400 font-bold">{day.diet.protein}g P</span>
                                <span>•</span>
                                <span className="text-amber-500 font-bold">{day.diet.carbs}g C</span>
                                <span>•</span>
                                <span className="text-red-400 font-bold">{day.diet.fats}g F</span>
                              </div>
                            </div>

                            {/* Meals list */}
                            {day.diet.meals.map((meal) => (
                              <div key={meal.name} className="p-3 flex items-start justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                  <span className="font-black text-white uppercase tracking-wider text-[10px]">{meal.name}</span>
                                  <ul className="space-y-0.5">
                                    {meal.items.slice(0, 2).map((item, i) => (
                                      <li key={i} className="text-[10px] text-neutral-400 list-disc list-inside leading-relaxed truncate max-w-xs">
                                        {item}
                                      </li>
                                    ))}
                                    {meal.items.length > 2 && (
                                      <li className="text-[9px] text-neutral-500 italic">+ {meal.items.length - 2} more item</li>
                                    )}
                                  </ul>
                                </div>
                                <span className="text-[9px] font-mono text-neutral-500 bg-neutral-900 border border-white/5 px-2 py-0.5 rounded-md shrink-0">
                                  {meal.calories} kcal
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

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
  );
}
