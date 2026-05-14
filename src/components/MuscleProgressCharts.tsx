import { useMemo } from 'react';
import { WorkoutEntry } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Award, BarChart3 } from 'lucide-react';

interface MuscleProgressChartsProps {
  data: Record<string, WorkoutEntry[]>;
}

export default function MuscleProgressCharts({ data }: MuscleProgressChartsProps) {
  const allEntries = useMemo(() => Object.values(data).flat(), [data]);

  const muscleStats = useMemo(() => {
    const stats: Record<string, { sessions: number; maxWeight: number; totalVolume: number; history: { date: string; weight: number }[] }> = {};
    
    // Sort allEntries by date to get chronological history
    const sortedEntries = [...allEntries].sort((a, b) => a.date.localeCompare(b.date));

    sortedEntries.forEach(e => {
      if (!stats[e.muscle]) {
        stats[e.muscle] = { sessions: 0, maxWeight: 0, totalVolume: 0, history: [] };
      }
      stats[e.muscle].sessions += 1;
      stats[e.muscle].maxWeight = Math.max(stats[e.muscle].maxWeight, e.weight);
      stats[e.muscle].totalVolume += e.weight * (e.reps || 1) * (e.sets || 1);
      stats[e.muscle].history.push({ date: e.date, weight: e.weight });
    });

    return stats;
  }, [allEntries]);

  const muscles = ['Chest', 'Back', 'Legs', 'Biceps', 'Triceps', 'Shoulder', 'Abs'];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {muscles.map((m) => {
          const s = muscleStats[m];
          if (!s) return null;

          return (
            <div key={m} className="glass-card p-6 border-b-4 border-b-[var(--accent)] group hover:translate-y-[-4px] transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight">{m} Progress</h3>
                    <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest">{s.sessions} Sessions Total</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-white">{s.maxWeight}kg</div>
                  <div className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest">Max Hit</div>
                </div>
              </div>

              <div className="h-32 w-full mb-6 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={s.history}>
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="var(--accent)" 
                      strokeWidth={3} 
                      dot={false}
                      animationDuration={1500}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px' }}
                      labelStyle={{ display: 'none' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={12} className="text-[var(--muted)]" />
                  <div className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest">Volume: {Math.round(s.totalVolume / 100) / 10}k</div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Award size={12} className="text-[var(--yellow)]" />
                  <div className="text-[10px] text-[var(--yellow)] font-black uppercase tracking-widest">Elite Level</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)]">
             <BarChart3 size={24} />
           </div>
           <div>
             <h2 className="text-xl font-black uppercase tracking-tight">Strength Distribution</h2>
             <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest">Calculated across your focus areas</p>
           </div>
        </div>
        
        <div className="h-80 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={muscles.map(m => ({ name: m, weight: muscleStats[m]?.maxWeight || 0 }))}>
               <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
               <XAxis dataKey="name" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
               <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
               <Tooltip 
                 cursor={{ fill: 'var(--sub)' }}
                 contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
               />
               <Bar dataKey="weight" fill="var(--accent)" radius={[8, 8, 0, 0]} barSize={40} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
