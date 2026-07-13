import { useState, useEffect, useRef } from 'react';
import { MuscleGroup, Exercise } from '../types';
import { cn } from '../lib/utils';
import { Play, Pause, RotateCcw, X, CheckCircle2, Flame, Trophy, Star, FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CircularTimer from './common/CircularTimer';
import { MOTIVATIONAL_MESSAGES, TAMIL_MOTIVATIONAL_MESSAGES } from '../constants';
import confetti from 'canvas-confetti';

const formatTime = (s: number) => {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

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

  // Dedicated Warm-up Section States
  const [showWarmup, setShowWarmup] = useState(true);
  const [warmupSeconds, setWarmupSeconds] = useState(300); // 5 minutes timer
  const [isWarmupPlaying, setIsWarmupPlaying] = useState(true);
  const [selectedStretch, setSelectedStretch] = useState(0);

  const warmupDrills = [
    {
      name: "Dynamic Arm Circles & Swings",
      benefit: "Lubricates glenohumeral socket and primes rotator cuff fibers for pushing and pulling loads.",
      instructions: "Execute 15 wide forward rotations, then 15 backward circles. Focus on clean kinetic control.",
      animation: "circles"
    },
    {
      name: "Deep Thoracic Expansion",
      benefit: "Restores crucial thoracic spine mobility and corrects common posture patterns before reps.",
      instructions: "Adopt a tall athletic stance. Inhale deep, fully draw arms out and expand chest, stretching t-spine limits.",
      animation: "expand"
    },
    {
      name: "Sovereign Spinal Wave flexion",
      benefit: "Hydrates spinal discs, ignites neural connectivity for maximum heavy lifts and core stabilizer activation.",
      instructions: "Perform fluid spinal extension and flexion or lateral leg swings with paced deep rib breathing.",
      animation: "wave"
    }
  ];

  const isTamil = document.documentElement.dataset.tamil === 'true';
  const messages = isTamil ? TAMIL_MOTIVATIONAL_MESSAGES : MOTIVATIONAL_MESSAGES;
  const [message, setMessage] = useState(messages[0]);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showSetPulse, setShowSetPulse] = useState(false);
  const [isSetDoneAnimation, setIsSetDoneAnimation] = useState(false);
  const [isPR] = useState(() => Math.random() > 0.4);

  // Dedicated Warm-up Timer Loop
  useEffect(() => {
    let interval: number | undefined;
    if (showWarmup && isWarmupPlaying && warmupSeconds > 0) {
      interval = window.setInterval(() => {
        setWarmupSeconds(prev => {
          if (prev <= 1) {
            setShowWarmup(false); // Auto transition upon finish
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showWarmup, isWarmupPlaying, warmupSeconds]);

  // Synthesize Completion Sound using Web Audio API
  const playCompletionSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioRef.current && AudioContext) {
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
      }
    } catch (err) {
      console.warn('Web Audio API Blocked or Unresponsive:', err);
    }
  };

  const audioRef = useRef<any>(null);

  // Main Timer Loop
  useEffect(() => {
    let msgCounter = 0;
    const interval = window.setInterval(() => {
      if (isOverallPlaying && !showWarmup) {
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
  }, [isOverallPlaying, isActive, showWarmup]);

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

  if (showWarmup) {
    return (
      <div id="workout-warmup-screen" className="fixed inset-0 bg-neutral-950 z-[400] flex flex-col p-4 sm:p-6 overflow-y-auto animate-in fade-in zoom-in-95 duration-300 select-none">
        
        {/* Brand / Title HUD Bar */}
        <div className="flex items-center justify-between border-b border-red-500/20 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500 animate-pulse border border-red-500/20">
              <Flame size={20} />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase text-red-500 tracking-[0.25em]">LEVELUP DISCIPLINE PROTOCOL</div>
              <h1 className="font-display text-xl text-white font-black tracking-wider uppercase leading-none">MOBILIZATION & WARM-UP</h1>
            </div>
          </div>
          <button 
            id="cancel-warmup-btn"
            onClick={onCancel}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Tamil or English Header Subtext */}
        <div className="bg-red-950/20 border border-red-500/20 py-2.5 px-4 rounded-xl text-center mb-4 text-xs font-black text-white uppercase tracking-wider">
          ⚔️ {isTamil ? "சோம்பலை ஒழி. உன்னைப் புதிய சிகரத்திற்குத் தயார் செய்." : "PRIME THE MACHINE. UNLOCK JOINTS FOR PEAK LOADS."}
        </div>

        {/* Warmup Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mb-5">
          
          {/* Left panel: 5-Minute Timer & Controls */}
          <div id="warmup-timer-card" className="glass-card bg-neutral-900/60 p-5 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-red-600/[0.01] pointer-events-none" />
            
            <div className="text-center relative z-10 py-4">
              <span className="text-[10px] font-black text-red-500/90 uppercase tracking-[0.3em]">MANDATORY CALIBRATION WINDOW</span>
              
              <div className="text-7xl md:text-8xl font-display font-black text-white italic tracking-tighter tabular-nums mt-2 drop-shadow-[0_0_20px_rgba(235,9,20,0.25)]">
                {formatTime(warmupSeconds)}
              </div>
              
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-2">Required stretch counter for dynamic safety</p>
            </div>

            {/* Timer Playback Buttons */}
            <div className="flex items-center justify-center gap-4 relative z-10 my-4">
              <button
                id="reset-warmup-timer"
                onClick={() => setWarmupSeconds(300)}
                className="p-3.5 rounded-2xl bg-neutral-950 border border-white/5 text-neutral-400 hover:text-white hover:border-white/20 transition-all cursor-pointer active:scale-95"
                title="Reset to 5-min Warm-up"
              >
                <RotateCcw size={20} />
              </button>

              <button
                id="toggle-warmup-timer"
                onClick={() => setIsWarmupPlaying(!isWarmupPlaying)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-95 border ${
                  isWarmupPlaying 
                    ? "bg-red-600 text-white shadow-red-600/20 border-red-500" 
                    : "bg-white text-black shadow-white/5 border-white"
                }`}
              >
                {isWarmupPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>

              <button
                id="fastforward-warmup-timer"
                onClick={() => setWarmupSeconds(prev => Math.max(0, prev - 30))}
                className="p-3.5 rounded-2xl bg-neutral-950 border border-white/5 text-neutral-400 hover:text-white hover:border-white/20 transition-all cursor-pointer active:scale-95"
                title="Skip forward 30 seconds"
              >
                <FastForward size={20} />
              </button>
            </div>

            {/* Direct Trigger to skipping the Warmup */}
            <button
              id="skip-warmup-action-btn"
              onClick={() => setShowWarmup(false)}
              className="w-full mt-2 py-3 md:py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-[#b50710] hover:from-red-500 hover:to-red-600 text-white font-display font-black text-sm uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-red-600/10 border border-red-500/30 relative z-10 active:scale-[0.99]"
            >
              🚀 SKIP WARMUP • INITIATE MAIN REPS
            </button>
          </div>

          {/* Right panel: Live Stretching Animation & Details */}
          <div id="warmup-instruction-card" className="glass-card bg-neutral-900/60 p-5 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="text-center">
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-none">STRETCH DIRECTIVE</span>
              <h3 className="text-2xl font-display font-black text-white italic uppercase tracking-wider mt-1.5">{warmupDrills[selectedStretch].name}</h3>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed font-medium uppercase font-sans">
                {warmupDrills[selectedStretch].benefit}
              </p>
            </div>

            {/* Dynamic Stretch Animation Layout */}
            <div className="flex items-center justify-center py-6 relative">
              <div className="w-40 h-40 border border-white/5 rounded-full flex items-center justify-center bg-black/55 relative overflow-hidden shadow-inner">
                
                {/* 1. Circles stretching animation */}
                {warmupDrills[selectedStretch].animation === "circles" && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                      className="absolute w-28 h-28 rounded-full border-4 border-dashed border-red-500/20"
                    />
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute w-20 h-20 rounded-full border border-yellow-500/30 flex items-center justify-center"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500 absolute"
                    />
                    <span className="text-3xl z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">🔄</span>
                  </div>
                )}

                {/* 2. Expand chest stretching animation */}
                {warmupDrills[selectedStretch].animation === "expand" && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div 
                      animate={{ scale: [1, 1.35, 1] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      className="absolute w-20 h-20 rounded-full bg-red-600/10 border-2 border-red-500/30"
                    />
                    <motion.div 
                      animate={{ scale: [1.2, 0.8, 1.2] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      className="absolute w-28 h-28 rounded-full bg-yellow-400/5 border border-yellow-400/20"
                    />
                    <span className="text-4xl z-10 animate-bounce absolute">🧘</span>
                  </div>
                )}

                {/* 3. Spinal Wave stretching animation */}
                {warmupDrills[selectedStretch].animation === "wave" && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg className="absolute w-28 h-28" viewBox="0 0 100 100">
                      <motion.path 
                        animate={{ d: [
                          "M 10 50 Q 30 20, 50 50 T 90 50",
                          "M 10 50 Q 30 80, 50 50 T 90 50",
                          "M 10 50 Q 30 20, 50 50 T 90 50"
                        ]}}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        fill="none" 
                        stroke="var(--red)" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-3xl z-10 relative">💪</span>
                  </div>
                )}
              </div>
            </div>

            {/* Instruction directive box */}
            <div className="bg-black/45 border border-white/5 rounded-2xl p-3 px-4 text-center text-[11px] text-neutral-300 leading-relaxed font-sans font-semibold">
              <span className="text-red-500 font-black uppercase text-[9px] tracking-widest block mb-0.5">HOW TO PERFORM:</span>
              {warmupDrills[selectedStretch].instructions}
            </div>
          </div>

        </div>

        {/* Bottom Drill Select Buttons Block */}
        <div className="space-y-2 shrink-0">
          <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">SWITCH WARM-UP DIRECTIVE DRILLS ({warmupDrills.length})</div>
          <div className="grid grid-cols-3 gap-2.5">
            {warmupDrills.map((drill, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedStretch(idx)}
                className={`py-2 px-2 text-center rounded-2xl border text-xs uppercase font-black transition-all cursor-pointer flex flex-col justify-between h-16 ${
                  selectedStretch === idx 
                    ? "bg-red-600/10 border-red-500 text-white shadow-[0_0_12px_rgba(229,9,20,0.2)]" 
                    : "bg-neutral-900 border-white/5 text-neutral-400 hover:border-neutral-700 hover:text-white"
                }`}
              >
                <span>DRILL 0{idx + 1}</span>
                <span className="truncate w-full block font-bold text-[9px] mt-1 text-yellow-500">{drill.name.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    );
  }

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
