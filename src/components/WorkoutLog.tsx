import { useState, useMemo, useEffect } from 'react';
import { MuscleGroup, WorkoutEntry } from '../types';
import { cn } from '../lib/utils';
import { Plus, Search, Filter, MessageSquare, History, Activity, Trophy, CheckCircle2, RefreshCcw, Info, AlertTriangle, ShieldAlert, Trash2, Edit3, Check, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Date filters
  const [dateFilter, setDateFilter] = useState('');

  // 1. Auto-save user entries (localStorage)
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

  const filteredHistory = useMemo(() => {
    return history.filter(n => {
      const matchesSearch = n.notes?.toLowerCase().includes(search.toLowerCase()) || 
        n.muscle.toLowerCase().includes(search.toLowerCase()) ||
        n.exerciseName?.toLowerCase().includes(search.toLowerCase());
      const matchesDate = !dateFilter || n.date === dateFilter;
      return matchesSearch && matchesDate;
    }).slice(0, 15);
  }, [history, search, dateFilter]);

  // Compute consecutive days of training from history
  const consecutiveDays = useMemo(() => {
    const dates = Array.from(new Set(history.map(h => h.date))).sort();
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

  // Trigger effect when progress spike is detected
  useEffect(() => {
    if (isProgressSpike) {
      setShowProgressLockWarning(true);
    } else {
      setShowProgressLockWarning(false);
      setOverrideProgressLock(false);
    }
  }, [isProgressSpike]);

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

    // Hard Boundaries Validation (Safe Limit System)
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

    // Progress Lock Check
    if (isProgressSpike && !overrideProgressLock) {
      setValidationError('⚠️ PROGRESS LOCK ACTIVE: Logged weight is 50%+ higher than your historical PR. progression spikes of this size present extreme injury risks. Check the override block to confirm.');
      return;
    }

    setLogState('logging');

    const moodEmoji = MOODS.find(m => m.id === selectedMood)?.emoji || '💪';
    const entry: WorkoutEntry = {
      muscle,
      exerciseName: exerciseName.trim(),
      weight: wNum,
      reps: rNum,
      sets: sNum,
      notes: `${moodEmoji} ${notes.trim()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().slice(0, 10)
    };

    // Simulate logging delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onLog(entry);
    
    setLogState('success');
    
    // Clear form and drafts
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
      setMsg('Saved ✔');
      setTimeout(() => setMsg(''), 3000);
    }, 1500);
  };

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
                  <div className="text-xl font-black uppercase tracking-widest text-white">Logging Set...</div>
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
                    <div className="text-2xl font-black uppercase tracking-widest text-white">Exercise Complete!</div>
                    <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.3em]">Great work out there</div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[var(--red)]/20 rounded-2xl flex items-center justify-center text-[var(--red)]">
              <Plus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Log Session</h2>
              <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest">Track your heavy hits</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="tab-heading">Muscle Group</label>
                <select 
                  value={muscle} 
                  onChange={(e) => setMuscle(e.target.value as MuscleGroup)}
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--red)] transition-all outline-none font-bold"
                >
                  <option>Chest</option>
                  <option>Back</option>
                  <option>Legs</option>
                  <option>Biceps</option>
                  <option>Triceps</option>
                  <option>Shoulder</option>
                  <option>Abs</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="tab-heading">Mood Tag</label>
                <div className="flex gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMood(m.id)}
                      className={cn(
                        "flex-1 py-3 rounded-2xl border text-lg transition-all",
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
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--red)] transition-all outline-none font-bold"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="tab-heading">Weight (kg)</label>
                <input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0" 
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--red)] transition-all outline-none font-black text-xl text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="tab-heading">Reps</label>
                <input 
                  type="number" 
                  value={reps} 
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="0" 
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--red)] transition-all outline-none font-black text-xl text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="tab-heading">Sets</label>
                <input 
                  type="number" 
                  value={sets} 
                  onChange={(e) => setSets(e.target.value)}
                  placeholder="0" 
                  className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--red)] transition-all outline-none font-black text-xl text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="tab-heading">Session Notes</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the pump feel?..." 
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--red)] transition-all outline-none min-h-[100px] resize-none italic text-sm"
              />
            </div>

            {/* Safety Alerts Panel */}
            <div className="space-y-3 mt-4">
              {consecutiveDays >= 3 && (
                <div className="p-4 bg-yellow-500/15 border-l-4 border-yellow-500 rounded-r-xl flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-black uppercase text-yellow-400 tracking-wider">Rest Day Recommended</div>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      You have trained for <strong>{consecutiveDays} consecutive days</strong>. Rest days are required for protein synthesis and central nervous system recovery. Take a break!
                    </p>
                  </div>
                </div>
              )}

              {todayEntries.length >= 8 && (
                <div className="p-4 bg-orange-500/15 border-l-4 border-orange-500 rounded-r-xl flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-black uppercase text-orange-400 tracking-wider">Overtraining Alert</div>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      You've already logged <strong>{todayEntries.length} exercises today</strong>. Your cortisol levels are rising. Consider wrapping up!
                    </p>
                  </div>
                </div>
              )}

              {(Number(weight) > 120 || (Number(weight) * (Number(reps) || 0) * (Number(sets) || 0)) > 2000) && (
                <div className="p-4 bg-[var(--red)]/10 border-l-4 border-[var(--red)] rounded-r-xl flex items-start gap-2.5 animate-pulse">
                  <ShieldAlert size={16} className="text-[var(--red)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-black uppercase text-[var(--red)] tracking-wider">High Intensity Mechanical Load</div>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      Elite level intensity/volume detected. Secure perfect range-of-motion, inspect weight collars, request a gym spotter, and defend your core/spine.
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
                        The requested weight <strong>{weight}kg</strong> is 50%+ higher than your previous PR of <strong>{existingPR?.weight}kg</strong>. Progression surges of this velocity are highly correlated with chest tears, joint damage, or tendonitis.
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
                "w-full bg-[var(--red)] text-white font-black py-5 rounded-2xl shadow-xl shadow-[var(--red)]/20 transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 mt-4",
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
              {logState === 'logging' ? 'Processing...' : 'Save Workout'}
            </button>
            {msg && <div className="text-center text-[var(--green)] font-black text-xs uppercase tracking-widest animate-bounce">{msg}</div>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="tab-heading flex items-center gap-2">
                <History size={16} className="text-[var(--red)]" />
                Latest Lifts
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
                        className="p-5 rounded-3xl border border-[var(--border)] bg-[var(--sub)]/50 group relative overflow-hidden transition-all hover:border-[var(--red)]"
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
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Coach Notes (optional)</label>
                              <input 
                                value={editNotes}
                                onChange={(ev) => setEditNotes(ev.target.value)}
                                className="w-full bg-[var(--card2)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-white"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-1 border-t border-[var(--border)]">
                              <button 
                                onClick={() => setEditingIndex(null)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 text-[9px] font-black uppercase text-[var(--muted)] flex items-center gap-1 hover:text-white"
                              >
                                <X size={10} /> Cancel
                              </button>
                              <button 
                                onClick={() => {
                                  if (onEditEntry) {
                                    onEditEntry(new Date().toLocaleDateString('en-CA'), i, {
                                      ...e,
                                      exerciseName: editName,
                                      weight: Number(editWeight) || 0,
                                      reps: Number(editReps) || 0,
                                      notes: editNotes
                                    });
                                  }
                                  setEditingIndex(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white font-[800] text-[9px] uppercase tracking-widest flex items-center gap-1"
                              >
                                <Check size={10} /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Standard View */}
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--red)]/10 flex items-center justify-center text-[var(--red)] font-black text-sm shrink-0">
                                  {e.muscle[0]}
                                </div>
                                <div className="leading-snug">
                                  <div className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    {e.exerciseName || e.muscle}
                                    {e.isPR && (
                                      <span className="bg-[var(--yellow)]/20 text-[var(--yellow)] text-[8px] px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                                        <Trophy size={8}/> PR
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">
                                    {e.exerciseName ? `${e.muscle} • ` : ''}{e.time}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-xl font-black text-[var(--yellow)]">{e.weight}<span className="text-[10px] ml-0.5">KG</span></div>
                                  <div className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest">{e.reps} Reps • {e.sets} Sets</div>
                                </div>
                                <div className="flex flex-col gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setEditingIndex(i);
                                      setEditName(e.exerciseName || '');
                                      setEditWeight(String(e.weight));
                                      setEditReps(String(e.reps));
                                      setEditSets(String(e.sets || 1));
                                      setEditNotes(e.notes || '');
                                    }}
                                    className="p-1 px-1.5 bg-white/5 border border-white/10 hover:border-[var(--accent)] rounded text-[var(--muted)] hover:text-[var(--accent)] transition-all cursor-pointer"
                                    title="Edit Log"
                                  >
                                    <Edit3 size={10} />
                                  </button>
                                  {onDeleteEntry && (
                                    <button
                                      onClick={() => onDeleteEntry(new Date().toLocaleDateString('en-CA'), i)}
                                      className="p-1 px-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded text-red-400 transition-all cursor-pointer"
                                      title="Delete Log"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            {e.notes && <div className="mt-4 text-xs text-white/80 leading-relaxed italic border-t border-[var(--border)] pt-4">"{e.notes}"</div>}
                          </>
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

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="tab-heading text-lg">📝 Notes History</h2>
          <div className="flex items-center gap-2">
            {/* Date Picker Filter */}
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 text-[var(--muted)] pointer-events-none" size={14} />
              <input
                type="date"
                value={dateFilter}
                onChange={(ev) => setDateFilter(ev.target.value)}
                className="bg-[var(--sub)] border border-[var(--border)] rounded-xl py-2 pl-9 pr-4 text-xs focus:border-[var(--red)] outline-none text-white max-w-[140px]"
                title="Filter by Date"
              />
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter('')}
                  className="absolute right-2 text-[var(--muted)] hover:text-white text-xs font-bold"
                  title="Clear Date"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Keyword Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={search}
                onChange={(ev) => setSearch(ev.target.value)}
                className="bg-[var(--sub)] border border-[var(--border)] rounded-xl py-2 pl-9 pr-4 text-xs focus:border-[var(--red)] outline-none w-full sm:min-w-[160px]"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.length === 0 ? (
            <div className="col-span-full text-[var(--muted)] text-sm italic text-center py-8">No matching notes found.</div>
          ) : (
            filteredHistory.map((n, i) => {
              const handleHistoricalDelete = () => {
                if (!onDeleteEntry || !fullHistory) return;
                const dayLogs = fullHistory[n.date] || [];
                const matchIdx = dayLogs.findIndex(x => x.time === n.time && (x.exerciseName === n.exerciseName || x.muscle === n.muscle) && x.weight === n.weight);
                if (matchIdx !== -1) {
                  onDeleteEntry(n.date, matchIdx);
                }
              };

              return (
                <div key={i} className="glass-card p-6 border-l-4 border-[var(--accent)] relative group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">{n.date} · {n.time}</div>
                    <div className="flex items-center gap-2">
                      {onDeleteEntry && fullHistory && (
                        <button
                          onClick={handleHistoricalDelete}
                          className="p-1 text-[var(--muted)] hover:text-red-400 rounded transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                      {n.isPR && (
                        <span className="px-2 py-0.5 bg-[var(--yellow)]/10 text-[var(--yellow)] rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Trophy size={8}/> PR
                        </span>
                      )}
                      <div className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded text-[8px] font-black uppercase tracking-widest">{n.exerciseName || n.muscle}</div>
                    </div>
                  </div>
                  <div className="text-xs font-black mb-2">{n.weight}kg × {n.reps} reps</div>
                  <div className="text-xs text-white/70 leading-relaxed italic flex gap-2">
                     {n.notes}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {Object.keys(prs).length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="tab-heading text-lg flex items-center gap-2">
              <Trophy size={18} className="text-[var(--yellow)]" />
              Personal Records
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(prs).map(([key, data], i) => (
              <div key={i} className="glass-card p-5 relative overflow-hidden group border border-[var(--border)] hover:border-[var(--yellow)] transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--yellow)]/10 -mr-8 -mt-8 rounded-full blur-xl transition-all" />
                <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">{data.date}</div>
                <div className="text-sm font-black uppercase tracking-tight mb-3 text-white capitalize">{key}</div>
                <div className="flex items-end gap-1">
                  <div className="text-2xl font-display font-black text-[var(--yellow)]">{data.weight}</div>
                  <div className="text-[10px] font-bold text-[var(--muted)] mb-1 uppercase tracking-widest">KG × {data.reps}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
