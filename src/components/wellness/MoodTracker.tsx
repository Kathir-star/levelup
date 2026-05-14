import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Heart, TrendingUp, Calendar } from 'lucide-react';
import { MoodType, MoodEntry } from '../../types';
import { cn } from '../../lib/utils';

export default function MoodTracker() {
  const [history, setHistory] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem('lvMoodHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPicker, setShowPicker] = useState(false);

  const MOODS: { type: MoodType; label: string; color: string }[] = [
    { type: '😄', label: 'Great', color: 'var(--green)' },
    { type: '😐', label: 'Neutral', color: 'var(--muted)' },
    { type: '😞', label: 'Down', color: 'var(--blue)' },
    { type: '😤', label: 'Fired Up', color: 'var(--red)' },
    { type: '😴', label: 'Tired', color: 'var(--yellow)' },
  ];

  useEffect(() => {
    localStorage.setItem('lvMoodHistory', JSON.stringify(history));
  }, [history]);

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = history.find(h => h.date === today);

  const selectMood = (mood: MoodType) => {
    const newEntry: MoodEntry = {
      mood,
      date: today,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => {
        const filtered = prev.filter(h => h.date !== today);
        return [...filtered, newEntry].slice(-30); // Keep last 30 days
    });
    setShowPicker(false);
  };

  // Weekly summary
  const last7Days = history.slice(-7);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--red)]/10 rounded-xl flex items-center justify-center text-[var(--red)]">
                    <Heart size={20} fill="currentColor" />
                </div>
                <div>
                    <h3 className="text-lg font-display font-black text-white italic uppercase">Mindset Track</h3>
                    <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest italic">Emotional Pulse Registry</p>
                </div>
            </div>
            
            {!todayEntry ? (
                <button 
                    onClick={() => setShowPicker(true)}
                    className="p-3 bg-[var(--red)] rounded-xl text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--accent-glow)]"
                >
                    <Smile size={20} />
                </button>
            ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--sub)] rounded-xl border border-[var(--border)]">
                    <span className="text-xl">{todayEntry.mood}</span>
                    <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest italic">LOGGED</span>
                </div>
            )}
        </div>

        <div className="flex gap-2 justify-between">
            {[...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dateStr = d.toISOString().split('T')[0];
                const entry = history.find(h => h.date === dateStr);
                return (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className={cn(
                            "w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center transition-all",
                            entry ? "bg-white/5 border-white/20" : "bg-black/20 opacity-30"
                        )}>
                            <span className="text-lg">{entry?.mood || '•'}</span>
                        </div>
                        <span className="text-[8px] font-black text-[var(--muted)] uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    </div>
                );
            })}
        </div>

        <AnimatePresence>
            {showPicker && (
                <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[var(--card)] border-2 border-[var(--red)]/30 rounded-3xl p-8 w-full max-w-sm flex flex-col gap-8 shadow-2xl"
                    >
                        <div className="text-center">
                            <h4 className="text-2xl font-display font-black text-white italic uppercase tracking-wider mb-2">How are you feeling?</h4>
                            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] italic">Select your current vibration</p>
                        </div>

                        <div className="grid grid-cols-5 gap-4">
                            {MOODS.map((m) => (
                                <button 
                                    key={m.type}
                                    onClick={() => selectMood(m.type)}
                                    className="group flex flex-col items-center gap-2"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--sub)] border border-[var(--border)] group-hover:border-[var(--red)] flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,0,0,0.2)]">
                                        <span className="text-2xl">{m.type}</span>
                                    </div>
                                    <span className="text-[8px] font-black text-[var(--muted)] uppercase group-hover:text-white transition-colors">{m.label}</span>
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setShowPicker(false)}
                            className="w-full py-3 rounded-2xl border border-[var(--border)] text-[10px] font-black text-[var(--muted)] uppercase tracking-widest hover:text-white hover:border-white transition-all"
                        >
                            Cancel
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
}
