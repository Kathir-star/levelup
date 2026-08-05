import { useState, useMemo, useEffect } from 'react';
import { MuscleGroup, WorkoutEntry } from '../types';
import { cn } from '../lib/utils';
import { 
  Plus, Search, Filter, MessageSquare, History, Activity, Trophy, 
  CheckCircle2, RefreshCcw, Info, AlertTriangle, ShieldAlert, Trash2, 
  Edit3, Check, X, Calendar, Database, Download, Flame, Zap, Clock, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  insertWorkoutLogToSupabase, 
  calculateMuscleRecovery, 
  calculate7DayMuscleFrequency, 
  generateWeeklyBalanceInsight 
} from '../lib/supabase';

interface WorkoutLogProps {
  onLog: (entry: WorkoutEntry) => void;
  todayEntries: WorkoutEntry[];
  history: WorkoutEntry[];
  prs: Record<string, { weight: number, reps: number, date: string }>;
  onDeleteEntry?: (date: string, index: number) => void;
  onEditEntry?: (date: string, index: number, updated: WorkoutEntry) => void;
  fullHistory?: Record<string, WorkoutEntry[]>;
}

const MOODS = [
  { id: 'strong', label: 'Strong', emoji: '🔥', color: 'bg-red-500' },
  { id: 'tired', label: 'Tired', emoji: '😓', color: 'bg-blue-500' },
  { id: 'pumped', label: 'Pumped', emoji: '💪', color: 'bg-green-500' },
];

