import { motion } from 'framer-motion';

interface JarvisOrbProps {
  state: 'idle' | 'listening' | 'speaking' | 'thinking';
  size?: number;
}

export default function JarvisOrb({ state, size = 180 }: JarvisOrbProps) {
  // Map states to color pulses and scale ranges
  const stateConfig = {
    idle: {
      color: 'from-cyan-500/30 to-blue-600/30',
      borderColor: 'border-cyan-500/40',
      glowColor: 'shadow-cyan-500/20',
      scale: [1, 1.05, 1],
      duration: 4
    },
    listening: {
      color: 'from-red-500/40 to-rose-600/40',
      borderColor: 'border-red-500/50',
      glowColor: 'shadow-red-500/30',
      scale: [1, 1.15, 0.95, 1.1, 1],
      duration: 1.5
    },
    speaking: {
      color: 'from-emerald-500/40 to-cyan-500/40',
      borderColor: 'border-emerald-500/50',
      glowColor: 'shadow-emerald-500/30',
      scale: [1, 1.12, 1.02, 1.15, 1],
      duration: 2
    },
    thinking: {
      color: 'from-indigo-500/40 to-purple-600/40',
      borderColor: 'border-indigo-500/50',
      glowColor: 'shadow-indigo-500/30',
      scale: [1, 0.95, 1.08, 0.98, 1],
      duration: 1.2
    }
  };

  const current = stateConfig[state] || stateConfig.idle;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Holographic Glow Aura */}
      <motion.div
        animate={{
          scale: current.scale,
          opacity: [0.15, 0.35, 0.15]
        }}
        transition={{
          duration: current.duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${current.color} blur-xl`}
      />

      {/* Outer Rotating Cyber Ring 1 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className={`absolute w-[98%] h-[98%] rounded-full border border-dashed ${current.borderColor} opacity-30`}
      />

      {/* Middle Counter-Rotating Ring 2 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className={`absolute w-[86%] h-[86%] rounded-full border border-double ${current.borderColor} opacity-40`}
      />

      {/* Innermost Tech Calibration ticks */}
      <motion.div
        animate={{ rotate: 90 }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[72%] h-[72%] rounded-full border border-white/5 flex items-center justify-center"
      >
        <div className="w-1 h-full bg-cyan-400/20 absolute" />
        <div className="h-1 w-full bg-cyan-400/20 absolute" />
      </motion.div>

      {/* Main Glass AI Core Orb */}
      <motion.div
        animate={{
          scale: current.scale,
          boxShadow: `0 0 40px rgba(${state === 'listening' ? '239, 68, 68' : state === 'speaking' ? '16, 185, 129' : '6, 182, 212'}, 0.35)`
        }}
        transition={{
          duration: current.duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`w-[60%] h-[60%] rounded-full bg-gradient-to-tr ${current.color} backdrop-blur-md border ${current.borderColor} flex items-center justify-center relative z-10 shadow-2xl`}
      >
        {/* Internal Core Pulsing Engine */}
        <motion.div
          animate={{
            scale: [0.8, 1.15, 0.8],
            opacity: [0.6, 0.95, 0.6]
          }}
          transition={{
            duration: current.duration / 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`w-[45%] h-[45%] rounded-full bg-white/15 backdrop-blur-sm border border-white/20`}
        />
        
        {/* Center Sparkle node */}
        <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_12px_#fff] z-20" />
      </motion.div>
    </div>
  );
}
