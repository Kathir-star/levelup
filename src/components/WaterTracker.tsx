import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Droplets, GlassWater, RotateCcw, Plus, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function WaterTracker() {
  const [ml, setMl] = useState(0);
  const [goal, setGoal] = useState(3000);
  const [showProgress, setShowProgress] = useState(false);

  const today = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    const saved = localStorage.getItem(`water-${today}`);
    if (saved) setMl(parseInt(saved));
    
    const savedGoal = localStorage.getItem('water-goal');
    if (savedGoal) setGoal(parseInt(savedGoal));
    
    setShowProgress(true);
  }, [today]);

  const addXp = (amount: number) => {
    const currentXp = parseInt(localStorage.getItem('user-xp') || '0');
    localStorage.setItem('user-xp', (currentXp + amount).toString());
    window.dispatchEvent(new Event('storage'));
  };

  const updateWater = (amount: number) => {
    const next = ml + amount;
    setMl(next);
    localStorage.setItem(`water-${today}`, next.toString());
    addXp(Math.floor(amount / 10)); // 1 XP per 10ml
  };

  const resetWater = () => {
    if (confirm('Reset today\'s intake?')) {
      setMl(0);
      localStorage.setItem(`water-${today}`, '0');
    }
  };

  const handleGoalChange = () => {
    const newGoal = prompt('Set daily water goal (ml):', goal.toString());
    if (newGoal && !isNaN(parseInt(newGoal))) {
      setGoal(parseInt(newGoal));
      localStorage.setItem('water-goal', newGoal);
    }
  };

  const percentage = Math.min(100, Math.round((ml / goal) * 100));

  return (
    <div className="glass-card p-6 bg-gradient-to-br from-blue-600/10 to-cyan-500/10 border-blue-500/20 group relative overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.1)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
            <Droplets size={20} />
          </div>
          <div>
            <h3 className="font-display font-black text-lg tracking-tight uppercase">Hydration</h3>
            <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Daily intake tracker</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleGoalChange} className="p-2 rounded-lg bg-white/5 border border-white/10 text-[var(--muted)] hover:text-white transition-all">
            <Settings size={14} />
          </button>
          <button onClick={resetWater} className="p-2 rounded-lg bg-white/5 border border-white/10 text-[var(--muted)] hover:text-red-400 transition-all">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-6 border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: showProgress ? `${percentage}%` : 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
        />
      </div>

      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-4xl font-black tracking-tighter tabular-nums flex items-baseline gap-1">
            {ml}
            <span className="text-sm text-[var(--muted)] font-bold">ml</span>
          </div>
          <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-1">Goal: {goal}ml</div>
        </div>
        <div className="text-right">
          <div className={cn(
            "text-2xl font-black",
            percentage >= 100 ? "text-green-400" : "text-blue-400"
          )}>
            {percentage}%
          </div>
          <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Progress</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => updateWater(250)}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-100 font-black text-[11px] uppercase tracking-widest hover:bg-blue-600/30 active:scale-95 transition-all"
        >
          <GlassWater size={16} />
          +250ml
        </button>
        <button 
          onClick={() => updateWater(500)}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} />
          +500ml
        </button>
      </div>

      {percentage < 50 && (
         <div className="mt-6 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center gap-3">
            <span className="text-lg">💧</span>
            <p className="text-[10px] font-bold text-blue-300 italic tracking-tight">You need more hydration today. Drink up!</p>
         </div>
      )}
      {percentage >= 100 && (
         <div className="mt-6 p-3 bg-green-500/5 border border-green-500/10 rounded-xl flex items-center gap-3">
            <span className="text-lg">✅</span>
            <p className="text-[10px] font-bold text-green-300 italic tracking-tight">Hydration goal reached! Excellent work.</p>
         </div>
      )}
    </div>
  );
}

