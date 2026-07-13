import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Plus, Trash2, Shield, Calendar, Star, Zap, Dumbbell } from 'lucide-react';
import { PersonalRecord, Workout } from '../types';

interface PRTrackerProps {
  prs: PersonalRecord[];
  workouts: Workout[];
  streakCount: number;
  onSavePR: (exercise: string, weight: number, reps: number) => Promise<void>;
  onDeletePR: (id: string) => Promise<void>;
}

const BADGES_INFO = [
  {
    id: 'first-workout',
    title: "First Workout",
    description: "Logged your first official LevelUp routine! Strength is forged.",
    icon: "Dumbbell",
    color: "from-amber-400 to-orange-500 shadow-amber-500/20",
    category: 'workout' as const
  },
  {
    id: 'streak-7',
    title: "7-Day Streak",
    description: "Maintained a solid 7-day consistency streak. Absolute discipline!",
    icon: "Zap",
    color: "from-indigo-500 to-purple-600 shadow-indigo-500/20",
    category: 'streak' as const
  },
  {
    id: 'first-pr',
    title: "New PR Smashed",
    description: "Smashed a personal weight record! Pushing human limits.",
    icon: "Trophy",
    color: "from-rose-500 to-red-600 shadow-rose-500/20",
    category: 'pr' as const
  },
  {
    id: 'volume-beast',
    title: "Volume Beast",
    description: "Completed a workout session of over 100 total logged reps.",
    icon: "Star",
    color: "from-emerald-400 to-teal-500 shadow-emerald-500/20",
    category: 'workout' as const
  }
];

export default function PRTracker({ prs, workouts, streakCount, onSavePR, onDeletePR }: PRTrackerProps) {
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive badge states dynamically based on real statistics!
  const hasFirstWorkout = workouts.length >= 1;
  const hasStreak7 = streakCount >= 7;
  const hasFirstPR = prs.length >= 1;
  
  // Volume Beast check: Check if any workout has >= 10 total sets or sum of sets reps >= 60 reps
  const isVolumeBeast = workouts.some(wk => {
    const repsCount = wk.exercises.reduce((acc, curr) => {
      return acc + curr.sets.reduce((sAcc, s) => sAcc + s.reps, 0);
    }, 0);
    return repsCount >= 50;
  });

  const getBadgeUnlocked = (id: string) => {
    switch (id) {
      case 'first-workout': return hasFirstWorkout;
      case 'streak-7': return hasStreak7;
      case 'first-pr': return hasFirstPR;
      case 'volume-beast': return isVolumeBeast;
      default: return false;
    }
  };

  const handleLogPR = async (e: React.FormEvent) => {
    e.preventDefault();
    const wVal = parseFloat(weight);
    const rVal = parseInt(reps);
    if (!exercise.trim() || isNaN(wVal) || isNaN(rVal) || wVal <= 0 || rVal <= 0) return;

    setIsSubmitting(true);
    try {
      await onSavePR(exercise.trim(), wVal, rVal);
      setExercise('');
      setWeight('');
      setReps('5');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Dumbbell": return <Dumbbell className="w-5 h-5" />;
      case "Zap": return <Zap className="w-5 h-5" />;
      case "Trophy": return <Trophy className="w-5 h-5" />;
      case "Star": return <Star className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          PRs & Achievements Core
        </h2>
        <p className="text-xs text-neutral-400">Lock in your maximum strength, and unlock real-time badges as you scale up your limits.</p>
      </div>

      {/* Grid of Badges achievements */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-400 animate-pulse" />
          Unlocked Badges ({[hasFirstWorkout, hasStreak7, hasFirstPR, isVolumeBeast].filter(Boolean).length} / {BADGES_INFO.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES_INFO.map((badge) => {
            const unlocked = getBadgeUnlocked(badge.id);

            return (
              <div 
                key={badge.id}
                className={`bg-neutral-900/60 border rounded-2xl p-4 flex gap-4 items-center transition-all relative overflow-hidden ${
                  unlocked 
                    ? 'border-neutral-800 shadow-lg' 
                    : 'border-white/2 opacity-40 grayscale'
                }`}
              >
                {/* Visual badge glow if unlocked */}
                {unlocked && (
                  <div className={`absolute -right-10 -bottom-10 w-24 h-24 bg-gradient-to-br ${badge.color} rounded-full blur-2xl opacity-20`} />
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${
                  unlocked ? badge.color : 'from-neutral-800 to-neutral-900'
                } shadow-md shrink-0`}>
                  {renderBadgeIcon(badge.icon)}
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">{badge.title}</span>
                  <p className="text-[10px] text-neutral-400 leading-relaxed">{badge.description}</p>
                  <span className={`text-[9px] font-mono font-bold block mt-1 ${
                    unlocked ? 'text-amber-500' : 'text-neutral-500'
                  }`}>
                    {unlocked ? "● EARNED" : "○ LOCKED"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Left Form: Add PR */}
        <div className="lg:col-span-1 bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex flex-col space-y-4">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono border-b border-white/5 pb-2">
            Record New PR
          </h3>

          <form onSubmit={handleLogPR} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">
                Exercise Name
              </label>
              <input
                type="text"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                placeholder="e.g. Bench Press"
                className="w-full bg-black/40 border border-white/5 px-3 py-2 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="225"
                  className="w-full bg-black/40 border border-white/5 px-3 py-2 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">
                  Reps Lifted
                </label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="5"
                  className="w-full bg-black/40 border border-white/5 px-3 py-2 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  min="1"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              LOCK IN PR RECORD
            </button>
          </form>
        </div>

        {/* Right list: Active PRs */}
        <div className="lg:col-span-2 bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex flex-col space-y-4">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono border-b border-white/5 pb-2">
            Personal Best Table ({prs.length})
          </h3>

          <div className="flex-1 overflow-y-auto max-h-[250px] space-y-2 pr-1">
            {prs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-500 text-xs border border-dashed border-white/5 rounded-xl h-full">
                <Trophy className="w-8 h-8 text-neutral-600 animate-pulse mb-2" />
                No PRs logged in this cycle yet. Squeeze an extra rep today!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatePresence initial={false}>
                  {prs.map((pr) => (
                    <motion.div
                      key={pr.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-black/30 border border-white/5 p-3.5 rounded-xl flex items-center justify-between group relative overflow-hidden"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-600" />
                          {pr.date}
                        </span>
                        <h4 className="text-xs font-extrabold text-neutral-100">{pr.exercise}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-amber-400 font-mono">{pr.weight} lbs</span>
                          <span className="text-[10px] text-neutral-400">for {pr.reps} reps</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeletePR(pr.id)}
                        className="text-neutral-500 hover:text-rose-500 p-1.5 rounded bg-black/20 opacity-0 group-hover:opacity-100 transition-all z-10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
