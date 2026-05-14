import { useState, useMemo } from 'react';
import { MuscleGroup, WorkoutEntry } from '../types';
import { cn } from '../lib/utils';
import { Plus, Search, Filter, MessageSquare, History, Activity, Trophy, CheckCircle2, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WorkoutLogProps {
  onLog: (entry: WorkoutEntry) => void;
  todayEntries: WorkoutEntry[];
  history: WorkoutEntry[];
  prs: Record<string, { weight: number, reps: number, date: string }>;
}

const MOODS = [
  { id: 'strong', label: 'Strong', emoji: '🔥', color: 'bg-red-500' },
  { id: 'tired', label: 'Tired', emoji: '😓', color: 'bg-blue-500' },
  { id: 'pumped', label: 'Pumped', emoji: '💪', color: 'bg-green-500' },
];

export default function WorkoutLog({ onLog, todayEntries, history, prs }: WorkoutLogProps) {
  const [muscle, setMuscle] = useState<MuscleGroup>('Chest');
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMood, setSelectedMood] = useState('pumped');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [logState, setLogState] = useState<'idle' | 'logging' | 'success'>('idle');

  const filteredHistory = useMemo(() => {
    return history.filter(n => 
      n.notes?.toLowerCase().includes(search.toLowerCase()) || 
      n.muscle.toLowerCase().includes(search.toLowerCase()) ||
      n.exerciseName?.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 15);
  }, [history, search]);

  const handleSave = async () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    if (!weight) {
      alert('Please enter weight');
      return;
    }

    setLogState('logging');

    const moodEmoji = MOODS.find(m => m.id === selectedMood)?.emoji || '💪';
    const entry: WorkoutEntry = {
      muscle,
      exerciseName: exerciseName.trim(),
      weight: Number(weight),
      reps: Number(reps) || 0,
      sets: Number(sets) || 0,
      notes: `${moodEmoji} ${notes.trim()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().slice(0, 10)
    };

    // Simulate logging delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onLog(entry);
    
    setLogState('success');
    
    // Clear form
    setExerciseName('');
    setWeight('');
    setReps('');
    setSets('');
    setNotes('');
    
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

            <button 
              onClick={handleSave}
              disabled={logState !== 'idle'}
              className={cn(
                "w-full bg-[var(--red)] text-white font-black py-5 rounded-2xl shadow-xl shadow-[var(--red)]/20 transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2",
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
                  {todayEntries.map((e, i) => (
                    <motion.div 
                      key={e.time + i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-3xl border border-[var(--border)] bg-[var(--sub)]/50 group relative overflow-hidden transition-all hover:border-[var(--red)]"
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--red)]/10 flex items-center justify-center text-[var(--red)] font-black text-sm">
                            {e.muscle[0]}
                          </div>
                          <div>
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
                        <div className="text-right">
                          <div className="text-xl font-black text-[var(--yellow)]">{e.weight}<span className="text-[10px] ml-0.5">KG</span></div>
                          <div className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest">{e.reps} Reps • {e.sets} Sets</div>
                        </div>
                      </div>
                      {e.notes && <div className="mt-4 text-xs text-white/80 leading-relaxed italic border-t border-[var(--border)] pt-4">"{e.notes}"</div>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="tab-heading text-lg">📝 Notes History</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[var(--sub)] border border-[var(--border)] rounded-full py-2 pl-9 pr-4 text-xs focus:border-[var(--red)] outline-none min-w-[200px]"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.length === 0 ? (
            <div className="col-span-full text-[var(--muted)] text-sm italic text-center py-8">No matching notes found.</div>
          ) : (
            filteredHistory.map((n, i) => (
              <div key={i} className="glass-card p-6 border-l-4 border-[var(--accent)]">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">{n.date} · {n.time}</div>
                  <div className="flex gap-2">
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
            ))
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
