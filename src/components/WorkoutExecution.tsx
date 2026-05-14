import { useState, useEffect, useRef } from 'react';
import { MuscleGroup, Exercise } from '../types';
import { cn } from '../lib/utils';
import { Play, Pause, RotateCcw, X, CheckCircle2, Flame, Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CircularTimer from './common/CircularTimer';
import { MOTIVATIONAL_MESSAGES, TAMIL_MOTIVATIONAL_MESSAGES } from '../constants';
import confetti from 'canvas-confetti';

interface WorkoutExecutionProps {
  muscle: MuscleGroup;
  exercise: Exercise;
  onComplete: (duration: number) => void;
  onCancel: () => void;
}

export default function WorkoutExecution({ muscle, exercise, onComplete, onCancel }: WorkoutExecutionProps) {
  const initialRest = parseInt(exercise.rest) || 60;
  const [maxTime] = useState(initialRest);
  const [isActive, setIsActive] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalSets] = useState(parseInt(exercise.sets) || 3);
  const [duration, setDuration] = useState(0);
  const isTamil = document.documentElement.dataset.tamil === 'true';
  const messages = isTamil ? TAMIL_MOTIVATIONAL_MESSAGES : MOTIVATIONAL_MESSAGES;
  const [message, setMessage] = useState(messages[0]);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showSetPulse, setShowSetPulse] = useState(false);

  // Main Timer Loop
  useEffect(() => {
    let msgCounter = 0;
    const interval = window.setInterval(() => {
      setDuration(prev => prev + 1);
      msgCounter++;
      if (msgCounter >= 5) {
        const msgs = document.documentElement.dataset.tamil === 'true' ? TAMIL_MOTIVATIONAL_MESSAGES : MOTIVATIONAL_MESSAGES;
        setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
        msgCounter = 0;
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const nextSet = () => {
    if (currentSet < totalSets) {
      // Trigger set completion pulse
      setShowSetPulse(true);
      setTimeout(() => setShowSetPulse(false), 600);
      
      if (navigator.vibrate) navigator.vibrate([10, 30, 10]);

      setCurrentSet(prev => prev + 1);
      setIsActive(true); // Auto-trigger rest
    } else {
      handleSessionFinish();
    }
  };

  const handleSessionFinish = () => {
    setIsFinishing(true);
    
    // Celebration Confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff3b3b', '#ffd700', '#ffffff'],
      ticks: 300
    });

    if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]);

    // Give user time to see the celebration
    setTimeout(() => {
      onComplete(duration);
    }, 3000);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg)] z-[200] flex flex-col p-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Background Pulse Effect for Set Completion */}
      <AnimatePresence>
        {showSetPulse && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--accent)] pointer-events-none z-[10]"
          />
        )}
      </AnimatePresence>

      {/* Session Finish Overlay */}
      <AnimatePresence>
        {isFinishing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[500] bg-black/95 flex flex-col items-center justify-center text-center p-8 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-32 h-32 bg-[var(--yellow)] rounded-full flex items-center justify-center text-black mb-8 shadow-[0_0_50px_rgba(255,215,0,0.4)]"
            >
              <Trophy size={64} />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black uppercase tracking-tighter text-white italic mb-2"
            >
              Session Complete
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[var(--accent)] font-bold uppercase tracking-[0.3em] text-sm"
            >
              Beast Mode Activated 😈
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest"
            >
              <Star size={12} className="animate-spin duration-3000" />
              Saving your progress...
              <Star size={12} className="animate-spin duration-3000" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--red)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[var(--red)]/20 animate-pulse">
            <Flame size={24} />
          </div>
          <div>
            <h2 className="font-display text-2xl text-[var(--red)] tracking-wider leading-none uppercase">{exercise.name}</h2>
            <p className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{muscle} • Set {currentSet} of {totalSets}</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 rounded-full bg-[var(--card)] border border-[var(--border)] hover:border-[var(--red)] transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="w-full h-1.5 bg-[var(--border)] rounded-full mb-12 overflow-hidden relative z-20">
        <motion.div 
          className="h-full bg-[var(--red)]"
          initial={{ width: 0 }}
          animate={{ width: `${(currentSet / totalSets) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12 relative z-20">
        <motion.div 
          animate={showSetPulse ? { scale: [1, 1.05, 1], rotate: [0, 1, 0, -1, 0] } : {}}
          className="w-full max-w-md aspect-video bg-[var(--card)] rounded-3xl border border-[var(--border)] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group transition-transform hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
          <div className="z-10 text-center p-6">
            <div className="text-7xl mb-4 group-hover:rotate-12 transition-transform duration-500">🏋️</div>
            <div className="text-[var(--yellow)] font-display text-4xl tracking-widest font-black uppercase italic">{exercise.reps} REPS</div>
            <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Target Weight: Focus Form</div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={message}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-8 left-0 right-0 text-center px-6"
            >
              <span className="bg-[var(--red)] text-white px-6 py-2 rounded-full text-[10px] font-black shadow-xl uppercase tracking-widest border border-white/10">
                Coach: {message}
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="flex items-center gap-8">
            <button 
                onClick={() => setIsActive(true)}
                className="w-24 h-24 rounded-full bg-[var(--red)] flex items-center justify-center text-white shadow-2xl shadow-[var(--red)]/40 hover:scale-105 active:scale-95 transition-all group"
            >
                <div className="flex flex-col items-center">
                    <Play size={32} fill="currentColor" className="ml-1" />
                    <span className="text-[8px] font-black uppercase tracking-widest mt-1">REST</span>
                </div>
            </button>
            <button 
                onClick={nextSet}
                className="w-24 h-24 rounded-full bg-[var(--green)] text-white shadow-2xl shadow-[var(--green)]/30 hover:scale-105 active:scale-95 transition-all group flex flex-col items-center justify-center"
            >
                <CheckCircle2 size={32} />
                <span className="text-[8px] font-black uppercase tracking-widest mt-1">DONE</span>
            </button>
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-[var(--border)] flex justify-between items-end relative z-20">
        <div className="space-y-1">
          <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Session Timer</div>
          <div className="text-3xl font-black tracking-tighter tabular-nums">{formatTime(duration)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Status</div>
          <div className={cn(
            "font-black uppercase tracking-widest italic",
            isActive ? "text-[var(--yellow)] animate-pulse" : "text-[var(--green)]"
          )}>
            {isActive ? 'Resting...' : 'Work Phase'}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isActive && !isFinishing && (
            <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
                <CircularTimer 
                    initialSeconds={maxTime}
                    onClose={() => setIsActive(false)}
                    onComplete={() => setIsActive(false)}
                />
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
