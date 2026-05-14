import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, X, Play, Pause, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 1) {
            // Cycle phases
            setPhase((current) => {
              if (current === 'Inhale') return 'Hold';
              if (current === 'Hold') return 'Exhale';
              if (current === 'Exhale') return 'Pause';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const reset = () => {
    setIsActive(false);
    setPhase('Inhale');
    setTimeLeft(4);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'Inhale': return 'var(--blue)';
      case 'Hold': return 'var(--accent)';
      case 'Exhale': return 'var(--green)';
      default: return 'var(--muted)';
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 flex flex-col items-center gap-8 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--blue)]/5 rounded-full blur-3xl -mr-16 -mt-16" />
      
      <div className="flex items-center justify-between w-full relative z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--blue)]/10 rounded-xl flex items-center justify-center text-[var(--blue)]">
                <Wind size={20} />
            </div>
            <div>
                <h3 className="text-lg font-display font-black text-white italic uppercase">Box Breathing</h3>
                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest italic">Anxiety & Focus Control</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={reset} className="p-2 rounded-lg bg-[var(--sub)] text-[var(--muted)] hover:text-white transition-colors">
                <RefreshCcw size={16} />
            </button>
            <button 
                onClick={() => setIsActive(!isActive)} 
                className={cn(
                    "p-2 rounded-lg transition-all",
                    isActive ? "bg-[var(--red)]/10 text-[var(--red)]" : "bg-[var(--green)]/10 text-[var(--green)]"
                )}
            >
                {isActive ? <Pause size={16} /> : <Play size={16} />}
            </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-64 relative w-full">
        {/* Animated Circle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            className="absolute rounded-full border-4 border-dashed opacity-20"
            style={{ borderColor: getPhaseColor() }}
            initial={{ scale: phase === 'Inhale' || phase === 'Pause' ? 0.8 : 1.2 }}
            animate={{ 
                scale: phase === 'Inhale' ? 1.2 : phase === 'Exhale' ? 0.8 : (phase === 'Hold' ? 1.2 : 0.8),
                rotate: 360
            }}
            transition={{ duration: 4, ease: "linear" }}
          />
        </AnimatePresence>

        <motion.div
          className="w-40 h-40 rounded-full flex items-center justify-center relative z-10"
          style={{ backgroundColor: `${getPhaseColor()}20`, border: `2px solid ${getPhaseColor()}` }}
          animate={{ 
            scale: phase === 'Inhale' ? [1, 1.4] : 
                   phase === 'Hold' ? 1.4 :
                   phase === 'Exhale' ? [1.4, 1] : 
                   1
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center">
            <motion.span 
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-display font-black text-white uppercase italic tracking-wider"
            >
              {phase}
            </motion.span>
            <span className="text-sm font-black text-[var(--muted)] tabular-nums">{timeLeft}s</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full">
        {['Inhale', 'Hold', 'Exhale', 'Pause'].map((p) => (
            <div 
                key={p} 
                className={cn(
                    "h-1.5 rounded-full transition-all duration-1000",
                    phase === p && isActive ? "bg-white" : "bg-white/5"
                )}
            />
        ))}
      </div>

      <div className="text-center">
         <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider italic">
            Focus on the transition. Breathe through your nose.
         </p>
      </div>
    </div>
  );
}
