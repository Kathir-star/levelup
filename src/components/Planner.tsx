import { useState, useEffect } from 'react';
import { UserProfile, MuscleGroup, Exercise, DayPlan } from '../types';
import { cn } from '../lib/utils';
import { 
  Calculator, 
  ClipboardList, 
  TrendingUp, 
  Droplets, 
  Flame, 
  Plus, 
  Trash2, 
  Timer as TimerIcon, 
  CheckCircle2, 
  Save,
  X,
  Play,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CircularTimer from './common/CircularTimer';

interface PlannerProps {
  userName: string;
  onProfileUpdate: (profile: UserProfile) => void;
}

export default function Planner({ userName, onProfileUpdate }: PlannerProps) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lvProfile');
    return saved ? JSON.parse(saved) : {
      name: userName,
      age: 24,
      gender: 'male',
      weight: 70,
      height: 175,
      goal: 'loss',
      level: 'beginner'
    };
  });

  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(() => {
    const saved = localStorage.getItem('lvGeneratedPlan');
    return saved ? JSON.parse(saved) : [];
  });

  const [customSplit, setCustomSplit] = useState('');
  const [isAddingToDay, setIsAddingToDay] = useState<string | null>(null);
  const [newEx, setNewEx] = useState<Exercise>({ name: '', sets: '3', reps: '12', rest: '60s' });
  const [showGenerator, setShowGenerator] = useState(weeklyPlan.length === 0);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('lvGeneratedPlan', JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  useEffect(() => {
    localStorage.setItem('lvProfile', JSON.stringify(profile));
  }, [profile]);

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    onProfileUpdate(updated);
  };

  const EXERCISE_LIB: Record<string, Record<string, Exercise[]>> = {
    'Chest': {
      'beginner': [{ name: 'Push-Ups', sets: '3', reps: '12-15', rest: '60s' }, { name: 'DB Bench Press', sets: '3', reps: '12', rest: '60s' }, { name: 'Incline DB Press', sets: '3', reps: '12', rest: '60s' }, { name: 'Plank', sets: '3', reps: '45s', rest: '45s' }],
      'intermediate': [{ name: 'BB Bench Press', sets: '4', reps: '10', rest: '90s' }, { name: 'Incline BB Press', sets: '3', reps: '12', rest: '75s' }, { name: 'Cable Flyes', sets: '3', reps: '15', rest: '60s' }, { name: 'Dips', sets: '3', reps: '12', rest: '60s' }],
      'advanced': [{ name: 'BB Bench Press', sets: '5', reps: '6-8', rest: '2min' }, { name: 'Incline BB Press', sets: '4', reps: '8', rest: '90s' }, { name: 'Weighted Dips', sets: '4', reps: '10', rest: '90s' }, { name: 'Cable Crossover', sets: '3', reps: '15', rest: '60s' }]
    },
    'Back': {
      'beginner': [{ name: 'Lat Pulldown', sets: '3', reps: '12', rest: '60s' }, { name: 'Seated Cable Row', sets: '3', reps: '12', rest: '60s' }, { name: 'Superman Hold', sets: '3', reps: '15', rest: '45s' }],
      'intermediate': [{ name: 'Pull-Ups', sets: '4', reps: '8-10', rest: '90s' }, { name: 'Barbell Row', sets: '4', reps: '10', rest: '90s' }, { name: 'Face Pulls', sets: '3', reps: '15', rest: '60s' }],
      'advanced': [{ name: 'Weighted Pull-Ups', sets: '5', reps: '6-8', rest: '2min' }, { name: 'Deadlift', sets: '4', reps: '5', rest: '3min' }, { name: 'T-Bar Row', sets: '4', reps: '8', rest: '2min' }]
    },
    'Legs': {
      'beginner': [{ name: 'Bodyweight Squat', sets: '4', reps: '20', rest: '60s' }, { name: 'Lunges', sets: '3', reps: '12/leg', rest: '60s' }, { name: 'Glute Bridges', sets: '3', reps: '20', rest: '45s' }],
      'intermediate': [{ name: 'BB Squat', sets: '4', reps: '10', rest: '2min' }, { name: 'Romanian DL', sets: '4', reps: '12', rest: '90s' }, { name: 'Leg Press', sets: '3', reps: '15', rest: '75s' }],
      'advanced': [{ name: 'BB Squat (Heavy)', sets: '5', reps: '6-8', rest: '3min' }, { name: 'Deadlift', sets: '4', reps: '5', rest: '3min' }, { name: 'Bulgarian Split Squat', sets: '4', reps: '10/leg', rest: '90s' }]
    }
  };

  const generatePlan = () => {
    const goal = profile.goal || 'loss';
    const level = profile.level || 'beginner';
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    let generatedSplit: DayPlan[] = [];

    if (customSplit.trim()) {
      const lines = customSplit.split('\n').filter(l => l.trim());
      generatedSplit = lines.map(line => {
        const parts = line.split(/[–\-:]/);
        const day = parts[0]?.trim() || 'Day';
        const focus = parts[1]?.trim() || 'Custom';
        
        const isRest = focus.toLowerCase().includes('rest');
        let exercises: Exercise[] = [];
        
        if (!isRest) {
          const muscle = focus.charAt(0).toUpperCase() + focus.slice(1).toLowerCase();
          exercises = EXERCISE_LIB[muscle]?.[level] || EXERCISE_LIB['Chest'][level];
        }

        return { day, focus, rest: isRest, exercises: exercises.map(ex => ({...ex})) };
      });
    } else {
      const defaultMuscles = ['Chest', 'Back', 'Legs', 'Shoulder', 'Arms', 'Full Body', 'Rest'];
      generatedSplit = days.map((day, i) => {
        const muscle = defaultMuscles[i];
        const isRest = muscle === 'Rest';
        return {
          day,
          focus: muscle,
          rest: isRest,
          exercises: isRest ? [] : (EXERCISE_LIB[muscle]?.[level] || EXERCISE_LIB['Chest'][level]).map(ex => ({...ex}))
        };
      });
    }

    setWeeklyPlan(generatedSplit);
    setShowGenerator(false);
  };

  const addExercise = (dayIdx: number) => {
    if (!newEx.name) return;
    const updated = [...weeklyPlan];
    updated[dayIdx].exercises = [...(updated[dayIdx].exercises || []), {...newEx}];
    updated[dayIdx].rest = false;
    setWeeklyPlan(updated);
    setNewEx({ name: '', sets: '3', reps: '12', rest: '60s' });
    setIsAddingToDay(null);
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    const updated = [...weeklyPlan];
    updated[dayIdx].exercises = updated[dayIdx].exercises?.filter((_, i) => i !== exIdx);
    if (updated[dayIdx].exercises?.length === 0) {
      updated[dayIdx].rest = true;
    }
    setWeeklyPlan(updated);
  };

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
  };

  const calculateNutrition = () => {
    const w = profile.weight || 70;
    const h = profile.height || 175;
    const a = profile.age || 24;
    
    const bmr = profile.gender === 'male'
      ? (10 * w) + (6.25 * h) - (5 * a) + 5
      : (10 * w) + (6.25 * h) - (5 * a) - 161;
    
    const tdee = Math.round(bmr * 1.55);
    const calTarget = profile.goal === 'loss' ? tdee - 400 : (profile.goal === 'gain' ? tdee + 500 : tdee);
    
    let protBase = profile.goal === 'loss' ? (profile.gender === 'male' ? 2.0 : 1.8) : (profile.gender === 'male' ? 2.2 : 2.0);
    if (a >= 50) protBase += 0.1;
    if (a < 18) protBase -= 0.1;
    
    const protein = Math.round(w * protBase);
    const carbs = profile.goal === 'loss' ? Math.round(w * 2.5) : (profile.goal === 'gain' ? Math.round(w * 5) : Math.round(w * 3.5));
    
    return { calories: calTarget, protein, carbs };
  };

  const nutrition = calculateNutrition();

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-br from-black to-[var(--card2)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 flex flex-wrap items-center gap-6 sm:gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[var(--red)] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[var(--accent-glow)] relative z-10">
          <ClipboardList size={40} className="sm:w-12 sm:h-12" />
        </div>
        <div className="flex-1 min-w-[280px] relative z-10">
          <h2 className="text-3xl sm:text-4xl font-display text-white tracking-tight mb-2 uppercase italic">Workout Planner</h2>
          <p className="text-[var(--muted)] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] italic mb-4">
            Professional logic for elite performance. Personalised and automated.
          </p>
          <button 
            onClick={() => setShowGenerator(!showGenerator)}
            className="px-6 py-2 bg-[var(--sub)] border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:border-[var(--red)] transition-all"
          >
            {showGenerator ? "Hide Settings" : "Configure Profile"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showGenerator && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 space-y-8 mb-8">
              <h3 className="tab-heading text-white italic">Setup Your Training Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Age</label>
                  <input 
                    type="number" 
                    value={profile.age} 
                    onChange={(e) => handleProfileChange('age', Number(e.target.value))}
                    className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--red)] outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Gender</label>
                  <select 
                    value={profile.gender}
                    onChange={(e) => handleProfileChange('gender', e.target.value)}
                    className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--red)] outline-none font-bold text-sm h-[46px]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={profile.weight} 
                    onChange={(e) => handleProfileChange('weight', Number(e.target.value))}
                    className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--red)] outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Goal</label>
                  <select 
                    value={profile.goal}
                    onChange={(e) => handleProfileChange('goal', e.target.value)}
                    className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--red)] outline-none font-bold text-sm h-[46px]"
                  >
                    <option value="loss">Fat Loss</option>
                    <option value="maintain">Maintain</option>
                    <option value="gain">Weight Gain</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Level</label>
                  <select 
                    value={profile.level}
                    onChange={(e) => handleProfileChange('level', e.target.value)}
                    className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--red)] outline-none font-bold text-sm h-[46px]"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Days/Week</label>
                  <select 
                    className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--red)] outline-none font-bold text-sm h-[46px]"
                  >
                    <option value="3">3 Days</option>
                    <option value="4">4 Days</option>
                    <option value="5">5 Days</option>
                    <option value="6">6 Days</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest italic flex items-center gap-2">
                  <Zap size={10} className="text-[var(--yellow)]" /> Custom Split (Optional - e.g. Monday: Chest)
                </label>
                <textarea 
                  value={customSplit}
                  onChange={(e) => setCustomSplit(e.target.value)}
                  placeholder="e.g. Monday - Chest&#10;Tuesday - Back..."
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-4 text-sm text-white focus:border-[var(--red)] outline-none min-h-[100px] font-mono"
                />
              </div>

              <button 
                onClick={generatePlan}
                className="w-full py-4 rounded-2xl bg-[var(--red)] text-white font-display font-black text-xl uppercase tracking-widest shadow-xl shadow-[var(--accent-glow)] hover:brightness-110 active:scale-[0.98] transition-all"
              >
                ⚡ Generate My Personalised Plan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Output */}
      {weeklyPlan.length > 0 && (
        <div className="space-y-12 animate-in fade-in duration-700">
           {/* Nutrition Summary */}
           <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8">
              <h3 className="tab-heading text-white italic mb-6">🥗 Personalised Nutrition Guide</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <div className="bg-black/20 p-5 rounded-2xl border border-[var(--border)] relative group hover:border-[var(--red)] transition-all">
                    <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest group-hover:text-[var(--red)] transition-colors">Protein Target</div>
                    <div className="text-3xl font-display font-black text-white mt-1 uppercase italic tracking-wider">{nutrition.protein}g <span className="text-xs text-[var(--muted)]">/day</span></div>
                    <Flame className="absolute top-4 right-4 text-[var(--red)]/20 group-hover:text-[var(--red)]/40 transition-colors" size={24} />
                 </div>
                 <div className="bg-black/20 p-5 rounded-2xl border border-[var(--border)] relative group hover:border-[var(--yellow)] transition-all">
                    <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest group-hover:text-[var(--yellow)] transition-colors">Carbs Target</div>
                    <div className="text-3xl font-display font-black text-white mt-1 uppercase italic tracking-wider">{nutrition.carbs}g <span className="text-xs text-[var(--muted)]">/day</span></div>
                    <Flame className="absolute top-4 right-4 text-[var(--yellow)]/20 group-hover:text-[var(--yellow)]/40 transition-colors" size={24} />
                 </div>
                 <div className="bg-black/20 p-5 rounded-2xl border border-[var(--border)] relative group hover:border-[var(--green)] transition-all">
                    <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest group-hover:text-[var(--green)] transition-colors">Daily Calories</div>
                    <div className="text-3xl font-display font-black text-white mt-1 uppercase italic tracking-wider">{nutrition.calories} <span className="text-xs text-[var(--muted)]">kcal</span></div>
                    <Flame className="absolute top-4 right-4 text-[var(--green)]/20 group-hover:text-[var(--green)]/40 transition-colors" size={24} />
                 </div>
              </div>
           </div>

           {/* Weekly Split Cards */}
           <div className="space-y-6">
              <h3 className="tab-heading text-white italic">🗓️ Your Training Schedule</h3>
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                 {weeklyPlan.map((day, dIdx) => (
                    <div key={day.day} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:border-[var(--red)]/50 transition-all group">
                       <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-black/10">
                          <div className="flex items-center gap-6">
                             <div className="text-sm font-black text-[var(--red)] uppercase tracking-[0.2em] w-20">{day.day}</div>
                             <div className="flex flex-col">
                                <div className="text-xl font-display text-white uppercase italic tracking-wider group-hover:text-[var(--red)] transition-colors">{day.focus}</div>
                                {!day.rest && <div className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest mt-1 italic">{day.exercises?.length} EXERCISES LOADED</div>}
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <button 
                                onClick={() => setIsAddingToDay(day.day)}
                                className="p-2 rounded-xl bg-[var(--sub)] border border-[var(--border)] hover:text-white hover:border-white transition-all text-[var(--muted)]"
                                title="Add custom exercise"
                             >
                                <Plus size={18} />
                             </button>
                             {day.rest ? (
                                <span className="bg-white/5 text-[var(--muted)] text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full border border-white/5 italic">REST DAY</span>
                             ) : (
                                <div className="bg-[var(--red)]/10 text-[var(--red)] text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full border border-[var(--red)]/20 flex items-center gap-2 italic">
                                   <Flame size={12} /> Training
                                </div>
                             )}
                          </div>
                       </div>

                       {!day.rest && day.exercises && day.exercises.length > 0 && (
                          <div className="overflow-x-auto">
                             <table className="w-full text-left border-collapse">
                                <thead>
                                   <tr className="border-b border-white/5 bg-black/5">
                                      <th className="py-3 px-6 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Exercise</th>
                                      <th className="py-3 px-6 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-center">Sets</th>
                                      <th className="py-3 px-6 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-center">Reps</th>
                                      <th className="py-3 px-6 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-center">Rest</th>
                                      <th className="py-3 px-6 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-right">Delete</th>
                                   </tr>
                                </thead>
                                <tbody>
                                   {day.exercises.map((ex, exIdx) => (
                                      <tr key={exIdx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group-table">
                                         <td className="py-4 px-6">
                                            <div className="font-bold text-white text-sm">{ex.name}</div>
                                            <div className="text-[10px] text-[var(--muted)] uppercase font-black tracking-widest italic mt-0.5">{profile.level} INTENSITY</div>
                                         </td>
                                         <td className="py-4 px-6 font-black text-[var(--red)] text-center text-sm">{ex.sets}</td>
                                         <td className="py-4 px-6 text-white text-center text-sm font-medium">{ex.reps}</td>
                                         <td className="py-4 px-6 text-center">
                                            <button 
                                               onClick={() => startTimer(parseInt(ex.rest) || 60)}
                                               className="bg-[var(--sub)] hover:border-white border border-[var(--border)] rounded-lg px-3 py-1 text-[10px] font-black text-white transition-all inline-flex items-center gap-2"
                                            >
                                               {ex.rest} <TimerIcon size={12} className="text-[var(--blue)]" />
                                            </button>
                                         </td>
                                         <td className="py-4 px-6 text-right">
                                            <button onClick={() => removeExercise(dIdx, exIdx)} className="text-[var(--muted)] hover:text-[var(--red)] transition-all">
                                               <Trash2 size={16} />
                                            </button>
                                         </td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       )}

                       {day.rest && (
                          <div className="p-10 text-center bg-black/20">
                             <div className="text-[var(--muted)] text-sm italic font-bold uppercase tracking-widest">Active Recovery: Walk 20-30m, Stretch, and Hydrate 💧</div>
                          </div>
                       )}
                    </div>
                 ))}
              </div>
              <button 
                onClick={() => window.print()}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)] text-white font-display font-black text-lg uppercase tracking-widest hover:border-white transition-all shadow-xl"
              >
                🖨️ Export to PDF / Print
              </button>
           </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      <AnimatePresence>
        {isAddingToDay && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--card)] border-2 border-[var(--red)]/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => setIsAddingToDay(null)} className="absolute top-4 right-4 text-[var(--muted)] hover:text-white transition-colors"><X size={24} /></button>
              <h3 className="text-3xl font-display text-white uppercase italic tracking-wider mb-8">Add Exercise</h3>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Exercise Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bench Press"
                    value={newEx.name}
                    onChange={(e) => setNewEx({...newEx, name: e.target.value})}
                    className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-4 text-white focus:border-[var(--red)] outline-none mt-2 font-bold"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Sets</label>
                    <input 
                      type="text" 
                      value={newEx.sets}
                      onChange={(e) => setNewEx({...newEx, sets: e.target.value})}
                      className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--red)] outline-none mt-2 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Reps</label>
                    <input 
                      type="text" 
                      value={newEx.reps}
                      onChange={(e) => setNewEx({...newEx, reps: e.target.value})}
                      className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--red)] outline-none mt-2 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Rest</label>
                    <input 
                      type="text" 
                      value={newEx.rest}
                      onChange={(e) => setNewEx({...newEx, rest: e.target.value})}
                      className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-3 text-white focus:border-[var(--red)] outline-none mt-2 text-center font-bold"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const idx = weeklyPlan.findIndex(d => d.day === isAddingToDay);
                    if (idx !== -1) addExercise(idx);
                  }}
                  className="w-full py-4 rounded-2xl bg-[var(--red)] text-white font-display font-black text-xl uppercase tracking-widest shadow-xl shadow-[var(--accent-glow)] hover:brightness-110 transition-all mt-4"
                >
                  Confirm & Add
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {timeLeft !== null && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <CircularTimer 
              initialSeconds={timeLeft}
              onClose={() => setTimeLeft(null)}
              onComplete={() => setTimeLeft(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
