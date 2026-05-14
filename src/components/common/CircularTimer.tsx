import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, X, Volume2, VolumeX, FastForward } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CircularTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  onClose: () => void;
  autoStart?: boolean;
}

export default function CircularTimer({ 
  initialSeconds, 
  onComplete, 
  onClose,
  autoStart = true 
}: CircularTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSeconds = initialSeconds;
  const progress = (timeLeft / totalSeconds) * 100;
  
  // Circular attributes
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    if (soundEnabled) {
      playBeep();
    }
    if (onComplete) onComplete();
  };

  const playBeep = () => {
    if (!audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }
    audioRef.current.play().catch(e => console.log('Sound blocked:', e));
  };

  const resetTimer = () => {
    setTimeLeft(initialSeconds);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Color mapping based on time remaining
  const getColor = () => {
    if (progress > 50) return 'var(--green)';
    if (progress > 20) return 'var(--yellow)';
    return 'var(--red)';
  };

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      className="bg-[var(--card)] border-2 border-[var(--border)] rounded-[40px] p-8 shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden"
    >
      {/* Background glow */}
      <div 
        className="absolute inset-0 opacity-10 transition-colors duration-500" 
        style={{ backgroundColor: getColor() }} 
      />

      <div className="relative z-10 flex items-center justify-between w-full">
        <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors text-[var(--muted)]"
        >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] italic">Rest Sequence</div>
        <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--red)]/10 hover:text-[var(--red)] transition-colors text-[var(--muted)]"
        >
            <X size={18} />
        </button>
      </div>

      <div className="relative flex items-center justify-center w-48 h-48">
        <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-[var(--sub)]"
          />
          {/* Progress circle */}
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            stroke={getColor()}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "linear" }}
            strokeLinecap="round"
            className="transition-colors duration-500"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div 
             key={timeLeft}
             initial={{ scale: 0.95 }}
             animate={{ scale: timeLeft < 10 && isActive ? [1, 1.1, 1] : 1 }}
             transition={{ duration: 1, repeat: timeLeft < 10 ? Infinity : 0 }}
             className="text-5xl font-display font-black text-white italic tracking-tighter tabular-nums"
          >
            {formatTime(timeLeft)}
          </motion.div>
          <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mt-1">SECONDS REMAINING</div>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-4">
        <button 
            onClick={resetTimer}
            className="p-4 rounded-3xl bg-[var(--sub)] border border-[var(--border)] text-[var(--muted)] hover:text-white transition-all active:scale-95"
        >
            <RotateCcw size={24} />
        </button>
        
        <button 
            onClick={() => setIsActive(!isActive)}
            className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95",
                isActive 
                    ? "bg-[var(--sub)] text-white border border-white/10" 
                    : "bg-white text-black scale-110 shadow-white/10"
            )}
        >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>

        <button 
            onClick={() => setTimeLeft(Math.max(0, timeLeft - 10))}
            className="p-4 rounded-3xl bg-[var(--sub)] border border-[var(--border)] text-[var(--muted)] hover:text-white transition-all active:scale-95"
        >
            <FastForward size={24} />
        </button>
      </div>

      {/* Preset buttons */}
      <div className="relative z-10 flex gap-2">
        {[30, 60, 90].map((s) => (
            <button 
                key={s}
                onClick={() => { setTimeLeft(s); setIsActive(true); }}
                className="px-4 py-2 border border-[var(--border)] rounded-xl text-[10px] font-black text-[var(--muted)] uppercase hover:border-[var(--accent)] hover:text-white transition-all"
            >
                {s}s
            </button>
        ))}
      </div>
    </motion.div>
  );
}
