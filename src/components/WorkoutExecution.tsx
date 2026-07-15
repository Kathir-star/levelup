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
  
  // Overall Session Countdown Timer (MM:SS)
  const predictedTotalTime = (totalSets * 45) + (totalSets * initialRest);
  const [remainingSessionTime, setRemainingSessionTime] = useState(predictedTotalTime);
  const [isOverallPlaying, setIsOverallPlaying] = useState(true);

  // Mini Set Timer
  const [miniSetSeconds, setMiniSetSeconds] = useState(0);

  const isTamil = document.documentElement.dataset.tamil === 'true';
  const messages = isTamil ? TAMIL_MOTIVATIONAL_MESSAGES : MOTIVATIONAL_MESSAGES;
  const [message, setMessage] = useState(messages[0]);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showSetPulse, setShowSetPulse] = useState(false);
  const [isSetDoneAnimation, setIsSetDoneAnimation] = useState(false);
  const [isPR] = useState(() => Math.random() > 0.4);

  // Synthesize Completion Sound using Web Audio API
  const playCompletionSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, startTime: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + dur);
      };
      
      // Dual-tone high-energy chime
      playTone(523.25, ctx.currentTime, 0.2); // C5
      playTone(659.25, ctx.currentTime + 0.12, 0.25); // E5
      playTone(783.99, ctx.currentTime + 0.25, 0.4); // G5
    } catch (err) {
      console.warn('Web Audio API Blocked or Unresponsive:', err);
    }
  };

  // Main Timer Loop
  useEffect(() => {
    let msgCounter = 0;
    const interval = window.setInterval(() => {
      if (isOverallPlaying) {
        setDuration(prev => prev + 1);
        setRemainingSessionTime(prev => {
          if (prev <= 1) {
            playCompletionSound();
            handleSessionFinish();
            return 0;
          }
          return prev - 1;
        });

        // Mini Set Timer: tracking active effort during workout mode
        if (!isActive) {
          setMiniSetSeconds(prev => prev + 1);
        }
      }

      msgCounter++;
      if (msgCounter >= 5) {
        const msgs = document.documentElement.dataset.tamil === 'true' ? TAMIL_MOTIVATIONAL_MESSAGES : MOTIVATIONAL_MESSAGES;
        setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
        msgCounter = 0;
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isOverallPlaying, isActive]);

  const nextSet = () => {
    if (currentSet < totalSets) {
      // Trigger set completion pulse & banner
      setShowSetPulse(true);
      setIsSetDoneAnimation(true);
      setTimeout(() => {
        setShowSetPulse(false);
        setIsSetDoneAnimation(false);
      }, 950);
      
      if (navigator.vibrate) navigator.vibrate([10, 30, 10]);

      setCurrentSet(prev => prev + 1);
      setMiniSetSeconds(0); // Reset Mini Set Timer for work effort of next set!
      setIsActive(true); // Auto-trigger rest
    } else {
      playCompletionSound();
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
    }, 4000);
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

      {/* Set Done Animation Banner Overlay */}
      <AnimatePresence>
        {isSetDoneAnimation && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-x-6 top-6 z-[450] p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl border border-white/20 text-center shadow-[0_0_30px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center gap-1"
          >
            <div className="text-sm font-black uppercase tracking-wider text-white">👍 Set Complete! Reps Done!</div>
            <p className="text-[10px] text-white/90 uppercase tracking-widest font-black leading-none">Rest phase active. Recover for set {currentSet + 1}.</p>
          </motion.div>
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
            {isPR && (
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-8 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black px-6 py-2.5 rounded-2xl font-black text-xs tracking-widest uppercase shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-bounce flex items-center gap-2"
              >
                🏆 NEW PERSONAL RECORD (PR) BROKEN!
              </motion.div>
            )}

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

      <div className="w-full h-1.5 bg-[var(--border)] rounded-full mb-6 overflow-hidden relative z-20">
        <motion.div 
          className="h-full bg-[var(--red)]"
          initial={{ width: 0 }}
          animate={{ width: `${(currentSet / totalSets) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* ⏱️ Premium Smart Session & Set Indicators */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-20">
         {/* Overall Session Countdown */}
         <div className="bg-gradient-to-br from-black/60 to-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col justify-between">
           <div>
             <div className="flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Overall Session</span>
               <span className={cn(
                 "w-2 h-2 rounded-full animate-pulse",
                 isOverallPlaying ? "bg-[var(--green)]" : "bg-[var(--red)]"
               )} />
             </div>
             <div className="text-2xl font-black italic tracking-tighter text-white/90 tabular-nums mt-1">
               {formatTime(remainingSessionTime)}
             </div>
             <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-wider">Estimated Countdown Offset</p>
           </div>
           
           <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
             <button 
               onClick={() => setIsOverallPlaying(!isOverallPlaying)}
               className={cn(
                 "flex-1 py-1 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                 isOverallPlaying ? "bg-white/5 border border-white/10 text-[var(--yellow)] hover:bg-white/10" : "bg-[var(--green)]/20 border border-[var(--green)]/30 text-[var(--green)] hover:bg-[var(--green)]/30"
               )}
             >
               {isOverallPlaying ? "PAUSE" : "PLAY"}
             </button>
             <button 
               onClick={() => setRemainingSessionTime(predictedTotalTime)}
               className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-[var(--muted)] hover:text-white"
               title="Reset Countdown"
             >
               ↺
             </button>
           </div>
         </div>

         {/* Mini Set / Rest Phase Tracker */}
         <div className="bg-gradient-to-br from-black/60 to-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col justify-between">
           <div>
             <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Mini Set Timer</span>
             <div className="text-2xl font-black italic tracking-tighter text-[var(--accent)] tabular-nums mt-1">
               {isActive ? "RESTING" : formatTime(miniSetSeconds)}
             </div>
             <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-wider">
               {isActive ? `Set ${currentSet - 1} Recover` : `Set ${currentSet} Work Effort`}
             </p>
           </div>
           
           <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">
             <span>Remaining:</span>
             <span className="text-white font-[950]">{totalSets - currentSet + 1} Left</span>
           </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-20">
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
