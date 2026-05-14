import { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { Calculator, Scale, Ruler, Target, Info, User, Zap } from 'lucide-react';

interface BodyStatsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export default function BodyStats({ profile, onUpdate }: BodyStatsProps) {
  const [height, setHeight] = useState(profile.height?.toString() || '');
  const [weight, setWeight] = useState(profile.weight?.toString() || '');
  const [age, setAge] = useState(profile.age?.toString() || '');
  const [gender, setGender] = useState<any>(profile.gender || 'male');
  const [goal, setGoal] = useState<any>(profile.goal || 'maintain');

  const bmiData = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w) return null;
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);
    const bmiNum = Number(bmi);
    
    let status = '';
    let color = '';
    let description = '';
    let intensity = '';
    let plan = '';
    
    if (bmiNum < 18.5) { 
      status = 'Underweight'; 
      color = 'text-[var(--yellow)]';
      description = 'Your BMI indicates you are underweight. Focus on nutrient-dense foods and strength training.';
      intensity = 'Beginner / Intermediate';
      plan = 'Strength + Muscle Gain Focus';
    }
    else if (bmiNum < 25) { 
      status = 'Normal'; 
      color = 'text-[var(--green)]';
      description = 'You are in the healthy BMI range! Use this as a baseline for body recomposition.';
      intensity = 'Intermediate / Advanced';
      plan = 'Balanced Hypertrophy Split';
    }
    else if (bmiNum < 30) { 
      status = 'Overweight'; 
      color = 'text-[var(--yellow)]';
      description = 'Your BMI is in the overweight category. Aim for a manageable calorie deficit.';
      intensity = 'Intermediate';
      plan = 'Fat Loss + Cardio + Full Body';
    }
    else { 
      status = 'Obese'; 
      color = 'text-[var(--red)]';
      description = 'Prioritizing heart health and steady fat loss is recommended. Consult a professional.';
      intensity = 'Beginner / Guided';
      plan = 'Lower Impact + High Frequency Cardio';
    }
    
    return { bmi, bmiNum, status, color, description, intensity, plan };
  }, [height, weight]);

  const handleSave = () => {
    onUpdate({ 
      ...profile, 
      height: Number(height), 
      weight: Number(weight), 
      age: Number(age),
      gender,
      goal 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]">
          <Scale size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Body Analytics</h2>
          <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest">Personalize your journey</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <label className="tab-heading ml-1 block text-[var(--muted)] font-black">Gender Identity</label>
               <div className="grid grid-cols-2 gap-3">
                  {(['male', 'female'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={cn(
                        "py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        gender === g 
                        ? (g === 'male' ? "bg-[var(--blue)] border-[var(--blue)] text-white shadow-xl shadow-blue-500/20" : "bg-[var(--pink)] border-[var(--pink)] text-white shadow-xl shadow-pink-500/20")
                        : "bg-[var(--sub)] border-[var(--border)] text-[var(--muted)]"
                      )}
                    >
                      {g}
                    </button>
                  ))}
               </div>
            </div>
            <div className="space-y-2">
               <label className="tab-heading ml-1 block text-[var(--muted)] font-black">Primary Goal</label>
               <select 
                 value={goal}
                 onChange={(e) => setGoal(e.target.value)}
                 className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--accent)] transition-all outline-none font-bold"
               >
                 <option value="loss">Fat Loss</option>
                 <option value="maintain">Maintain</option>
                 <option value="gain">Muscle Gain</option>
               </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="tab-heading ml-1 block text-[var(--muted)] font-black">Age</label>
              <input 
                type="number" 
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--accent)] transition-all outline-none font-black text-xl text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="tab-heading ml-1 block text-[var(--muted)] font-black">Weight (kg)</label>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--accent)] transition-all outline-none font-black text-xl text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="tab-heading ml-1 block text-[var(--muted)] font-black">Height (cm)</label>
              <input 
                type="number" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-4 text-white focus:border-[var(--accent)] transition-all outline-none font-black text-xl text-center"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-[var(--accent)] text-white font-black py-5 rounded-3xl shadow-xl shadow-[var(--accent-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2"
          >
            <Target size={18} />
            Save & Update Plan
          </button>
        </div>

        <div className="relative group perspective">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-transparent blur-3xl -z-10 group-hover:from-[var(--accent)]/20 transition-all duration-700" />
          
          <div className="glass-card p-8 h-full flex flex-col justify-center overflow-hidden border-t-4 border-t-[var(--accent)]">
            {bmiData ? (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center space-y-4">
                  <div className="tab-heading text-[var(--muted)]">Calculated BMI Index</div>
                  <div className={cn("text-8xl font-black tracking-tighter drop-shadow-[0_0_15px_var(--accent-glow)] transition-all", bmiData.color)}>{bmiData.bmi}</div>
                  <div className={cn(
                    "inline-block px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mt-4 shadow-lg animate-pulse",
                    bmiData.status === 'Normal' ? "bg-[var(--green)]/20 text-[var(--green)]" : "bg-[var(--yellow)]/20 text-[var(--yellow)]"
                  )}>
                    {bmiData.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-[var(--card2)] rounded-3xl border border-[var(--border)] group/card hover:border-[var(--accent)] transition-all overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover/card:scale-110 transition-transform">
                      <Zap size={80} />
                    </div>
                    <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Recommended Intensity</div>
                    <div className="text-lg font-black">{bmiData.intensity}</div>
                  </div>
                  <div className="p-5 bg-[var(--card2)] rounded-3xl border border-[var(--border)] group/card hover:border-[var(--accent)] transition-all overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover/card:scale-110 transition-transform">
                      <Calculator size={80} />
                    </div>
                    <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">AI Logic Plan</div>
                    <div className="text-sm font-black uppercase">{bmiData.plan}</div>
                  </div>
                </div>

                <div className="p-6 bg-[var(--sub)] border-l-4 border-[var(--accent)] rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-[var(--accent)]" />
                    <span className="tab-heading text-[var(--muted)]">Coach Insight</span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed italic">"{bmiData.description}"</p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-10 scale-up opacity-50">
                <div className="w-24 h-24 glass rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner border-[var(--border)]">⚖️</div>
                <div>
                  <p className="text-white font-black text-xl uppercase tracking-tighter">Awaiting Input</p>
                  <p className="text-[var(--muted)] text-sm mt-1 max-w-[200px] mx-auto">Complete your profile to unlock AI-powered workout suggestions.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
