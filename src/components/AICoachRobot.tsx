import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export type CoachRobotMode = 'idle' | 'greeting' | 'listening' | 'thinking' | 'alert';

interface AICoachRobotProps {
  mode?: CoachRobotMode;
  size?: number | string;
  className?: string;
  showSpeechBubble?: boolean;
  speechText?: string;
}

export default function AICoachRobot({
  mode = 'idle',
  size = 120,
  className = '',
  showSpeechBubble = false,
  speechText = '',
}: AICoachRobotProps) {
  const [blink, setBlink] = useState(false);

  // Periodic blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  // Set transitions based on active mode
  // 1. Floating & Breathing
  const isThinking = mode === 'thinking';
  const isAlert = mode === 'alert';
  const isListening = mode === 'listening';
  const isGreeting = mode === 'greeting';

  const floatingTransition: any = {
    y: {
      duration: isThinking ? 1.5 : isAlert ? 0.6 : 3,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
    },
    rotate: isThinking ? {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
    } : undefined,
  };

  const floatValues = isThinking 
    ? { y: [-6, 6], rotate: [-4, 4] } 
    : isAlert 
    ? { y: [-2, 2], x: [-1, 1] } 
    : isListening
    ? { y: [-3, 3] }
    : { y: [-5, 5] };

  // Hand wave animations
  const waveVariants: any = {
    idle: { rotate: 0 },
    greeting: {
      rotate: [0, -35, -15, -35, -15, 0],
      transition: { duration: 1.8, ease: "easeInOut" }
    },
    listening: { rotate: -5 },
    thinking: { rotate: [0, -10, 0], transition: { repeat: Infinity, duration: 2 } },
    alert: { rotate: -15, y: [0, -2, 0], transition: { repeat: Infinity, duration: 1 } },
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Speech bubble or Sound Wave indicator */}
      {showSpeechBubble && speechText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-14 bg-[var(--card2)] text-[10px] text-white font-black uppercase tracking-wider py-1.5 px-3 rounded-full border border-[var(--border)] max-w-[150px] whitespace-nowrap text-center shadow-lg truncate z-30"
          style={{}}
        >
          {speechText}
          <div className="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-[var(--card2)] border-[var(--border)] border-r border-b rotate-45" />
        </motion.div>
      )}

      {/* Typing Indicator / Glowing speaking waves under or around the robot */}
      {isThinking && (
        <div className="absolute -top-3 flex gap-1 items-center justify-center bg-black/40 px-2 py-1 rounded-full border border-white/10 z-20">
          <motion.span 
            animate={{ y: [0, -4, 0] }} 
            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} 
            className="w-1.5 h-1.5 bg-white rounded-full" 
          />
          <motion.span 
            animate={{ y: [0, -4, 0] }} 
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} 
            className="w-1.5 h-1.5 bg-white rounded-full" 
          />
          <motion.span 
            animate={{ y: [0, -4, 0] }} 
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} 
            className="w-1.5 h-1.5 bg-white rounded-full" 
          />
        </div>
      )}

      {/* Main companion container with float animation */}
      <motion.div
        animate={floatValues}
        transition={floatingTransition}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Soft 3D Glow effects behind the robot body */}
        <div 
          className={`absolute rounded-full transition-all duration-500 blur-xl opacity-20 pointer-events-none`}
          style={{
            width: '80%',
            height: '80%',
            background: isAlert 
              ? 'radial-gradient(circle, #ef4444 0%, transparent 70%)' 
              : 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            boxShadow: isAlert ? '0 0 40px rgba(239, 68, 68, 0.4)' : 'none',
          }}
        />

        {/* Dynamic Sound Wave pulse if listening or speaking */}
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <motion.div 
              animate={{ scale: [1.1, 1.4, 1.1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute w-24 h-24 rounded-full border-2 border-[var(--accent)]"
            />
            <motion.div 
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.5 }}
              className="absolute w-20 h-20 rounded-full border border-[var(--accent)]/55"
            />
          </div>
        )}

        {/* Robot Vector Drawing */}
        <svg 
          viewBox="0 0 160 160" 
          className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
        >
          <defs>
            {/* Body gradient - creates a beautiful rounded, soft matte 3D plastic look */}
            <radialGradient id="robotBodyGrad" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#f3f4f6" />
              <stop offset="100%" stopColor="#d1d5db" />
            </radialGradient>
            
            {/* Soft accent joints */}
            <linearGradient id="jointGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e5e7eb" />
              <stop offset="100%" stopColor="#9ca3af" />
            </linearGradient>

            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* BACKGROUND SHADOW */}
          <ellipse cx="80" cy="142" rx="35" ry="5" fill="#000000" opacity="0.35" className="blur-[1px] transform origin-center" />

          {/* ROBOT LOWER FEET */}
          <g>
            <motion.path
              d="M 52 115 C 52 135, 68 135, 68 115"
              fill="url(#robotBodyGrad)"
              stroke="#cbd5e1"
              strokeWidth="1"
              animate={isAlert ? { x: [-1, 1, -1] } : undefined}
              transition={{ repeat: Infinity, duration: 0.2 }}
            />
            <motion.path
              d="M 92 115 C 92 135, 108 135, 108 115"
              fill="url(#robotBodyGrad)"
              stroke="#cbd5e1"
              strokeWidth="1"
              animate={isAlert ? { x: [1, -1, 1] } : undefined}
              transition={{ repeat: Infinity, duration: 0.2 }}
            />
          </g>

          {/* CHUBBY TORSO / BODY */}
          <motion.rect
            x="44"
            y="56"
            width="72"
            height="65"
            rx="36"
            cx="80"
            cy="88"
            fill="url(#robotBodyGrad)"
            stroke="#e2e8f0"
            strokeWidth="0.5"
            animate={isAlert ? 
              { scaleX: [1, 0.97, 1], scaleY: [1, 1.03, 1], x: [-1, 1, -1] } : 
              { scaleY: [1, 1.03, 1], scaleX: [1, 1.01, 1] }
            }
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="origin-bottom"
          >
            {/* Port detail on chest like Baymax's card slot */}
            <circle cx="92" cy="74" r="5" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.5" />
            <line x1="89.5" y1="74" x2="94.5" y2="74" stroke="#9ca3af" strokeWidth="0.5" />
          </motion.rect>

          {/* LEFT ARM (Wave hand) */}
          <g className="origin-[52px_65px]">
            <motion.path
              d="M 45 62 C 28 62, 22 75, 26 92 C 28 100, 36 100, 34 92 C 32 82, 38 72, 45 74 Z"
              fill="url(#robotBodyGrad)"
              stroke="#cbd5e1"
              strokeWidth="0.5"
              variants={waveVariants}
              animate={mode}
              className="origin-[45px_65px]"
            />
          </g>

          {/* RIGHT ARM (Relaxed / Subtle breath) */}
          <g className="origin-[108px_65px]">
            <motion.path
              d="M 115 62 C 132 62, 138 75, 134 92 C 132 100, 124 100, 126 92 C 128 82, 122 72, 115 74 Z"
              fill="url(#robotBodyGrad)"
              stroke="#cbd5e1"
              strokeWidth="0.5"
              animate={isGreeting ? { rotate: -5, y: -2 } : isThinking ? { rotate: 5 } : { rotate: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              className="origin-[115px_65px]"
            />
          </g>

          {/* JOINT CONNECTOR - CHEST TO HEAD */}
          <ellipse cx="80" cy="56" rx="14" ry="4" fill="url(#jointGrad)" />

          {/* ROUNDED MATTE WHITE HEAD */}
          <motion.g
            animate={
              isThinking 
                ? { rotate: [7, 7, 7], y: 1 } 
                : isListening 
                ? { rotate: [-10, -10], y: 0.5 } 
                : isAlert 
                ? { rotate: [0, -2, 2, -2, 0], y: [-1, 1, -1] } 
                : isGreeting
                ? { rotate: [5, 0, 5], scale: [1, 1.02, 1] }
                : { rotate: [-2, 2, -2] }
            }
            transition={isAlert ? { repeat: Infinity, duration: 0.4 } : { repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="origin-[80px_54px]"
          >
            {/* Rounded Soft Oval Head */}
            <ellipse 
              cx="80" 
              cy="40" 
              rx="33" 
              ry="24" 
              fill="url(#robotBodyGrad)" 
              stroke="#e2e8f0"
              strokeWidth="0.5"
            />

            {/* FACE: TWO BLACK EYE CIRCLES CONNECTED BY A THIN BLACK LINE */}
            <g className="origin-center">
              <line 
                x1="66" 
                y1="40" 
                x2="94" 
                y2="40" 
                stroke={isAlert ? "#ef4444" : "#1f2937"} 
                strokeWidth="1.5" 
              />
              
              {/* Left Eye */}
              <motion.circle 
                cx="66" 
                cy="40" 
                r={isAlert ? "4" : "3.5"} 
                fill={isAlert ? "#ef4444" : "#111827"} 
                style={{ scaleY: blink ? 0.1 : 1 }}
                animate={isAlert ? { scale: [1, 1.15, 1] } : undefined}
                transition={{ repeat: Infinity, duration: 1 }}
                className="origin-[66px_40px]"
              />

              {/* Right Eye */}
              <motion.circle 
                cx="94" 
                cy="40" 
                r={isAlert ? "4" : "3.5"} 
                fill={isAlert ? "#ef4444" : "#111827"} 
                style={{ scaleY: blink ? 0.1 : 1 }}
                animate={isAlert ? { scale: [1, 1.15, 1] } : undefined}
                transition={{ repeat: Infinity, duration: 1 }}
                className="origin-[94px_40px]"
              />

              {/* Sweat drop / Alert detail */}
              {isAlert && (
                <path d="M 80 43 L 80 48" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </g>
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
