import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Apple, Plus, Trash2, CheckCircle, Flame } from 'lucide-react';
import { ProteinLog } from '../types';

interface ProteinTrackerProps {
  logs: ProteinLog[];
  onSaveProtein: (amount: number) => Promise<void>;
  onDeleteProtein: (id: string) => Promise<void>;
  dailyGoal?: number;
}

const QUICK_SNACKS = [
  { label: "Whey Protein Shake", amount: 30, icon: "🥛" },
  { label: "Chicken Breast (150g)", amount: 46, icon: "🍗" },
  { label: "3 Whole Eggs", amount: 18, icon: "🥚" },
  { label: "Greek Yogurt (150g)", amount: 15, icon: "🍧" },
  { label: "Can of Tuna", amount: 32, icon: "🐟" }
];

export default function ProteinTracker({ logs, onSaveProtein, onDeleteProtein, dailyGoal = 150 }: ProteinTrackerProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter logs for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(log => log.date === todayStr);
  const totalGramsToday = todayLogs.reduce((acc, curr) => acc + curr.amount, 0);
  const progressPercent = Math.min(100, Math.round((totalGramsToday / dailyGoal) * 100));

  const handleQuickAdd = async (amount: number) => {
    setIsSubmitting(true);
    try {
      await onSaveProtein(amount);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(customAmount);
    if (isNaN(amt) || amt <= 0) return;

    setIsSubmitting(true);
    try {
      await onSaveProtein(amt);
      setCustomAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Apple className="w-5 h-5 text-indigo-400" />
          Protein Core
        </h2>
        <p className="text-xs text-neutral-400">Track structural macros to feed muscle synthesis and recover.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Progress Meter Gauge */}
        <div className="lg:col-span-1 bg-neutral-900/60 border border-white/5 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center justify-between text-center min-h-[320px]">
          
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
              Today's Intake
            </h3>
            <p className="text-[10px] text-neutral-500 font-mono">Target: {dailyGoal}g</p>
          </div>

          {/* Circle Graphic Indicator */}
          <div className="relative w-40 h-40 flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Outer Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#171717"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Animated Foreground Circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                stroke="#6366f1"
                strokeWidth="6.5"
                fill="transparent"
                strokeDasharray="264"
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 - (264 * progressPercent) / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner text values */}
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold tracking-tight text-white font-sans">{totalGramsToday}g</span>
              <span className="text-[10px] font-bold text-indigo-400 font-mono mt-0.5">{progressPercent}% MET</span>
            </div>
          </div>

          {progressPercent >= 100 ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-emerald-400 font-bold font-mono">
              <CheckCircle className="w-4 h-4" />
              GOAL EXCEEDED 🔥
            </div>
          ) : (
            <p className="text-xs text-neutral-400">
              Consume <strong className="text-neutral-100 font-mono">{dailyGoal - totalGramsToday}g</strong> more to meet your structure limits.
            </p>
          )}
        </div>

        {/* Center column: Snacker Presets */}
        <div className="lg:col-span-1 bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex flex-col space-y-4">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono border-b border-white/5 pb-2">
            Quick Logs Presets
          </h3>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {QUICK_SNACKS.map((snack) => (
              <button
                key={snack.label}
                onClick={() => handleQuickAdd(snack.amount)}
                disabled={isSubmitting}
                className="w-full bg-black/30 hover:bg-white/5 border border-white/5 hover:border-white/10 p-3 rounded-xl flex items-center justify-between text-left transition-all active:scale-98 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{snack.icon}</span>
                  <div>
                    <span className="text-xs font-semibold text-neutral-200 block group-hover:text-white transition-colors">{snack.label}</span>
                    <span className="text-[9px] text-indigo-400 font-mono">Adds {snack.amount}g protein</span>
                  </div>
                </div>

                <div className="bg-neutral-800 group-hover:bg-indigo-600 text-[10px] font-bold px-2 py-1 rounded text-neutral-300 group-hover:text-white transition-all">
                  +{snack.amount}g
                </div>
              </button>
            ))}
          </div>

          {/* Custom Gram Addition Form */}
          <form onSubmit={handleCustomAdd} className="flex gap-2 pt-3 border-t border-white/5">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Custom Protein (g)..."
              className="flex-1 bg-black/40 border border-white/5 px-3 py-2 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
              min="1"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>
        </div>

        {/* Right column: Today's Log List */}
        <div className="lg:col-span-1 bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex flex-col space-y-4">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono border-b border-white/5 pb-2">
            Today's Log history
          </h3>

          <div className="flex-1 overflow-y-auto max-h-[250px] space-y-2 pr-1">
            {todayLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-500 text-xs border border-dashed border-white/5 rounded-xl h-full">
                <Flame className="w-6 h-6 text-neutral-600 animate-pulse mb-2" />
                No proteins logged yet today.
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {todayLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-black/30 border border-white/5 p-3 rounded-xl flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 font-bold">Logged Grams</span>
                      <p className="text-xs font-extrabold text-neutral-200 mt-0.5">{log.amount}g Pure Protein</p>
                    </div>

                    <button
                      onClick={() => onDeleteProtein(log.id)}
                      className="text-neutral-500 hover:text-rose-500 p-1.5 rounded bg-black/20 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
