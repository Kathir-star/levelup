import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Helper to parse rest intervals (e.g. "60s" -> 60, "2min" -> 120)
export function parseRestSeconds(restStr: string): number {
  const raw = String(restStr || '').toLowerCase().trim();
  if (raw.includes('min')) {
    const match = raw.match(/[\d.]+/);
    return match ? Math.round(parseFloat(match[0]) * 60) : 120;
  }
  const match = raw.match(/\d+/);
  return match ? parseInt(match[0], 10) : 60;
}

// Calculate session duration in seconds
export function calculateWorkoutDuration(exercises: { sets: string; rest: string }[]): number {
  if (!exercises || exercises.length === 0) return 0;
  
  let totalSeconds = 0;
  // Constant effort duration per set is 120 seconds (as requested for perfect ≈ 45 min for 5x3x60s example)
  const setEffortSeconds = 120; 

  exercises.forEach((ex) => {
    const setsCount = parseInt(ex.sets, 10) || 3;
    const restSeconds = parseRestSeconds(ex.rest);
    
    // Each set contains 1 segment of effort and 1 segment of rest
    totalSeconds += setsCount * (setEffortSeconds + restSeconds);
  });

  return totalSeconds;
}

interface SessionTimerProps {
  totalTime: number; // in seconds
  onComplete?: () => void;
  dayName?: string;
}

export default function SessionTimer({ totalTime, onComplete, dayName }: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const timerIdRef = useRef<number | null>(null);

  // Sync with totalTime prop on load / change when idle
  useEffect(() => {
    if (status === 'idle') {
      setTimeLeft(totalTime);
    }
  }, [totalTime, status]);

  // Handle countdown interval
  useEffect(() => {
    if (status === 'running') {
      timerIdRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    }

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [status]);

  const handleStart = () => {
    if (timeLeft > 0) {
      setStatus('running');
    }
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleReset = () => {
    setStatus('idle');
    setTimeLeft(totalTime);
  };

  // Modern Web Audio buzzer
  const triggerAlarmSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const audioCtx = new AudioCtx();
      
      // Sequence of 3 high-energy motivational beeps
      const playBeep = (delay: number, pitch: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, audioCtx.currentTime + delay);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
        
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };

      // Play escalating triple beep for high motivation
      playBeep(0, 523.25, 0.4);      // C5
      playBeep(0.4, 659.25, 0.4);    // E5
      playBeep(0.8, 783.99, 0.8);    // G5
    } catch (err) {
      console.warn("Web Audio API failed, trying HTML5 Audio fallback", err);
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play blocked:", e));
      } catch (e) {
        console.error("No fallback audio support", e);
      }
    }
  };

  const handleComplete = () => {
    setStatus('completed');
    triggerAlarmSound();
    if (onComplete) {
      onComplete();
    }
  };

  const formatMinSec = (secs: number) => {
    if (secs < 0) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Progress Bar percentage
  const progressPct = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;

  return (
    <div 
      id={`session-timer-${dayName || 'current'}`}
      className={cn(
        "flex flex-col sm:flex-row items-center gap-4 py-2 px-4 rounded-2xl border transition-all duration-500 max-w-md w-full sm:w-auto bg-black/40",
        status === 'running' && "border-[var(--red)]/40 shadow-[0_0_15px_rgba(239,68,68,0.1)] bg-red-950/10",
        status === 'completed' && "border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)] bg-emerald-950/10 animate-bounce",
        status === 'idle' && "border-white/5",
        status === 'paused' && "border-amber-500/20"
      )}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase text-[var(--muted)] tracking-wider block">Total Session Time</span>
          <AnimatePresence mode="wait">
            {status === 'completed' ? (
              <motion.div 
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                className="text-emerald-400 font-display font-black text-xs uppercase italic flex items-center gap-1 mt-0.5"
              >
                <CheckCircle size={10} /> Workout Complete!
              </motion.div>
            ) : (
              <span className="text-[10px] text-white/50 font-black uppercase tracking-widest block mt-0.5">
                Estimated duration
              </span>
            )}
          </AnimatePresence>
        </div>

        {/* Big digits display */}
        <div className="relative font-mono font-black text-[22px] tracking-tight text-white select-none pr-1 pl-3 tabular-nums flex items-baseline gap-1">
          <span className={cn(
            "transition-colors duration-300",
            status === 'running' && "text-[var(--red)] drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]",
            status === 'completed' && "text-emerald-400 animate-pulse",
            status === 'paused' && "text-amber-400"
          )}>
            {formatMinSec(timeLeft)}
          </span>
        </div>
      </div>

      {/* Control Actions Row */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-white transition-colors"
          title={soundEnabled ? "Mute buzzer alert" : "Unmute buzzer alert"}
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>

        <div className="flex items-center gap-1">
          {status === 'running' ? (
            <button 
              onClick={handlePause}
              className="py-1 px-2.5 rounded-lg text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            >
              <Pause size={10} /> Pause
            </button>
          ) : status === 'completed' ? (
            <button 
              onClick={handleReset}
              className="py-1 px-2.5 rounded-lg text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={10} /> Reset
            </button>
          ) : (
            <button 
              onClick={handleStart}
              className="py-1 px-3 rounded-lg text-[10px] bg-[var(--red)] hover:brightness-110 shadow-lg shadow-[var(--red)]/10 text-white transition-all font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            >
              <Play size={10} fill="currentColor" /> Start
            </button>
          )}

          {status !== 'idle' && status !== 'completed' && (
            <button 
              onClick={handleReset}
              className="p-1.5 border border-white/5 hover:border-white/10 rounded-lg text-[var(--muted)] hover:text-white transition-colors cursor-pointer"
              title="Reset"
            >
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </div>

      {/* High precision tiny visual progress indicator in background */}
      {status === 'running' && (
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/5 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-[var(--red)] transition-all duration-1000" 
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}
