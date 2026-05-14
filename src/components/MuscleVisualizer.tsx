import { useState } from 'react';
import { MuscleGroup, Exercise } from '../types';
import { EXERCISE_LIB } from '../constants';
import { cn } from '../lib/utils';
import { Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MuscleVisualizerProps {
  onStartWorkout: (muscle: MuscleGroup, exercise: Exercise) => void;
}

export default function MuscleVisualizer({ onStartWorkout }: MuscleVisualizerProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

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
        setTimeout(() => setIsGenerating(false), 500);
      }
    }, 80);
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
                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", 
                level === l ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]" : "text-[var(--muted)] hover:text-white"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {muscleGroups.map((muscle) => (
          <button
            key={muscle.id}
            onClick={() => handleMuscleSelect(muscle.id)}
            className={cn(
              "group relative flex flex-col items-center space-y-3 p-4 rounded-3xl transition-all duration-300 border",
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
              <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5">
                {muscle.recovery}% Recovery
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
        ))}
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
                  {level} Level • {EXERCISE_LIB[selectedMuscle][level].length} Exercises Available
                </p>
              </div>
              <button 
                onClick={() => setSelectedMuscle(null)}
                className="p-2 rounded-full bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)] transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXERCISE_LIB[selectedMuscle][level].map((ex, i) => (
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
