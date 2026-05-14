import { useState } from 'react';
import { cn } from '../lib/utils';
import { 
  Dumbbell, 
  Zap, 
  Flame, 
  Timer as TimerIcon, 
  ChevronRight, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DayPlan, WeeklyPlan } from '../types';

const MALE_PLANS: Record<string, WeeklyPlan> = {
  beginner: {
    name: 'Fat Burn Starter — Male',
    tip: 'Focus on full range of motion. Rest 45–60s between sets. Do cardio finisher after each session.',
    days: [
      {
        day: 'Monday', focus: 'Upper Body Burn', color: '#e50914', exercises: [
          { name: 'Push-Ups', sets: '3', reps: '12–15', rest: '60s', notes: 'Keep core tight, full range' },
          { name: 'Wide Push-Ups', sets: '3', reps: '10–12', rest: '60s', notes: 'Wider grip hits chest more' },
          { name: 'Diamond Push-Ups', sets: '2', reps: '10', rest: '60s', notes: 'Targets triceps' },
          { name: 'Pike Push-Ups', sets: '3', reps: '10–12', rest: '60s', notes: 'Shoulder builder' },
        ]
      },
      {
        day: 'Tuesday', focus: 'Lower Body Burn', color: '#ffcc00', exercises: [
          { name: 'Bodyweight Squat', sets: '4', reps: '20', rest: '60s', notes: 'Sit back, chest up' },
          { name: 'Reverse Lunges', sets: '3', reps: '12/leg', rest: '60s', notes: 'Step back, knee to floor' },
          { name: 'Glute Bridges', sets: '3', reps: '20', rest: '60s', notes: 'Squeeze glutes at top' },
          { name: 'Calf Raises', sets: '3', reps: '25', rest: '45s', notes: 'Full stretch at bottom' },
        ]
      },
      { day: 'Wednesday', focus: 'Active Recovery', rest: true, tip: 'Light walk 20–30 min. Stretch all major muscles.' },
      {
        day: 'Thursday', focus: 'Core + Cardio', color: '#1e90ff', exercises: [
          { name: 'Crunches', sets: '3', reps: '20', rest: '45s', notes: 'Don\'t pull your neck' },
          { name: 'Leg Raises', sets: '3', reps: '15', rest: '45s', notes: 'Lower back flat on floor' },
          { name: 'Plank', sets: '3', reps: '45s', rest: '60s', notes: 'Breathe steadily' },
          { name: 'Burpees', sets: '3', reps: '10', rest: '60s', notes: 'Full body fat burner' },
        ]
      },
      {
        day: 'Friday', focus: 'Full Body Circuit', color: '#1db954', exercises: [
          { name: 'Push-Ups', sets: '3', reps: '15', rest: '45s' },
          { name: 'Squat Jumps', sets: '3', reps: '15', rest: '45s' },
          { name: 'Mountain Climbers', sets: '3', reps: '20/side', rest: '30s' },
          { name: 'Burpees', sets: '3', reps: '10', rest: '60s' },
        ]
      },
      { day: 'Saturday', focus: 'Stretch & Walk', rest: true, tip: '30 min brisk walk outdoors.' },
      { day: 'Sunday', focus: 'Full Rest', rest: true, tip: 'Complete rest. Eat clean. Hydrate well.' },
    ]
  }
};

const FEMALE_PLANS: Record<string, WeeklyPlan> = {
  beginner: {
    name: 'Slim & Tone Starter — Female',
    tip: 'Focus on form over speed. Rest 45–60s. Add 20 min walk after each session for extra fat burn.',
    days: [
      {
        day: 'Monday', focus: 'Lower Body Tone', color: '#ff69b4', exercises: [
          { name: 'Bodyweight Squat', sets: '3', reps: '20', rest: '60s', notes: 'Sit back, knees over toes' },
          { name: 'Glute Bridge', sets: '4', reps: '20', rest: '45s', notes: 'Squeeze glutes at top, hold 2s' },
          { name: 'Reverse Lunges', sets: '3', reps: '12/leg', rest: '60s', notes: 'Core tight, step back' },
          { name: 'Donkey Kicks', sets: '3', reps: '15/leg', rest: '30s', notes: 'Glute activation' },
        ]
      },
      {
        day: 'Tuesday', focus: 'Upper Body Tone', color: '#e50914', exercises: [
          { name: 'Knee Push-Ups', sets: '3', reps: '12–15', rest: '60s', notes: 'Build up to full push-ups' },
          { name: 'Shoulder Tap Plank', sets: '3', reps: '10/side', rest: '45s', notes: 'Core + shoulder' },
          { name: 'Tricep Dip (Chair)', sets: '3', reps: '12', rest: '60s', notes: 'Arms close to body' },
          { name: 'Plank Hold', sets: '3', reps: '30s', rest: '45s', notes: 'Don\'t let hips sag' },
        ]
      },
      { day: 'Wednesday', focus: 'Active Recovery', rest: true, tip: '20–30 min light walk. Hip flexor stretches.' },
      {
        day: 'Thursday', focus: 'Core + Cardio', color: '#ffcc00', exercises: [
          { name: 'Crunches', sets: '3', reps: '20', rest: '45s' },
          { name: 'Bicycle Crunches', sets: '3', reps: '15/side', rest: '45s', notes: 'Slow rotation' },
          { name: 'Jump Jacks', sets: '3', reps: '30', rest: '60s' },
          { name: 'March in Place', sets: '3', reps: '60s', rest: '30s' },
        ]
      },
      {
        day: 'Friday', focus: 'Full Body Tone Circuit', color: '#1db954', exercises: [
          { name: 'Squat', sets: '3', reps: '15', rest: '45s' },
          { name: 'Glute Bridge', sets: '3', reps: '20', rest: '45s' },
          { name: 'Knee Push-Up', sets: '3', reps: '12', rest: '45s' },
          { name: 'Mountain Climbers', sets: '3', reps: '20/side', rest: '30s' },
        ]
      },
      { day: 'Saturday', focus: 'Walk or Dance', rest: true, tip: '30 min brisk walk or dance cardio.' },
      { day: 'Sunday', focus: 'Full Rest', rest: true, tip: 'Rest. Eat clean. Hydrate well.' },
    ]
  }
};

