import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Plus, Trash2, Clock, Calendar, CheckSquare, PlayCircle, History } from 'lucide-react';
import { Workout, Exercise, Set } from '../types';

interface WorkoutTrackerProps {
  workouts: Workout[];
  onSaveWorkout: (workout: Omit<Workout, 'id' | 'userId'>) => Promise<void>;
  onDeleteWorkout: (id: string) => Promise<void>;
}

const EXERCISE_PRESETS = [
  "Bench Press",
  "Squats",
  "Deadlift",
  "Overhead Press",
  "Pull-ups",
  "Bicep Curls",
  "Tricep Pushdowns",
  "Incline Dumbbell Press",
  "Lateral Raises",
  "Leg Press",
  "Plank"
];

export default function WorkoutTracker({ workouts, onSaveWorkout, onDeleteWorkout }: WorkoutTrackerProps) {
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log');
  
  // Current logged workout state
  const [duration, setDuration] = useState<number>(45);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [intensity, setIntensity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [notes, setNotes] = useState<string>('');
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add a new exercise to current log
  const handleAddExercise = () => {
    const name = newExerciseName.trim() || selectedPreset;
    if (!name) return;

    // Check if exercise already added
    if (exercises.some(ex => ex.name.toLowerCase() === name.toLowerCase())) {
      alert("This exercise is already added to today's log.");
      return;
    }

    const newEx: Exercise = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: name,
      sets: [
        { id: '1', reps: 10, weight: 135 } // default starter set
      ]
    };

    setExercises([...exercises, newEx]);
    setNewExerciseName('');
    setSelectedPreset('');
  };

  // Add set to a specific exercise
  const handleAddSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: Set = {
        id: (ex.sets.length + 1).toString() + Math.random().toString(36).substr(2, 5),
        reps: lastSet ? lastSet.reps : 10,
        weight: lastSet ? lastSet.weight : 135
      };

      return {
        ...ex,
        sets: [...ex.sets, newSet]
      };
    }));
  };

  // Update set details
  const handleUpdateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      };
    }));
  };

  // Delete set from exercise
  const handleDeleteSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      // Keep at least 1 set
      if (ex.sets.length <= 1) return ex;
      return {
        ...ex,
        sets: ex.sets.filter(s => s.id !== setId)
      };
    }));
  };

  // Remove exercise completely
  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  // Save full workout
  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (exercises.length === 0) {
      alert("Add at least one exercise to log your workout!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveWorkout({
        date,
        duration,
        exercises,
        notes,
        intensity
      });
      
      // Clear form
      setExercises([]);
      setNotes('');
      setDuration(45);
      setDate(new Date().toISOString().split('T')[0]);
      setIntensity('Medium');
      setActiveTab('history');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Selector */}
      <div className="flex border-b border-white/5 pb-2 justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-amber-500" />
            Workout Core
          </h2>
          <p className="text-xs text-neutral-400">Log routine sets or review past strength stats.</p>
        </div>

        <div className="bg-neutral-900 p-1 rounded-xl flex border border-white/5">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'log' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            New Workout
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History ({workouts.length})
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'log' ? (
          <motion.form
            key="log-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleLogWorkout}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left: General Settings & Exercise Adder */}
            <div className="lg:col-span-1 space-y-5 bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md">
              <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider font-mono border-b border-white/5 pb-2">
                Workout Parameters
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 pl-9 pr-3 py-2 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">
                    Duration (Minutes)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/5 pl-9 pr-3 py-2 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">
                    Workout Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Low', 'Medium', 'High'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setIntensity(lvl)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                          intensity === lvl
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-black/20 text-neutral-400 border-white/5 hover:bg-neutral-800'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">
                    Session Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. focused on chest form, set PR on bench..."
                    className="w-full h-16 bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              {/* Add Exercise Segment */}
              <div className="border-t border-white/5 pt-4 mt-2 space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                  Add Exercise
                </h3>
                
                <div className="space-y-2">
                  <select
                    value={selectedPreset}
                    onChange={(e) => {
                      setSelectedPreset(e.target.value);
                      setNewExerciseName('');
                    }}
                    className="w-full bg-black border border-white/5 p-2 rounded-xl text-xs text-neutral-300 focus:outline-none"
                  >
                    <option value="">Select an exercise preset...</option>
                    {EXERCISE_PRESETS.map(preset => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExerciseName}
                      onChange={(e) => {
                        setNewExerciseName(e.target.value);
                        setSelectedPreset('');
                      }}
                      placeholder="Or enter custom exercise..."
                      className="flex-1 bg-black/40 border border-white/5 px-3 py-2 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddExercise}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white p-2.5 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Selected Exercises & Log Area */}
            <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
              <div className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex-1">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider font-mono border-b border-white/5 pb-2 mb-4">
                  Exercises Scheduled ({exercises.length})
                </h3>

                {exercises.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neutral-400">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-400">No Exercises Selected</p>
                      <p className="text-[10px] text-neutral-500 max-w-xs leading-relaxed">
                        Choose presets or key in custom muscle exercises from the left column to begin tracking sets.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {exercises.map((ex, exIdx) => (
                      <div key={ex.id} className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-3 relative group">
                        
                        {/* Header info */}
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-neutral-800 text-neutral-400 w-5 h-5 rounded-full flex items-center justify-center">
                              {exIdx + 1}
                            </span>
                            <span className="text-xs font-bold text-neutral-100">{ex.name}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(ex.id)}
                            className="text-neutral-500 hover:text-rose-500 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Sets List */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 text-[9px] font-bold font-mono text-neutral-500 uppercase px-1">
                            <span className="col-span-2 text-center">Set</span>
                            <span className="col-span-4 text-center">Weight (lbs)</span>
                            <span className="col-span-4 text-center">Reps</span>
                            <span className="col-span-2"></span>
                          </div>

                          {ex.sets.map((set, sIdx) => (
                            <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                              <span className="col-span-2 text-center font-mono text-xs text-neutral-400 font-bold">
                                {sIdx + 1}
                              </span>

                              <div className="col-span-4 flex items-center justify-center">
                                <input
                                  type="number"
                                  value={set.weight}
                                  onChange={(e) => handleUpdateSet(ex.id, set.id, 'weight', Number(e.target.value))}
                                  className="w-full max-w-[80px] bg-black text-center border border-white/10 rounded-lg py-1 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                                  min="0"
                                />
                              </div>

                              <div className="col-span-4 flex items-center justify-center">
                                <input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) => handleUpdateSet(ex.id, set.id, 'reps', Number(e.target.value))}
                                  className="w-full max-w-[80px] bg-black text-center border border-white/10 rounded-lg py-1 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                                  min="1"
                                />
                              </div>

                              <div className="col-span-2 flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSet(ex.id, set.id)}
                                  className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                                  disabled={ex.sets.length <= 1}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Set Button */}
                        <button
                          type="button"
                          onClick={() => handleAddSet(ex.id)}
                          className="w-full py-1.5 border border-dashed border-white/5 hover:border-white/20 bg-neutral-900/40 text-[10px] font-bold text-neutral-400 hover:text-neutral-200 transition-colors rounded-lg flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Set
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Logging Button */}
              {exercises.length > 0 && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs rounded-2xl hover:brightness-110 shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckSquare className="w-4 h-4" />
                  {isSubmitting ? "LOGGING WORKOUT..." : "LOG WORKOUT SESSION"}
                </button>
              )}
            </div>
          </motion.form>
        ) : (
          // HISTORY TAB
          <motion.div
            key="history-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {workouts.length === 0 ? (
              <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neutral-500">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-300">No Routine History Yet</h3>
                  <p className="text-[10px] text-neutral-500 mt-1 max-w-sm">
                    No sessions logged. Head to the 'New Workout' tab and enter weights to populate your cloud diary.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workouts.map((wk) => {
                  const totalVolume = wk.exercises.reduce((acc, curr) => {
                    return acc + curr.sets.reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0);
                  }, 0);

                  const totalSets = wk.exercises.reduce((acc, curr) => acc + curr.sets.length, 0);

                  return (
                    <div key={wk.id} className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl space-y-4 flex flex-col justify-between relative group">
                      
                      <div className="space-y-3">
                        {/* Header details */}
                        <div className="flex justify-between items-start border-b border-white/5 pb-2">
                          <div>
                            <span className="text-xs font-bold text-neutral-100">{wk.date}</span>
                            <p className="text-[10px] text-amber-500 font-mono mt-0.5 uppercase tracking-wider">
                              {wk.intensity} Intensity • {wk.duration} Mins
                            </p>
                          </div>

                          <button
                            onClick={() => onDeleteWorkout(wk.id)}
                            className="text-neutral-500 hover:text-rose-500 p-1.5 rounded-lg bg-black/20 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Exercises list summary */}
                        <div className="space-y-2">
                          {wk.exercises.map((ex) => (
                            <div key={ex.id} className="flex justify-between items-start text-xs border-b border-white/2 py-1">
                              <div className="space-y-0.5">
                                <span className="font-semibold text-neutral-200">{ex.name}</span>
                                <div className="text-[10px] text-neutral-400 font-mono flex gap-1">
                                  {ex.sets.map((s, idx) => (
                                    <span key={s.id}>
                                      {s.weight}x{s.reps}{idx < ex.sets.length - 1 ? ',' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <span className="text-[10px] font-bold font-mono text-neutral-500 uppercase bg-neutral-950 px-1.5 py-0.5 rounded">
                                {ex.sets.length} {ex.sets.length === 1 ? 'Set' : 'Sets'}
                              </span>
                            </div>
                          ))}
                        </div>

                        {wk.notes && (
                          <div className="bg-black/20 text-[10px] text-neutral-400 italic p-2.5 rounded-lg border border-white/2">
                            “{wk.notes}”
                          </div>
                        )}
                      </div>

                      {/* Workout aggregate tags */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                        <span>Sets lifted: <strong className="text-neutral-300">{totalSets}</strong></span>
                        <span>Total Volume: <strong className="text-amber-400">{totalVolume} lbs</strong></span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
