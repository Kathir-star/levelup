import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Utensils, 
  CheckCircle2, 
  Flame, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Activity, 
  Award,
  Zap,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { cn } from '../../lib/utils';
import AnimatedCard from './AnimatedCard';
import { generateStructuredPlan, GeneratedDay, GeneratedExercise } from '../../utils/planGenerator';

interface TodayPlanPanelProps {
  userProfile: {
    name: string;
    goal?: 'loss' | 'maintain' | 'gain';
    level?: 'beginner' | 'intermediate' | 'advanced';
    weight?: number;
    gender?: 'male' | 'female';
  };
  onAddXp?: (xp: number) => void;
  triggerToast?: (msg: string, type?: string) => void;
}

export default function TodayPlanPanel({ userProfile, onAddXp, triggerToast }: TodayPlanPanelProps) {
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  // Level, goal fallback values
  const level = userProfile.level || 'beginner';
  const goal = userProfile.goal || 'loss';
  const weight = userProfile.weight || 75;
  const gender = userProfile.gender || 'male';

  // 1. Generate full week plan and pick today's day
  const weekPlan = generateStructuredPlan(level, goal, weight, gender);
  const todayPlan = weekPlan.find(d => d.day === todayName) || weekPlan[0];

  // 2. States for exercise/meal completion
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`lvl_comp_ex_${todayStr}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`lvl_comp_meals_${todayStr}`);
    return saved ? JSON.parse(saved) : {};
  });

  // UI Expand/Collapse
  const [isWorkoutExpanded, setIsWorkoutExpanded] = useState(true);
  const [isDietExpanded, setIsDietExpanded] = useState(true);
  const [activeExerciseDetail, setActiveExerciseDetail] = useState<string | null>(null);

  // Synchronize state with LocalStorage
  useEffect(() => {
    localStorage.setItem(`lvl_comp_ex_${todayStr}`, JSON.stringify(completedExercises));
  }, [completedExercises, todayStr]);

  useEffect(() => {
    localStorage.setItem(`lvl_comp_meals_${todayStr}`, JSON.stringify(completedMeals));
  }, [completedMeals, todayStr]);

  // Calculations for progress
  const totalExercises = todayPlan.exercises.length;
  const completedExercisesCount = todayPlan.exercises.filter(ex => completedExercises[ex.id]).length;
  const exerciseProgressPct = totalExercises > 0 ? Math.round((completedExercisesCount / totalExercises) * 100) : 100;

  // Approximate time spent
  const totalWorkoutTimeMin = todayPlan.totalTimeMinutes;
  const estimatedTimeSpent = totalExercises > 0 
    ? Math.round((completedExercisesCount / totalExercises) * totalWorkoutTimeMin) 
    : 0;

  // Meal calculations
  const totalMeals = todayPlan.diet.meals.length;
  const completedMealsCount = todayPlan.diet.meals.filter(meal => completedMeals[meal.name]).length;
  const dietProgressPct = totalMeals > 0 ? Math.round((completedMealsCount / totalMeals) * 100) : 0;

  // Handlers
  const handleToggleExercise = (exId: string, exName: string) => {
    const isNowCompleted = !completedExercises[exId];
    setCompletedExercises(prev => ({
      ...prev,
      [exId]: isNowCompleted
    }));

    if (isNowCompleted) {
      if (onAddXp) onAddXp(15);
      if (triggerToast) triggerToast(`Exercise completed: +15 XP earned! 🏋️`, 'success');
    }
  };

  const handleToggleMeal = (mealName: string) => {
    const isNowCompleted = !completedMeals[mealName];
    setCompletedMeals(prev => ({
      ...prev,
      [mealName]: isNowCompleted
    }));

    if (isNowCompleted) {
      if (onAddXp) onAddXp(10);
      if (triggerToast) triggerToast(`Fuel plan logged: +10 XP earned! 🥗`, 'success');
    }
  };

  return (
    <div className="space-y-4">
      {/* HUD Header for Today's Plan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/5">
        <div>
          <span className="text-[9px] font-black uppercase text-cyan-400 tracking-[0.2em] font-mono flex items-center gap-1">
            <Sparkles size={11} className="animate-pulse text-cyan-400" />
            Adaptive AI Coach Program
          </span>
          <h2 className="text-xl font-display font-black tracking-tight text-white uppercase italic leading-none mt-1">
            🎯 Today's Protocol ({todayName})
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">AI Adjusted for</div>
            <div className="text-xs font-black text-cyan-400 uppercase tracking-tight mt-1 leading-none">
              {level} • {goal === 'loss' ? 'Weight Loss' : goal === 'gain' ? 'Muscle Gain' : 'Power Maintenance'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Progress Tracker Card */}
        <AnimatedCard 
          glowColor="rgba(6, 182, 212, 0.25)"
          className="p-4 bg-gradient-to-br from-cyan-950/15 to-neutral-900/50"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Workout Progress</span>
              <div className="text-2xl font-display font-black text-white leading-none">
                {completedExercisesCount} <span className="text-xs text-neutral-400 font-bold">/ {totalExercises} EX</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Dumbbell size={16} />
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[10px] uppercase font-black text-neutral-400">
              <span>Exercises Completed</span>
              <span className="text-cyan-400">{exerciseProgressPct}%</span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${exerciseProgressPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </AnimatedCard>

        {/* Time spent card */}
        <AnimatedCard 
          glowColor="rgba(239, 68, 68, 0.25)"
          className="p-4 bg-gradient-to-br from-red-950/15 to-neutral-900/50"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Time Commitment</span>
              <div className="text-2xl font-display font-black text-white leading-none">
                {estimatedTimeSpent} <span className="text-xs text-neutral-400 font-bold">/ {totalWorkoutTimeMin} MIN</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Clock size={16} />
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[10px] uppercase font-black text-neutral-400">
              <span>Estimated Time Active</span>
              <span className="text-red-400">{totalWorkoutTimeMin - estimatedTimeSpent}m left</span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${totalExercises > 0 ? (completedExercisesCount / totalExercises) * 100 : 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </AnimatedCard>

        {/* Diet intake card */}
        <AnimatedCard 
          glowColor="rgba(16, 185, 129, 0.25)"
          className="p-4 bg-gradient-to-br from-emerald-950/15 to-neutral-900/50"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Daily Target Fuel</span>
              <div className="text-xl font-display font-black text-white leading-tight">
                {todayPlan.diet.calories} kcal • <span className="text-emerald-400">{todayPlan.diet.protein}g protein</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Utensils size={15} />
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[10px] uppercase font-black text-neutral-400">
              <span>Diet Adherence Progress</span>
              <span className="text-emerald-400">{dietProgressPct}%</span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${dietProgressPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Main Split Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* LEFT COLUMN: WORKOUT CARD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell size={16} className="text-cyan-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {todayPlan.isRest ? "Active Rest Program" : "Scheduled Training Protocol"}
              </h3>
            </div>
            <button 
              onClick={() => setIsWorkoutExpanded(prev => !prev)}
              className="p-1.5 bg-neutral-900 border border-white/5 rounded-lg text-neutral-400 hover:text-white transition"
            >
              {isWorkoutExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isWorkoutExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-2.5"
              >
                <div className="bg-[#0b0c10] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  {/* Title Bar */}
                  <div className="p-4 bg-neutral-900/40 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">{todayPlan.focus}</h4>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5 font-mono">
                        Intensity Level: <span className="text-red-400">{level.toUpperCase()}</span> • Split Type: <span className="text-cyan-400">{todayPlan.type}</span>
                      </p>
                    </div>
                    {!todayPlan.isRest && (
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 py-1 px-2.5 rounded-lg font-black uppercase tracking-wider font-mono shrink-0">
                        {todayPlan.totalTime}
                      </span>
                    )}
                  </div>

                  {/* Exercises Checklist */}
                  {todayPlan.isRest ? (
                    <div className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/15">
                        <Activity size={20} className="animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-sm font-black text-emerald-400 uppercase tracking-wide">CNS Recovery & Reset Protocal</h5>
                        <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
                          Excellent job. Today is dedicated strictly to cognitive restoration, somatic recovery, and light muscle lengthening stretches. Avoid heavy load.
                        </p>
                      </div>
                      <div className="bg-neutral-950/50 p-3 rounded-xl border border-white/5 text-[10px] text-neutral-400 uppercase font-bold tracking-wider max-w-md mx-auto">
                        🧘 Suggested Focus: 15-20 min light walking + core/joint stability stretches
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {todayPlan.exercises.map((ex, index) => {
                        const isDone = completedExercises[ex.id] || false;
                        const isExpanded = activeExerciseDetail === ex.id;
                        return (
                          <div 
                            key={ex.id}
                            className={cn(
                              "transition-all",
                              isDone ? "bg-emerald-950/5" : "hover:bg-white/[0.01]"
                            )}
                          >
                            <div className="p-3.5 flex items-center justify-between gap-3 select-none">
                              <div className="flex items-center gap-3">
                                {/* Completion Checkbox */}
                                <button
                                  onClick={() => handleToggleExercise(ex.id, ex.name)}
                                  className={cn(
                                    "w-6.5 h-6.5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0",
                                    isDone 
                                      ? "bg-emerald-500 border-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/15" 
                                      : "border-white/10 text-transparent hover:border-white/30"
                                  )}
                                >
                                  <CheckCircle2 size={13} strokeWidth={3} />
                                </button>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-neutral-500">#{index + 1}</span>
                                    <span className={cn(
                                      "text-xs font-black uppercase tracking-tight",
                                      isDone ? "text-neutral-500 line-through" : "text-white"
                                    )}>
                                      {ex.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-bold text-neutral-400 uppercase font-mono">
                                      {ex.sets} sets x {ex.reps} reps
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-white/10" />
                                    <span className="text-[9px] font-bold text-neutral-400 uppercase font-mono">
                                      Rest: {ex.rest}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 border border-white/5 rounded-md">
                                  {ex.duration}
                                </span>
                                <button
                                  onClick={() => setActiveExerciseDetail(isExpanded ? null : ex.id)}
                                  className="p-1 text-neutral-500 hover:text-white transition cursor-pointer"
                                >
                                  <Info size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Expandable Info Detail Box */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="px-4 pb-4 overflow-hidden"
                                >
                                  <div className="p-3 bg-neutral-950 rounded-xl border border-white/5 space-y-2 text-[11px]">
                                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider font-mono">
                                      <Zap size={11} /> Primary Target Muscles
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {ex.targetMuscles.map(m => (
                                        <span key={m} className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                          {m}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="text-neutral-400 leading-relaxed mt-1">
                                      {ex.notes || "Execute with strict clinical range of motion. Mind-muscle connectivity takes priority over raw weights load."}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: DIET/FUEL CARD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils size={15} className="text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Daily Fuel Intake Protocol</h3>
            </div>
            <button 
              onClick={() => setIsDietExpanded(prev => !prev)}
              className="p-1.5 bg-neutral-900 border border-white/5 rounded-lg text-neutral-400 hover:text-white transition"
            >
              {isDietExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isDietExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-2.5"
              >
                <div className="bg-[#0b0c10] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  {/* Title Bar */}
                  <div className="p-4 bg-neutral-900/40 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">{todayPlan.diet.title}</h4>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5 font-mono">
                        Optimal fuel for recovery and adaptive muscle protein synthesis
                      </p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-1 px-2.5 rounded-lg font-black uppercase tracking-wider font-mono shrink-0">
                      {todayPlan.diet.calories} KCAL
                    </span>
                  </div>

                  {/* Macro breakdown panel */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-950/40 border-b border-white/5 text-center font-mono">
                    <div className="bg-neutral-950/50 p-2 rounded-xl border border-white/5">
                      <div className="text-[12px] font-black text-emerald-400">{todayPlan.diet.protein}g</div>
                      <div className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Protein</div>
                    </div>
                    <div className="bg-neutral-950/50 p-2 rounded-xl border border-white/5">
                      <div className="text-[12px] font-black text-amber-500">{todayPlan.diet.carbs}g</div>
                      <div className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Carbs</div>
                    </div>
                    <div className="bg-neutral-950/50 p-2 rounded-xl border border-white/5">
                      <div className="text-[12px] font-black text-red-400">{todayPlan.diet.fats}g</div>
                      <div className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Fats</div>
                    </div>
                  </div>

                  {/* Meals checklist */}
                  <div className="divide-y divide-white/5">
                    {todayPlan.diet.meals.map((meal) => {
                      const isDone = completedMeals[meal.name] || false;
                      return (
                        <div 
                          key={meal.name}
                          className={cn(
                            "p-3.5 flex items-start gap-3 select-none transition-all",
                            isDone ? "bg-emerald-950/5" : "hover:bg-white/[0.01]"
                          )}
                        >
                          <button
                            onClick={() => handleToggleMeal(meal.name)}
                            className={cn(
                              "w-6.5 h-6.5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5",
                              isDone 
                                ? "bg-emerald-500 border-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/15" 
                                : "border-white/10 text-transparent hover:border-white/30"
                            )}
                          >
                            <CheckCircle2 size={13} strokeWidth={3} />
                          </button>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "text-xs font-black uppercase tracking-wider",
                                isDone ? "text-neutral-500 line-through" : "text-white"
                              )}>
                                {meal.name}
                              </span>
                              <span className="text-[9px] font-mono text-neutral-500 bg-neutral-950 border border-white/5 px-2 py-0.5 rounded-md shrink-0">
                                {meal.calories} kcal • {meal.protein}g protein
                              </span>
                            </div>

                            <ul className="space-y-1">
                              {meal.items.map((item, i) => (
                                <li 
                                  key={i} 
                                  className={cn(
                                    "text-[11px] leading-relaxed flex items-start gap-1.5",
                                    isDone ? "text-neutral-600 line-through" : "text-neutral-400"
                                  )}
                                >
                                  <span className="text-emerald-500 mt-1 shrink-0">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
