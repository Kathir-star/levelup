import { useState, useMemo } from 'react';
import { UserProfile, BodyMetricEntry } from '../types';
import { cn } from '../lib/utils';
import { Calculator, Scale, Ruler, Target, Info, User, Zap, TrendingDown, TrendingUp, Plus, History } from 'lucide-react';

interface BodyStatsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export default function BodyStats({ profile, onUpdate }: BodyStatsProps) {
  const userKey = profile.name || localStorage.getItem('username') || 'Athlete';
  const [height, setHeight] = useState(profile.height?.toString() || '175');
  const [weight, setWeight] = useState(profile.weight?.toString() || '70');
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight?.toString() || '68');
  const [age, setAge] = useState(profile.age?.toString() || '24');
  const [waistCm, setWaistCm] = useState(profile.waistCm?.toString() || '80');
  const [neckCm, setNeckCm] = useState(profile.neckCm?.toString() || '38');
  const [hipCm, setHipCm] = useState(profile.hipCm?.toString() || '95');
  const [gender, setGender] = useState<any>(profile.gender || 'male');
  const [goal, setGoal] = useState<any>(profile.goal || 'maintain');

  const [metricsHistory, setMetricsHistory] = useState<BodyMetricEntry[]>(() => {
    try {
      const raw = localStorage.getItem(`lv_body_metrics_${userKey}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const bmiData = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    const waist = Number(waistCm);
    const neck = Number(neckCm);
    const hip = Number(hipCm);
    if (!h || !w) return null;
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);
    const bmiNum = Number(bmi);

    // US Navy Body Fat Formula
    let bodyFat = 0;
    if (waist > 0 && neck > 0 && h > 0) {
      if (gender === 'male' && waist > neck) {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
      } else if (gender === 'female' && hip > 0 && waist + hip > neck) {
        bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(h)) - 450;
      }
    }
    const cleanBodyFat = bodyFat > 2 && bodyFat < 65 ? Number(bodyFat.toFixed(1)) : Number((1.20 * bmiNum + 0.23 * (Number(age) || 24) - (gender === 'male' ? 16.2 : 5.4)).toFixed(1));
    const leanMassKg = Number((w * (1 - Math.max(5, cleanBodyFat) / 100)).toFixed(1));
    
    let status = '';
    let color = '';
    let description = '';
    let intensity = '';
    let plan = '';
    
    if (bmiNum < 18.5) { 
      status = 'Underweight'; 
      color = 'text-[var(--yellow)]';
      description = 'Your BMI indicates you are underweight. Focus on nutrient-dense foods and progressive strength training.';
      intensity = 'Beginner / Intermediate';
      plan = 'Strength + Muscle Gain Focus';
    }
    else if (bmiNum < 25) { 
      status = 'Normal'; 
      color = 'text-[var(--green)]';
      description = 'You are in the healthy BMI range! Use this as a baseline for lean muscle recomposition.';
      intensity = 'Intermediate / Advanced';
      plan = 'Balanced Hypertrophy Split';
    }
    else if (bmiNum < 30) { 
      status = 'Overweight'; 
      color = 'text-[var(--yellow)]';
      description = 'Your BMI is in the overweight category. Aim for a high-protein 400 kcal deficit + daily steps.';
      intensity = 'Intermediate';
      plan = 'Fat Loss + Cardio + Full Body';
    }
    else { 
      status = 'Obese'; 
      color = 'text-[var(--red)]';
      description = 'Prioritizing heart health, joint-safe strength training, and steady fat loss is recommended.';
      intensity = 'Beginner / Guided';
      plan = 'Lower Impact + High Frequency Cardio';
    }
    
    return { bmi, bmiNum, bodyFat: cleanBodyFat, leanMassKg, status, color, description, intensity, plan };
  }, [height, weight, waistCm, neckCm, hipCm, gender, age]);

  const handleSave = () => {
    const updatedProfile: UserProfile = { 
      ...profile, 
      height: Number(height), 
      weight: Number(weight), 
      targetWeight: Number(targetWeight),
      age: Number(age),
      waistCm: Number(waistCm),
      neckCm: Number(neckCm),
      hipCm: Number(hipCm),
      bodyFat: bmiData?.bodyFat,
      gender,
      goal 
    };
    onUpdate(updatedProfile);

    if (bmiData) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const newEntry: BodyMetricEntry = {
        id: 'bm_' + Date.now(),
        date: todayStr,
        weight: Number(weight),
        height: Number(height),
        bmi: bmiData.bmiNum,
        bodyFat: bmiData.bodyFat,
        waistCm: Number(waistCm) || undefined,
        neckCm: Number(neckCm) || undefined,
        hipCm: Number(hipCm) || undefined
      };
      const filtered = metricsHistory.filter(m => m.date !== todayStr);
      const nextHistory = [...filtered, newEntry].sort((a, b) => b.date.localeCompare(a.date));
      setMetricsHistory(nextHistory);
      try {
        localStorage.setItem(`lv_body_metrics_${userKey}`, JSON.stringify(nextHistory));
      } catch {}
    }
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-2">
              <label className="tab-heading ml-1 block text-[var(--muted)] font-black">Age</label>
              <input 
                type="number" 
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-3.5 text-white focus:border-[var(--accent)] transition-all outline-none font-black text-lg text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="tab-heading ml-1 block text-[var(--muted)] font-black">Weight (kg)</label>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-3.5 text-white focus:border-[var(--accent)] transition-all outline-none font-black text-lg text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="tab-heading ml-1 block text-[var(--muted)] font-black">Target Wt (kg)</label>
              <input 
                type="number" 
                value={targetWeight} 
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="68"
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-3.5 text-white focus:border-[var(--accent)] transition-all outline-none font-black text-lg text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="tab-heading ml-1 block text-[var(--muted)] font-black">Height (cm)</label>
              <input 
                type="number" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-2xl p-3.5 text-white focus:border-[var(--accent)] transition-all outline-none font-black text-lg text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[var(--border)]">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] block">Waist (cm)</label>
              <input 
                type="number" 
                value={waistCm} 
                onChange={(e) => setWaistCm(e.target.value)}
                placeholder="80"
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-2.5 text-white focus:border-[var(--accent)] outline-none font-bold text-sm text-center"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] block">Neck (cm)</label>
              <input 
                type="number" 
                value={neckCm} 
                onChange={(e) => setNeckCm(e.target.value)}
                placeholder="38"
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-2.5 text-white focus:border-[var(--accent)] outline-none font-bold text-sm text-center"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] block">Hip (cm)</label>
              <input 
                type="number" 
                value={hipCm} 
                onChange={(e) => setHipCm(e.target.value)}
                placeholder="95"
                className="w-full bg-[var(--sub)] border border-[var(--border)] rounded-xl p-2.5 text-white focus:border-[var(--accent)] outline-none font-bold text-sm text-center"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-[var(--accent)] text-white font-black py-5 rounded-3xl shadow-xl shadow-[var(--accent-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Target size={18} />
            Log Body Metrics & Update Plan
          </button>

          {metricsHistory.length > 0 && (
            <div className="pt-4 border-t border-[var(--border)] space-y-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1.5">
                <History size={12} className="text-[var(--accent)]" /> Logged Body Progress History
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {metricsHistory.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="p-2.5 rounded-xl bg-[var(--sub)] border border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-[var(--muted)]">{entry.date}</span>
                    <span className="font-black text-white">{entry.weight} kg</span>
                    <span className="font-bold text-cyan-400">BMI {entry.bmi}</span>
                    {entry.bodyFat && <span className="font-bold text-amber-400">{entry.bodyFat}% BF</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative group perspective">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-transparent blur-3xl -z-10 group-hover:from-[var(--accent)]/20 transition-all duration-700" />
          
          <div className="glass-card p-8 h-full flex flex-col justify-center overflow-hidden border-t-4 border-t-[var(--accent)]">
            {bmiData ? (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">BMI Index</div>
                    <div className={cn("text-3xl sm:text-4xl font-black tracking-tight mt-1", bmiData.color)}>{bmiData.bmi}</div>
                    <div className="text-[9px] font-black uppercase mt-1 text-white/70">{bmiData.status}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Est. Body Fat</div>
                    <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-amber-400">{bmiData.bodyFat}%</div>
                    <div className="text-[9px] font-black uppercase mt-1 text-white/70">US Navy Method</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Lean Mass</div>
                    <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-cyan-400">{bmiData.leanMassKg}kg</div>
                    <div className="text-[9px] font-black uppercase mt-1 text-white/70">Fat-Free Mass</div>
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

                <div className="p-6 bg-[var(--sub)] border-l-4 border-[var(--accent)] rounded-2xl space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={14} className="text-[var(--accent)]" />
                      <span className="tab-heading text-[var(--muted)]">Coach Insight</span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed italic">"{bmiData.description}"</p>
                  </div>

                  {/* Safety Guidance Warnings */}
                  {bmiData.bmiNum < 18.5 && (
                    <div className="mt-3 p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-1">
                      <div className="text-[10px] font-black uppercase text-yellow-400 tracking-wider">⚠️ HEALTH ALERT: Underweight BMI</div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        To build mass safely, design a sustainable 300-500kcal daily surplus. Avoid immediate maximum work sets. Prioritize compound lifts with complete 2-minute rests to prevent strain.
                      </p>
                    </div>
                  )}

                  {bmiData.bmiNum >= 25 && (
                    <div className="mt-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1 animate-pulse">
                      <div className="text-[10px] font-black uppercase text-red-400 tracking-wider">⚠️ JOINT HEALTH WATCH: Elevated BMI</div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Joint loading is progressive. We recommend low-impact variations (e.g. standard squats over heavy jump squats) to guard cartilage while pursuing fat-loss.
                      </p>
                    </div>
                  )}
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