export default function WorkoutLog({ onLog, todayEntries, history, prs, onDeleteEntry, onEditEntry, fullHistory }: WorkoutLogProps) {
  // In-place editing states
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');
  const [editSets, setEditSets] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Date filters for viewing history
  const [dateFilter, setDateFilter] = useState('');

  // TASK 3: Date picker for backdated logging (Last 3 Days Only)
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const dayBeforeYesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().slice(0, 10);
  }, []);

  const [selectedLogDate, setSelectedLogDate] = useState<string>(todayStr);

  // Auto-save user entries (localStorage)
  const [muscle, setMuscle] = useState<MuscleGroup>(() => 
    (localStorage.getItem('lv_draft_muscle') as MuscleGroup) || 'Chest'
  );
  const [exerciseName, setExerciseName] = useState(() => 
    localStorage.getItem('lv_draft_exerciseName') || ''
  );
  const [weight, setWeight] = useState(() => 
    localStorage.getItem('lv_draft_weight') || ''
  );
  const [reps, setReps] = useState(() => 
    localStorage.getItem('lv_draft_reps') || ''
  );
  const [sets, setSets] = useState(() => 
    localStorage.getItem('lv_draft_sets') || ''
  );
  const [notes, setNotes] = useState(() => 
    localStorage.getItem('lv_draft_notes') || ''
  );
  const [selectedMood, setSelectedMood] = useState(() => 
    localStorage.getItem('lv_draft_selectedMood') || 'pumped'
  );

  const [search, setSearch] = useState('');
  const [validationError, setValidationError] = useState('');
  const [overrideProgressLock, setOverrideProgressLock] = useState(false);
  const [showProgressLockWarning, setShowProgressLockWarning] = useState(false);
  const [msg, setMsg] = useState('');
  const [logState, setLogState] = useState<'idle' | 'logging' | 'success'>('idle');

  // Sync draft edits to localStorage
  useEffect(() => {
    localStorage.setItem('lv_draft_muscle', muscle);
    localStorage.setItem('lv_draft_exerciseName', exerciseName);
    localStorage.setItem('lv_draft_weight', weight);
    localStorage.setItem('lv_draft_reps', reps);
    localStorage.setItem('lv_draft_sets', sets);
    localStorage.setItem('lv_draft_notes', notes);
    localStorage.setItem('lv_draft_selectedMood', selectedMood);
  }, [muscle, exerciseName, weight, reps, sets, notes, selectedMood]);

  // TASK 4: Smart Recovery Indicators & Weekly Balance Insight
  const recoveryMap = useMemo(() => calculateMuscleRecovery(history), [history]);
  const frequencyMap = useMemo(() => calculate7DayMuscleFrequency(history), [history]);
  const weeklyInsightText = useMemo(() => generateWeeklyBalanceInsight(frequencyMap), [frequencyMap]);

  const filteredHistory = useMemo(() => {
    return history.filter(n => {
      const matchesSearch = n.notes?.toLowerCase().includes(search.toLowerCase()) || 
        n.muscle.toLowerCase().includes(search.toLowerCase()) ||
        n.exerciseName?.toLowerCase().includes(search.toLowerCase());
      const matchesDate = !dateFilter || (n.workout_date || n.date) === dateFilter;
      return matchesSearch && matchesDate;
    }).slice(0, 15);
  }, [history, search, dateFilter]);

  // Compute consecutive days of training from history (Streak tracking)
  const consecutiveDays = useMemo(() => {
    const dates = Array.from(new Set(history.map(h => h.workout_date || h.date))).sort();
    if (dates.length === 0) return 0;

    let consecutive = 1;
    let current = new Date(dates[dates.length - 1]);
    for (let i = dates.length - 2; i >= 0; i--) {
      const prev = new Date(dates[i]);
      const diffTime = Math.abs(current.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        consecutive++;
        current = prev;
      } else if (diffDays > 1) {
        break;
      }
    }
    return consecutive;
  }, [history]);

  // TASK 3: Duplicate Entry Detection
  const duplicateEntry = useMemo(() => {
    const targetName = (exerciseName || muscle).toLowerCase().trim();
    return history.find(h => {
      const hDate = h.workout_date || h.date;
      const hName = (h.exerciseName || h.muscle).toLowerCase().trim();
      return hDate === selectedLogDate && hName === targetName;
    });
  }, [history, selectedLogDate, exerciseName, muscle]);

  // Progress Lock Analysis: is weight more than 50% higher than the current PR?
  const prKey = useMemo(() => {
    const key = exerciseName ? exerciseName.toLowerCase().trim() : muscle.toLowerCase();
    return key;
  }, [exerciseName, muscle]);

  const existingPR = useMemo(() => prs[prKey], [prs, prKey]);

  const isProgressSpike = useMemo(() => {
    if (!existingPR || !weight) return false;
    const wNum = Number(weight);
    return wNum > existingPR.weight * 1.5;
  }, [existingPR, weight]);

  useEffect(() => {
    if (isProgressSpike) {
      setShowProgressLockWarning(true);
    } else {
      setShowProgressLockWarning(false);
      setOverrideProgressLock(false);
    }
  }, [isProgressSpike]);

  // TASK 4: Quick Log Mode handlers
  const handleQuickLog = (preset: 'Push' | 'Pull' | 'Legs') => {
    if (preset === 'Push') {
      setMuscle('Chest');
      setExerciseName('Bench Press');
      setSets('4');
      setReps('10');
      setWeight('60');
      setNotes('⚡ Quick Push preset loaded');
    } else if (preset === 'Pull') {
      setMuscle('Back');
      setExerciseName('Lat Pulldown');
      setSets('4');
      setReps('10');
      setWeight('50');
      setNotes('⚡ Quick Pull preset loaded');
    } else if (preset === 'Legs') {
      setMuscle('Quadriceps');
      setExerciseName('Barbell Squats');
      setSets('4');
      setReps('10');
      setWeight('70');
      setNotes('⚡ Quick Legs preset loaded');
    }
  };

  const handleSave = async () => {
    setValidationError('');
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (!weight) {
      setValidationError('⚠️ Weight is a required input.');
      return;
    }

    const wNum = Number(weight);
    const rNum = Number(reps) || 0;
    const sNum = Number(sets) || 0;

    if (wNum < 0 || rNum < 0 || sNum < 0) {
      setValidationError('⚠️ Inputs cannot be negative.');
      return;
    }
    if (wNum > 351) {
      setValidationError('⚠️ SAFE LIMIT VIOLATION: Weight cannot exceed 350kg for safety and spinal protection limits.');
      return;
    }
    if (rNum > 100) {
      setValidationError('⚠️ SAFE LIMIT VIOLATION: Reps cannot exceed 100 in a single set.');
      return;
    }
    if (sNum > 15) {
      setValidationError('⚠️ SAFE LIMIT VIOLATION: Sets cannot exceed 15 for a single exercise entry.');
      return;
    }

    if (isProgressSpike && !overrideProgressLock) {
      setValidationError('⚠️ PROGRESS LOCK ACTIVE: Logged weight is 50%+ higher than your historical PR.');
      return;
    }

    setLogState('logging');

    const moodEmoji = MOODS.find(m => m.id === selectedMood)?.emoji || '💪';
    const isBackdated = selectedLogDate !== todayStr;

    const entry: WorkoutEntry = {
      muscle,
      exerciseName: exerciseName.trim(),
      weight: wNum,
      reps: rNum,
      sets: sNum,
      notes: `${moodEmoji} ${notes.trim()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: selectedLogDate,
      workout_date: selectedLogDate,
      logged_late: isBackdated
    };

    // Sync to Supabase in background
    insertWorkoutLogToSupabase(entry);

    await new Promise(resolve => setTimeout(resolve, 600));
    
    onLog(entry);
    
    setLogState('success');
    
    setExerciseName('');
    setWeight('');
    setReps('');
    setSets('');
    setNotes('');
    setOverrideProgressLock(false);
    setShowProgressLockWarning(false);

    localStorage.removeItem('lv_draft_exerciseName');
    localStorage.removeItem('lv_draft_weight');
    localStorage.removeItem('lv_draft_reps');
    localStorage.removeItem('lv_draft_sets');
    localStorage.removeItem('lv_draft_notes');
    
    setTimeout(() => {
      setLogState('idle');
      setMsg(isBackdated ? 'Backdated Workout Saved ✔' : 'Workout Saved ✔');
      setTimeout(() => setMsg(''), 3000);
    }, 1200);
  };

  const selectedMuscleRecovery = recoveryMap[muscle] || { status: 'green', label: 'Ready to train' };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <AnimatePresence>
        {logState !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center backdrop-blur-md rounded-3xl overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="bg-[var(--card)] border border-[var(--border)] p-12 rounded-[2rem] shadow-2xl flex flex-col items-center gap-6"
            >
              {logState === 'logging' ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full shadow-[0_0_20px_var(--accent-glow)]"
                  />
                  <div className="text-xl font-black uppercase tracking-widest text-white">Logging Session...</div>
                </>
              ) : (
                <>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="w-20 h-20 bg-[var(--green)]/20 rounded-full flex items-center justify-center text-[var(--green)] shadow-[0_0_40px_rgba(34,197,94,0.3)]"
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-2xl font-black uppercase tracking-widest text-white">Exercise Saved!</div>
                    <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.3em]">Great intensity today</div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TASK 4: Weekly Balance Insight & Streak Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-[var(--border)] md:col-span-2 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Weekly Balance Insight</div>
            <p className="text-xs text-white/90 font-medium mt-0.5 leading-relaxed">{weeklyInsightText}</p>
          </div>
        </div>

        <div className="glass-card p-5 border border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Flame size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Workout Streak</div>
              <div className="text-lg font-black text-white">{consecutiveDays} Days Active</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--accent)]/20 rounded-2xl flex items-center justify-center text-[var(--accent)]">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Log Session</h2>
                <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest">Track your sets with precision</p>
              </div>
            </div>

            {/* TASK 4: Quick Log Preset Mode */}
            <div className="flex items-center gap-1.5 bg-[var(--sub)] p-1.5 rounded-2xl border border-[var(--border)]">
              <span className="text-[9px] font-black uppercase text-[var(--muted)] px-1">Quick:</span>
              <button 
                onClick={() => handleQuickLog('Push')}
                className="px-2.5 py-1 bg-[var(--card)] hover:bg-[var(--accent)] hover:text-white rounded-xl text-[10px] font-black uppercase text-white transition-all cursor-pointer border border-[var(--border)]"
              >
                Push
              </button>
              <button 
                onClick={() => handleQuickLog('Pull')}
                className="px-2.5 py-1 bg-[var(--card)] hover:bg-[var(--accent)] hover:text-white rounded-xl text-[10px] font-black uppercase text-white transition-all cursor-pointer border border-[var(--border)]"
              >
                Pull
              </button>
              <button 
                onClick={() => handleQuickLog('Legs')}
                className="px-2.5 py-1 bg-[var(--card)] hover:bg-[var(--accent)] hover:text-white rounded-xl text-[10px] font-black uppercase text-white transition-all cursor-pointer border border-[var(--border)]"
              >
                Legs
              </button>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* TASK 3: Backdated Workout Date Selector (Last 3 Days Only) */}
            <div className="space-y-2 p-4 bg-[var(--sub)]/60 border border-[var(--border)] rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] flex items-center gap-1.5">
                  <Calendar size={14} /> Log Date (Last 3 Days)
                </label>
                {selectedLogDate !== todayStr && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full flex items-center gap-1">
                    <Clock size={10} /> Backdated Mode (Logged Late = True)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedLogDate(todayStr)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer",
                    selectedLogDate === todayStr 
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent-glow)]" 
                      : "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-white"
                  )}
                >
                  Today ({todayStr.slice(8)})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLogDate(yesterdayStr)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer",
                    selectedLogDate === yesterdayStr 
                      ? "bg-yellow-500 text-black font-black border-yellow-500 shadow-md shadow-yellow-500/20" 
                      : "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-white"
                  )}
                >
                  Yesterday ({yesterdayStr.slice(8)})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLogDate(dayBeforeYesterdayStr)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer",
                    selectedLogDate === dayBeforeYesterdayStr 
                      ? "bg-amber-600 text-white font-black border-amber-600 shadow-md shadow-amber-600/20" 
                      : "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-white"
                  )}
                >
                  2 Days Ago ({dayBeforeYesterdayStr.slice(8)})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="tab-heading">Muscle Group</label>
                  
                  {/* TASK 4: Muscle Recovery Badge */}
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                    selectedMuscleRecovery.status === 'red' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                    selectedMuscleRecovery.status === 'yellow' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                    "bg-green-500/20 text-green-400 border-green-500/30"
                  )}>
                    {selectedMuscleRecovery.status === 'red' ? 'Rest Needed' :
                     selectedMuscleRecovery.status === 'yellow' ? 'Recovering' : 'Ready'}
                  </span>
                </div>
                <select 
                  value={muscle} 
                  onChange={(e) => setMuscle(e.target.value as MuscleGroup)}
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--accent)] transition-all outline-none font-bold"
                >
                  <option>Chest</option>
                  <option>Back</option>
                  <option>Legs</option>
                  <option>Biceps</option>
                  <option>Triceps</option>
                  <option>Shoulder</option>
                  <option>Abs</option>
                  <option>Quadriceps</option>
                  <option>Hamstrings</option>
                  <option>Glutes</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="tab-heading">Mood Tag</label>
                <div className="flex gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMood(m.id)}
                      className={cn(
                        "flex-1 py-3 rounded-2xl border text-lg transition-all cursor-pointer",
                        selectedMood === m.id ? "bg-[var(--accent)] border-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]" : "bg-[var(--sub)] border-[var(--border)] opacity-50"
                      )}
                      title={m.label}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="tab-heading">Exercise Name (Optional)</label>
              <input 
                type="text" 
                value={exerciseName} 
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g. Bench Press" 
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--accent)] transition-all outline-none font-bold"
              />
            </div>

            {/* TASK 3: Duplicate Warning if existing entry for same date & exercise */}
            {duplicateEntry && (
              <div className="p-3 bg-blue-500/15 border border-blue-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-blue-300 font-bold">
                <Info size={16} className="shrink-0 text-blue-400" />
                An entry for "{duplicateEntry.exerciseName || duplicateEntry.muscle}" already exists on {selectedLogDate}. Saving will add to your workout session log.
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="tab-heading">Weight (kg)</label>
                <input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0" 
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--accent)] transition-all outline-none font-black text-xl text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="tab-heading">Reps</label>
                <input 
                  type="number" 
                  value={reps} 
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="0" 
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--accent)] transition-all outline-none font-black text-xl text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="tab-heading">Sets</label>
                <input 
                  type="number" 
                  value={sets} 
                  onChange={(e) => setSets(e.target.value)}
                  placeholder="0" 
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--accent)] transition-all outline-none font-black text-xl text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="tab-heading">Session Notes</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the set feel?..." 
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--accent)] transition-all outline-none min-h-[90px] resize-none italic text-sm"
              />
            </div>

            {/* Safety Alerts Panel */}
            <div className="space-y-3 mt-4">
              {consecutiveDays >= 4 && (
                <div className="p-4 bg-yellow-500/15 border-l-4 border-yellow-500 rounded-r-xl flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-black uppercase text-yellow-400 tracking-wider">Rest Recommended</div>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      You have trained for <strong>{consecutiveDays} consecutive days</strong>. Rest days promote muscle protein synthesis.
                    </p>
                  </div>
                </div>
              )}

              {showProgressLockWarning && (
                <div className="p-4 bg-red-600/20 border border-red-500/30 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-black uppercase text-red-400 tracking-wider">🚨 Safe Limit Progress Lock</div>
                      <p className="text-xs text-white/95 mt-1 leading-relaxed">
                        The requested weight <strong>{weight}kg</strong> is 50%+ higher than your previous PR of <strong>{existingPR?.weight}kg</strong>.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={overrideProgressLock} 
                      onChange={(e) => setOverrideProgressLock(e.target.checked)}
                      className="w-4 h-4 rounded border-red-500/40 text-red-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[10px] sm:text-xs text-white font-black uppercase tracking-wider">
                      Override Lock (I lift safely under spotter guidance)
                    </span>
                  </label>
                </div>
              )}

              {validationError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400 font-bold">
                  <AlertTriangle size={16} className="shrink-0 text-red-400" />
                  {validationError}
                </div>
              )}
            </div>

            <button 
              onClick={handleSave}
              disabled={logState !== 'idle'}
              className={cn(
                "w-full bg-[var(--accent)] text-white font-black py-5 rounded-2xl shadow-xl shadow-[var(--accent-glow)] transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer",
                logState === 'idle' ? "hover:scale-[1.02] active:scale-[0.98]" : "opacity-50 cursor-not-allowed scale-[0.98]"
              )}
            >
              {logState === 'logging' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <RefreshCcw size={18} />
                </motion.div>
              ) : (
                <Activity size={18} />
              )}
              {logState === 'logging' ? 'Processing...' : (selectedLogDate !== todayStr ? 'Save Backdated Workout' : 'Save Workout')}
            </button>
            {msg && <div className="text-center text-[var(--green)] font-black text-xs uppercase tracking-widest animate-bounce">{msg}</div>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="tab-heading flex items-center gap-2">
                <History size={16} className="text-[var(--accent)]" />
                Latest Lifts Logged
              </h3>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {todayEntries.length === 0 ? (
                <div className="text-[var(--muted)] text-sm italic py-4 text-center glass rounded-2xl">No sets logged yet today. Let's get to work! 🚀</div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {todayEntries.map((e, i) => {
                    const isEditing = editingIndex === i;
                    return (
                      <motion.div 
                        key={e.time + i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-3xl border border-[var(--border)] bg-[var(--sub)]/50 group relative overflow-hidden transition-all hover:border-[var(--accent)]"
                      >
                        {isEditing ? (
                          <div className="space-y-4 relative z-10 transition-all">
                            <div className="text-xs font-black uppercase text-[var(--accent)] tracking-wider">✏️ Editing Logged Set</div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Exercise Name</label>
                                <input 
                                  value={editName}
                                  onChange={(ev) => setEditName(ev.target.value)}
                                  className="w-full bg-[var(--card2)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Weight (kg)</label>
                                <input 
                                  type="number"
                                  value={editWeight}
                                  onChange={(ev) => setEditWeight(ev.target.value)}
                                  className="w-full bg-[var(--card2)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Reps</label>
                                <input 
                                  type="number"
                                  value={editReps}
                                  onChange={(ev) => setEditReps(ev.target.value)}
                                  className="w-full bg-[var(--card2)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-white"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                              <button 
                                onClick={() => setEditingIndex(null)}
                                className="px-3 py-1.5 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-xs text-[var(--muted)] font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => {
                                  if (onEditEntry) {
                                    onEditEntry(e.date || todayStr, i, {
                                      ...e,
                                      exerciseName: editName,
                                      weight: Number(editWeight) || e.weight,
                                      reps: Number(editReps) || e.reps
                                    });
                                  }
                                  setEditingIndex(null);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-white text-base">{e.exerciseName || e.muscle}</span>
                                {e.logged_late && (
                                  <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                                    Logged Late
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--muted)] font-bold mt-1 flex items-center gap-2">
                                <span>{e.weight}kg × {e.reps} reps ({e.sets || 1} sets)</span>
                                <span>•</span>
                                <span className="text-[var(--accent)]">{e.muscle}</span>
                              </div>
                              {e.notes && <p className="text-xs text-[var(--muted)] italic mt-2">{e.notes}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                              {onEditEntry && (
                                <button 
                                  onClick={() => {
                                    setEditingIndex(i);
                                    setEditName(e.exerciseName || e.muscle);
                                    setEditWeight(String(e.weight));
                                    setEditReps(String(e.reps));
                                    setEditSets(String(e.sets || 1));
                                  }}
                                  className="p-2 rounded-xl bg-[var(--sub)] hover:bg-[var(--accent)] hover:text-white transition-all text-[var(--muted)] cursor-pointer"
                                  title="Edit entry"
                                >
                                  <Edit3 size={14} />
                                </button>
                              )}
                              {onDeleteEntry && (
                                <button 
                                  onClick={() => onDeleteEntry(e.date || todayStr, i)}
                                  className="p-2 rounded-xl bg-[var(--sub)] hover:bg-red-500 hover:text-white transition-all text-[var(--muted)] cursor-pointer"
                                  title="Delete entry"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
