import { useState } from 'react';
import { MuscleGroup, Exercise } from '../types';
import { EXERCISE_LIB } from '../constants';
import { cn } from '../lib/utils';
import { Play, X, Activity, Flame, ShieldAlert, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MuscleVisualizerProps {
  onStartWorkout: (muscle: MuscleGroup, exercise: Exercise) => void;
  muscleData?: Record<string, number>;
}

export default function MuscleVisualizer({ onStartWorkout, muscleData = {} }: MuscleVisualizerProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  const muscleGroups: { id: MuscleGroup; label: string; recovery: number; image: string }[] = [
    { id: 'Abs', label: 'Abs', recovery: 100, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=200&h=200&auto=format&fit=crop' },
    { id: 'Back', label: 'Back', recovery: 100, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200&h=200&auto=format&fit=crop' },
    { id: 'Biceps', label: 'Biceps', recovery: 100, image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=200&h=200&auto=format&fit=crop' },
    { id: 'Chest', label: 'Chest', recovery: 100, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&h=200&auto=format&fit=crop' },
    { id: 'Glutes', label: 'Glutes', recovery: 100, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=200&h=200&auto=format&fit=crop' },
    { id: 'Hamstrings', label: 'Hamstrings', recovery: 100, image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=200&h=200&auto=format&fit=crop' },
    { id: 'Quadriceps', label: 'Quadriceps', recovery: 100, image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=200&h=200&auto=format&fit=crop' },
    { id: 'Shoulder', label: 'Shoulders', recovery: 100, image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=200&h=200&auto=format&fit=crop' },
    { id: 'Triceps', label: 'Triceps', recovery: 100, image: 'https://images.unsplash.com/photo-1590239098509-e010dfc4fcad?q=80&w=200&h=200&auto=format&fit=crop' },
  ];

  // Frequency to Color & Opacity mapping function (Task 1 specification)
  // 0 -> transparent
  // 1 -> light blue (low opacity)
  // 2-3 -> green (medium opacity)
  // 4-5 -> orange (higher opacity)
  // 6+ -> red (high opacity)
  const getMuscleHeatmapStyle = (muscleId: string) => {
    const count = muscleData[muscleId] || 0;

    if (count <= 0) {
      return {
        fill: 'rgba(255, 255, 255, 0.04)',
        stroke: 'rgba(255, 255, 255, 0.18)',
        strokeWidth: 1,
        opacity: 0.3,
        label: '0 Workouts (Untrained)',
        colorName: 'Transparent'
      };
    }
    if (count === 1) {
      return {
        fill: '#60a5fa', // light blue
        stroke: '#93c5fd',
        strokeWidth: 1.5,
        opacity: 0.5,
        label: '1 Workout (Light Volume)',
        colorName: 'Light Blue'
      };
    }
    if (count <= 3) {
      return {
        fill: '#22c55e', // green
        stroke: '#4ade80',
        strokeWidth: 1.8,
        opacity: 0.7,
        label: `${count} Workouts (Optimal)`,
        colorName: 'Green'
      };
    }
    if (count <= 5) {
      return {
        fill: '#f97316', // orange
        stroke: '#fb923c',
        strokeWidth: 2,
        opacity: 0.85,
        label: `${count} Workouts (High Volume)`,
        colorName: 'Orange'
      };
    }
    return {
      fill: '#ef4444', // red
      stroke: '#f87171',
      strokeWidth: 2.2,
      opacity: 0.95,
      label: `${count}+ Workouts (Intense Volume)`,
      colorName: 'Red'
    };
  };

  const handleMuscleSelect = (id: MuscleGroup) => {
    setSelectedMuscle(id);
    setIsGenerating(true);
    setGenProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setGenProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsGenerating(false), 300);
      }
    }, 40);
  };

  if (isGenerating) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <h2 className="font-display text-4xl text-white tracking-widest uppercase">Generating your workout</h2>
          <p className="text-[var(--muted)] text-sm uppercase tracking-widest">Tailoring exercises for {selectedMuscle} • {level}</p>
        </div>
        
        <div className="flex gap-8">
          {[0.7, 1, 0.85].map((scale, i) => (
            <div key={i} className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="var(--border)" strokeWidth="2" fill="transparent" />
                <motion.circle 
                  cx="64" cy="64" r="58" stroke="var(--accent)" strokeWidth="6" fill="transparent"
                  strokeDasharray={364.42}
                  strokeDashoffset={364.42 - (genProgress * scale / 100) * 364.42}
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_8px_var(--accent-glow)]"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-white">{Math.min(100, Math.round(genProgress * scale))}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-64 h-1 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[var(--accent)]"
            initial={{ width: 0 }}
            animate={{ width: `${genProgress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* TASK 1: REALISTIC HUMAN ANATOMY SVG HEATMAP OVERLAY */}
      <div className="glass-card p-6 border border-[var(--border)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[var(--accent)]" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Anatomical Muscle Heatmap (Last 7 Days)</h3>
            </div>
            <p className="text-[var(--muted)] text-xs mt-1 font-medium">
              Realistic muscle frequency visualization. Click any highlighted region to generate target exercises.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 bg-[var(--sub)] p-2.5 rounded-2xl border border-[var(--border)]">
            <span className="text-[9px] font-black uppercase text-[var(--muted)] tracking-wider">Frequency:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 opacity-60" />
              <span className="text-[10px] text-white font-bold">1x (Light)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-75" />
              <span className="text-[10px] text-white font-bold">2-3x (Optimal)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 opacity-85" />
              <span className="text-[10px] text-white font-bold">4-5x (High)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-95 animate-pulse" />
              <span className="text-[10px] text-white font-bold">6+x (Intense)</span>
            </div>
          </div>
        </div>

        {/* Anatomical Front & Back SVG Models */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center justify-center max-w-2xl mx-auto py-4">
          
          {/* FRONT VIEW ANATOMICAL SVG */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--muted)] mb-3 flex items-center gap-1">
              Anterior View (Front)
            </span>
            <div className="relative w-52 h-96 bg-[var(--card2)]/50 rounded-3xl p-2 border border-[var(--border)] shadow-xl flex items-center justify-center">
              <svg viewBox="0 0 220 400" className="w-full h-full filter drop-shadow-md select-none">
                {/* Body Base Silhouette (Human Frame) */}
                <g fill="#18181b" stroke="#3f3f46" strokeWidth="1.5">
                  {/* Head & Neck */}
                  <circle cx="110" cy="32" r="18" />
                  <path d="M 102 48 L 118 48 L 120 62 L 100 62 Z" />
                  {/* Torso & Pelvis Frame */}
                  <path d="M 100 62 C 80 66 68 76 64 92 C 60 110 64 135 64 180 C 76 185 86 182 110 182 C 134 182 144 185 156 180 C 156 135 160 110 156 92 C 152 76 140 66 120 62 Z" />
                  {/* Arms Outer Silhouette */}
                  <path d="M 64 92 C 58 102 54 125 60 142 C 56 155 52 178 60 192 L 66 190 L 68 142 L 72 98 Z" />
                  <path d="M 156 92 C 162 102 166 125 160 142 C 164 155 168 178 160 192 L 154 190 L 152 142 L 148 98 Z" />
                  {/* Legs Outer Silhouette */}
                  <path d="M 84 180 C 76 210 74 250 84 280 C 78 310 78 340 86 368 L 98 368 C 104 330 102 290 102 278 C 108 240 108 200 108 182 Z" />
                  <path d="M 136 180 C 144 210 146 250 136 280 C 142 310 142 340 134 368 L 122 368 C 116 330 118 290 118 278 C 112 240 112 200 112 182 Z" />
                </g>

                {/* OVERLAY MUSCLE PATHS - FRONT */}
                
                {/* 1. Shoulders (Front Delts) */}
                {(() => {
                  const style = getMuscleHeatmapStyle('Shoulder');
                  return (
                    <g 
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => handleMuscleSelect('Shoulder')}
                      onMouseEnter={() => setHoveredMuscle(`Shoulders: ${style.label}`)}
                      onMouseLeave={() => setHoveredMuscle(null)}
                    >
                      <path d="M 98 58 C 82 62 68 72 64 88 C 62 96 66 106 72 108 C 78 106 82 92 88 76 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <path d="M 122 58 C 138 62 152 72 156 88 C 158 96 154 106 148 106 C 142 106 138 92 132 76 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                    </g>
                  );
                })()}

                {/* 2. Chest (Pectoralis Major) */}
                {(() => {
                  const style = getMuscleHeatmapStyle('Chest');
                  return (
                    <g 
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => handleMuscleSelect('Chest')}
                      onMouseEnter={() => setHoveredMuscle(`Chest: ${style.label}`)}
                      onMouseLeave={() => setHoveredMuscle(null)}
                    >
                      <path d="M 90 74 C 98 74 108 76 108 102 C 96 106 82 102 78 94 C 78 84 84 76 90 74 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <path d="M 130 74 C 122 74 112 76 112 102 C 124 106 138 102 142 94 C 142 84 136 76 130 74 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                    </g>
                  );
                })()}

                {/* 3. Biceps */}
                {(() => {
                  const style = getMuscleHeatmapStyle('Biceps');
                  return (
                    <g 
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => handleMuscleSelect('Biceps')}
                      onMouseEnter={() => setHoveredMuscle(`Biceps: ${style.label}`)}
                      onMouseLeave={() => setHoveredMuscle(null)}
                    >
                      <path d="M 68 90 C 62 98 60 118 66 132 C 74 132 76 112 74 98 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <path d="M 152 90 C 158 98 160 118 154 132 C 146 132 144 112 146 98 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                    </g>
                  );
                })()}

                {/* 4. Abs / Core */}
                {(() => {
                  const style = getMuscleHeatmapStyle('Abs');
                  return (
                    <g 
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => handleMuscleSelect('Abs')}
                      onMouseEnter={() => setHoveredMuscle(`Abs: ${style.label}`)}
                      onMouseLeave={() => setHoveredMuscle(null)}
                    >
                      <path d="M 92 104 L 128 104 C 128 104 125 158 122 165 C 118 172 102 172 98 165 C 95 158 92 104 92 104 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      {/* Ab Pack Grid Lines */}
                      <line x1="110" y1="104" x2="110" y2="168" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                      <line x1="94" y1="124" x2="126" y2="124" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                      <line x1="95" y1="144" x2="125" y2="144" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    </g>
                  );
                })()}

                {/* 5. Quadriceps */}
                {(() => {
                  const style = getMuscleHeatmapStyle('Quadriceps');
                  return (
                    <g 
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => handleMuscleSelect('Quadriceps')}
                      onMouseEnter={() => setHoveredMuscle(`Quadriceps: ${style.label}`)}
                      onMouseLeave={() => setHoveredMuscle(null)}
                    >
                      <path d="M 86 178 C 80 198 78 238 88 268 C 98 268 102 228 104 183 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <path d="M 134 178 C 140 198 142 238 132 268 C 122 268 118 228 116 183 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* BACK VIEW ANATOMICAL SVG */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--muted)] mb-3 flex items-center gap-1">
              Posterior View (Back)
            </span>
            <div className="relative w-52 h-96 bg-[var(--card2)]/50 rounded-3xl p-2 border border-[var(--border)] shadow-xl flex items-center justify-center">
              <svg viewBox="0 0 220 400" className="w-full h-full filter drop-shadow-md select-none">
                {/* Body Base Silhouette (Back View) */}
                <g fill="#18181b" stroke="#3f3f46" strokeWidth="1.5">
                  <circle cx="110" cy="32" r="18" />
                  <path d="M 102 48 L 118 48 L 120 62 L 100 62 Z" />
                  <path d="M 100 62 C 80 66 68 76 64 92 C 60 110 64 135 64 180 C 76 185 86 182 110 182 C 134 182 144 185 156 180 C 156 135 160 110 156 92 C 152 76 140 66 120 62 Z" />
                  <path d="M 64 92 C 58 102 54 125 60 142 C 56 155 52 178 60 192 L 66 190 L 68 142 L 72 98 Z" />
                  <path d="M 156 92 C 162 102 166 125 160 142 C 164 155 168 178 160 192 L 154 190 L 152 142 L 148 98 Z" />
                  <path d="M 84 180 C 76 210 74 250 84 280 C 78 310 78 340 86 368 L 98 368 C 104 330 102 290 102 278 C 108 240 108 200 108 182 Z" />
                  <path d="M 136 180 C 144 210 146 250 136 280 C 142 310 142 340 134 368 L 122 368 C 116 330 118 290 118 278 C 112 240 112 200 112 182 Z" />
                </g>

                {/* OVERLAY MUSCLE PATHS - BACK */}

                {/* 1. Back / Lats (Latissimus Dorsi & Traps) */}
                {(() => {
                  const style = getMuscleHeatmapStyle('Back');
                  return (
                    <g 
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => handleMuscleSelect('Back')}
                      onMouseEnter={() => setHoveredMuscle(`Back/Lats: ${style.label}`)}
                      onMouseLeave={() => setHoveredMuscle(null)}
                    >
                      <path d="M 102 48 L 118 48 L 130 72 L 110 88 L 90 72 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <path d="M 90 75 C 82 86 78 116 94 138 C 102 136 108 116 108 88 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <path d="M 130 75 C 138 86 142 116 126 138 C 118 136 112 116 112 88 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                    </g>
                  );
                })()}

                {/* 2. Triceps */}
                {(() => {
                  const style = getMuscleHeatmapStyle('Triceps');
                  return (
                    <g 
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => handleMuscleSelect('Triceps')}
                      onMouseEnter={() => setHoveredMuscle(`Triceps: ${style.label}`)}
                      onMouseLeave={() => setHoveredMuscle(null)}
                    >
                      <path d="M 68 90 C 62 98 60 118 66 132 C 74 132 76 112 74 98 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <path d="M 152 90 C 158 98 160 118 154 132 C 146 132 144 112 146 98 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                    </g>
                  );
                })()}

                {/* 3. Glutes */}
                {(() => {
                  const style = getMuscleHeatmapStyle('Glutes');
                  return (
                    <g 
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => handleMuscleSelect('Glutes')}
                      onMouseEnter={() => setHoveredMuscle(`Glutes: ${style.label}`)}
                      onMouseLeave={() => setHoveredMuscle(null)}
                    >
                      <path d="M 84 170 C 80 182 82 210 106 210 C 108 196 108 178 102 170 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <path d="M 136 170 C 140 182 138 210 114 210 C 112 196 112 178 118 170 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                    </g>
                  );
                })()}

                {/* 4. Hamstrings */}
                {(() => {
                  const style = getMuscleHeatmapStyle('Hamstrings');
                  return (
                    <g 
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => handleMuscleSelect('Hamstrings')}
                      onMouseEnter={() => setHoveredMuscle(`Hamstrings: ${style.label}`)}
                      onMouseLeave={() => setHoveredMuscle(null)}
                    >
                      <path d="M 85 214 C 80 230 80 260 90 275 C 100 275 104 245 104 216 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <path d="M 135 214 C 140 230 140 260 130 275 C 120 275 116 245 116 216 Z" fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>

        </div>

        {/* Hover Information Banner */}
        {hoveredMuscle && (
          <div className="mt-2 p-2.5 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-xl text-center text-xs font-bold text-[var(--accent)] animate-in fade-in duration-200">
            {hoveredMuscle}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--accent)] tracking-tight uppercase">Pick your muscle groups</h2>
          <p className="text-[var(--muted)] text-sm mt-1 uppercase font-bold tracking-widest text-[10px]">Select a group to see tailored exercises for your level.</p>
        </div>
        <div className="flex bg-[var(--sub)] rounded-full p-1 border border-[var(--border)] self-start">
          {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
            <button 
              key={l} 
              onClick={() => setLevel(l)} 
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer", 
                level === l ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]" : "text-[var(--muted)] hover:text-white"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {muscleGroups.map((muscle) => {
          const frequency = muscleData[muscle.id] || 0;
          return (
            <button
              key={muscle.id}
              onClick={() => handleMuscleSelect(muscle.id)}
              className={cn(
                "group relative flex flex-col items-center space-y-3 p-4 rounded-3xl transition-all duration-300 border cursor-pointer",
                selectedMuscle === muscle.id 
                  ? "bg-[var(--accent)]/10 border-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)] scale-[1.02]" 
                  : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]/50"
              )}
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[var(--border)] group-hover:border-[var(--accent)]/50 transition-all">
                <img 
                  src={muscle.image} 
                  alt={muscle.label} 
                  className={cn(
                    "w-full h-full object-cover transition-all duration-500",
                    selectedMuscle === muscle.id ? "scale-110 grayscale-0" : "grayscale group-hover:grayscale-0 group-hover:scale-105"
                  )}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {selectedMuscle === muscle.id && (
                  <div className="absolute inset-0 bg-[var(--accent)]/20 animate-pulse" />
                )}
              </div>
              
              <div className="text-center">
                <div className={cn(
                  "font-black uppercase tracking-widest text-sm transition-colors",
                  selectedMuscle === muscle.id ? "text-[var(--accent)]" : "text-white"
                )}>
                  {muscle.label}
                </div>
                <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5 flex items-center justify-center gap-1">
                  <span>{muscle.recovery}% Recovery</span>
                  <span className="text-[var(--accent)] font-mono">({frequency}x / 7d)</span>
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedMuscle === muscle.id && (
                <motion.div 
                  layoutId="active-muscle"
                  className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center text-white shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>

      {/* Exercise List for Selected Muscle */}
      <AnimatePresence mode="wait">
        {selectedMuscle && (
          <motion.div
            key={selectedMuscle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-xl"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-3xl font-black text-[var(--accent)] tracking-tighter uppercase">{selectedMuscle}</h3>
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mt-1">
                  {level} Level • {EXERCISE_LIB[selectedMuscle]?.[level]?.length || 0} Exercises Available
                </p>
              </div>
              <button 
                onClick={() => setSelectedMuscle(null)}
                className="p-2 rounded-full bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(EXERCISE_LIB[selectedMuscle]?.[level] || []).map((ex, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-5 rounded-2xl bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all group cursor-pointer" 
                  onClick={() => onStartWorkout(selectedMuscle, ex)}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                      🏋️
                    </div>
                    <div>
                      <div className="font-black text-base uppercase tracking-tight text-white group-hover:text-[var(--accent)] transition-colors">{ex.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-[var(--yellow)] font-black uppercase tracking-widest">{ex.sets} × {ex.reps}</span>
                        <span className="w-1 h-1 bg-[var(--muted)] rounded-full" />
                        <span className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest">{ex.rest} rest</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent-glow)] opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
