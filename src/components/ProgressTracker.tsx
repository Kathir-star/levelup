import { useState } from 'react';
import { Scale, Plus, Trash2, TrendingUp, Activity } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { ProgressLog, UserProfile } from '../types';

interface ProgressTrackerProps {
  logs: ProgressLog[];
  userProfile: UserProfile | null;
  onSaveProgress: (weight: number, bmi: number, bodyFat: number) => Promise<void>;
  onDeleteProgress: (id: string) => Promise<void>;
  onUpdateProfile: (profileUpdates: Partial<UserProfile>) => Promise<void>;
}

export default function ProgressTracker({ logs, userProfile, onSaveProgress, onDeleteProgress, onUpdateProfile }: ProgressTrackerProps) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState(userProfile?.height || 175); // cm
  const [age, setAge] = useState(userProfile?.age || 25);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(userProfile?.gender || 'male');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Formulas
  // BMI = weight(kg) / (height(m)^2)
  // Let's assume input weight is in lbs or kg. Let's make a toggle or support kg. Let's default to kg for calculations, or we can use lbs.
  // Standard: weight in kg, height in cm.
  // If weight in kg: BMI = kg / (m^2)
  // Body fat percentage formula based on BMI:
  // Adult Body Fat % = (1.20 × BMI) + (0.23 × Age) − (10.8 × gender_val) − 5.4
  // where gender_val: male = 1, female = 0.

  const calculateMetrics = (wVal: number) => {
    const hInMeters = height / 100;
    const bmiVal = wVal / (hInMeters * hInMeters);
    
    let genderVal = 1;
    if (gender === 'female') genderVal = 0;
    else if (gender === 'other') genderVal = 0.5;

    const bfVal = (1.20 * bmiVal) + (0.23 * age) - (10.8 * genderVal) - 5.4;
    return {
      bmi: parseFloat(bmiVal.toFixed(1)),
      bodyFat: parseFloat(Math.max(2, Math.min(60, bfVal)).toFixed(1))
    };
  };

  const handleSaveProfileSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await onUpdateProfile({
        height,
        age,
        gender
      });
      alert("Height & age parameters updated successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const wVal = parseFloat(weight);
    if (isNaN(wVal) || wVal <= 0) return;

    setIsSubmitting(true);
    try {
      const { bmi, bodyFat } = calculateMetrics(wVal);
      await onSaveProgress(wVal, bmi, bodyFat);
      setWeight('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort logs for charts (ascending order of date)
  const sortedLogsForChart = [...logs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => ({
      ...log,
      dateFormatted: new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' })
    }));

  // Custom tooltips
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-950/95 border border-white/10 p-3 rounded-lg shadow-xl font-sans text-xs">
          <p className="font-semibold text-neutral-300 border-b border-white/5 pb-1 mb-1.5">{label}</p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-neutral-400">{p.name}:</span>
              <span className="font-mono text-white font-semibold">
                {p.value}{p.name.includes('Fat') ? '%' : p.name.includes('BMI') ? '' : ' kg'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-400" />
          Progress & Weight Hub
        </h2>
        <p className="text-xs text-neutral-400">Track structural changes, estimate BMI body fat ratios, and sync to the cloud.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Input specs / update params */}
        <div className="space-y-4">
          
          {/* Height and Age Specs Form */}
          <form onSubmit={handleSaveProfileSpecs} className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Body Parameters (For Formula)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/5 px-3 py-1.5 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                  min="50"
                  max="250"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/5 px-3 py-1.5 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                  min="1"
                  max="120"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {(['male', 'female', 'other'] as const).map((gen) => (
                  <button
                    key={gen}
                    type="button"
                    onClick={() => setGender(gen)}
                    className={`py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                      gender === gen
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-black/20 text-neutral-400 border-white/5 hover:bg-neutral-800'
                    }`}
                  >
                    {gen}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold tracking-wider uppercase rounded-lg transition-colors border border-white/5"
            >
              {isUpdatingProfile ? "UPDATING..." : "SAVE BODY FORMULA SPEC"}
            </button>
          </form>

          {/* Daily Weight Logger */}
          <form onSubmit={handleLogWeight} className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md space-y-3.5">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono border-b border-white/5 pb-2">
              Add Weight Entry
            </h3>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase">Current Weight (kg)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 78.5"
                  className="flex-1 bg-black/40 border border-white/5 px-3 py-2 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                  step="0.1"
                  min="10"
                  max="400"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Log
                </button>
              </div>
              <p className="text-[9px] text-neutral-500 italic mt-1 leading-relaxed">
                Using current parameters: {height}cm height, {age}yo {gender}. BMI & Body Fat estimate will auto-calculate.
              </p>
            </div>
          </form>
        </div>

        {/* Center: Live Chart Graphs */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-[340px]">
            <div>
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Weight & Body Metric Curves
              </h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">Continuous timeline of weight logs and estimated fat index ratios.</p>
            </div>

            <div className="h-56 mt-4">
              {sortedLogsForChart.length < 2 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 text-xs border border-dashed border-white/5 rounded-xl">
                  Log at least 2 separate weight readings to map trending charts.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sortedLogsForChart} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                    <XAxis 
                      dataKey="dateFormatted" 
                      stroke="#444" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#444" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    
                    <Area 
                      name="Weight" 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#weightGrad)" 
                    />
                    <Area 
                      name="Body Fat %" 
                      type="monotone" 
                      dataKey="bodyFat" 
                      stroke="#3b82f6" 
                      strokeWidth={1.5}
                      fillOpacity={1} 
                      fill="url(#bfGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Weight Log Entry Grid */}
      <div className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md space-y-3">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
          Historic Logs List
        </h3>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs border border-dashed border-white/5 rounded-xl">
            No weights registered. Key in a log above to populate your database.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[220px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="bg-black/30 border border-white/5 p-3.5 rounded-xl flex items-center justify-between group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-500 font-mono">{log.date}</span>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                      BMI: {log.bmi}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-sm font-extrabold text-neutral-200">{log.weight} kg</span>
                    <span className="text-[10px] text-neutral-400">({(log.weight * 2.20462).toFixed(1)} lbs)</span>
                  </div>
                  <p className="text-[10px] text-indigo-400 font-medium">Est. Body Fat: <strong className="font-mono">{log.bodyFat}%</strong></p>
                </div>

                <button
                  onClick={() => onDeleteProgress(log.id)}
                  className="text-neutral-500 hover:text-rose-500 p-1.5 rounded bg-black/20 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