interface StructuredPlansProps {
  gender: 'male' | 'female';
}

export default function StructuredPlans({ gender }: StructuredPlansProps) {
  const [level, setLevel] = useState('beginner');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const plans = gender === 'male' ? MALE_PLANS : FEMALE_PLANS;
  const currentPlan = plans[level] || plans['beginner'];
  const accentColor = gender === 'male' ? 'var(--red)' : '#ff69b4';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-black to-[var(--card2)] border border-[var(--border)] rounded-3xl p-8 flex flex-wrap items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="w-24 h-24 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[var(--accent-glow)] relative z-10">
          <Dumbbell size={48} />
        </div>
        <div className="flex-1 min-w-[280px] relative z-10">
          <h2 className="text-4xl font-display text-white tracking-tight mb-2 uppercase">
            {gender === 'male' ? 'Male' : 'Female'} Workout Plans
          </h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed max-w-lg scroll-m-2">
            Professional bodyweight training designed for your profile. 
            No equipment needed. Science-backed splits for maximum results.
          </p>
        </div>
      </div>

      <div className="flex bg-[var(--sub)] rounded-2xl p-1.5 border border-[var(--border)] max-w-md mx-auto">
        {(['beginner', 'intermediate', 'advanced']).map(l => (
          <button 
            key={l} 
            onClick={() => setLevel(l)} 
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
              level === l ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]" : "text-[var(--muted)] hover:text-white"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
          <div>
            <h3 className="text-2xl font-display text-white uppercase tracking-wider">{currentPlan.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Info size={14} className="text-[var(--accent)]" />
              <p className="text-xs text-[var(--muted)] italic">{currentPlan.tip}</p>
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            <span className="badge text-white px-3 py-1 bg-[var(--accent)]">{gender.toUpperCase()}</span>
            <span className="badge border border-[var(--border)] text-[var(--muted)] px-3 py-1 font-black">{level.toUpperCase()}</span>
          </div>
        </div>

        <div className="space-y-4">
          {currentPlan.days.map((day) => (
            <div 
              key={day.day}
              className="bg-[var(--sub)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--accent)]/50"
            >
              <div 
                className="p-4 sm:p-6 flex items-center justify-between cursor-pointer group"
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              >
                <div className="flex items-center gap-6">
                  <div className="text-sm font-black text-[var(--accent)] uppercase tracking-[0.2em] w-20">{day.day}</div>
                  <div className="flex flex-col">
                    <div className="text-lg font-display text-white uppercase tracking-wider group-hover:text-[var(--accent)] transition-colors">{day.focus}</div>
                    {!day.rest && <div className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest mt-1">{day.exercises?.length} EXERCISES</div>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {day.rest ? (
                    <span className="bg-white/5 text-[var(--muted)] text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full border border-white/5">REST DAY</span>
                  ) : (
                    <div className="hidden sm:flex items-center gap-2 text-[var(--yellow)]">
                      <Flame size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                    </div>
                  )}
                  {expandedDay === day.day ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              <AnimatePresence>
                {expandedDay === day.day && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-black/20"
                  >
                    <div className="p-4 sm:p-6 border-t border-[var(--border)]">
                      {day.rest ? (
                        <div className="bg-[var(--accent)]/5 border-l-4 border-[var(--accent)] p-4 rounded-r-xl">
                          <p className="text-sm text-[var(--muted)] italic">💡 {day.tip}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[var(--border)]">
                                <th className="py-3 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Exercise</th>
                                <th className="py-3 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-center">Sets</th>
                                <th className="py-3 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-center">Reps</th>
                                <th className="py-3 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-center">Rest</th>
                                <th className="py-3 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {day.exercises?.map((ex, i) => (
                                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                                  <td className="py-4 font-bold text-white text-sm">{ex.name}</td>
                                  <td className="py-4 font-black text-[var(--accent)] text-center text-sm">{ex.sets}</td>
                                  <td className="py-4 text-white text-center text-sm font-medium">{ex.reps}</td>
                                  <td className="py-4 text-[var(--muted)] text-center text-sm">{ex.rest}</td>
                                  <td className="py-4 text-[var(--muted)] text-xs italic">{ex.notes || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
