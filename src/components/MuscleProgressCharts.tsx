import { useMemo } from 'react';
import { WorkoutEntry } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { TrendingUp, Award, BarChart3, HelpCircle, Dumbbell, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface MuscleProgressChartsProps {
  data: Record<string, WorkoutEntry[]>;
  prs: Record<string, { weight: number, reps: number, date: string }>;
}

export default function MuscleProgressCharts({ data, prs }: MuscleProgressChartsProps) {
  const allEntries = useMemo(() => Object.values(data).flat(), [data]);

  const muscleStats = useMemo(() => {
    const stats: Record<string, { sessions: number; maxWeight: number; totalVolume: number; history: { date: string; weight: number }[] }> = {};
    
    // Sort allEntries by date to get chronological history
    const sortedEntries = [...allEntries].sort((a, b) => a.date.localeCompare(b.date));

    sortedEntries.forEach(e => {
      let m = e.muscle.trim();
      if (!m) return;
      
      // Capitalize first letter, lowercase the rest
      let normalized = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
      // Group Shoulder and Shoulders together
      if (normalized === 'Shoulder') {
        normalized = 'Shoulders';
      }

      if (!stats[normalized]) {
        stats[normalized] = { sessions: 0, maxWeight: 0, totalVolume: 0, history: [] };
      }
      stats[normalized].sessions += 1;
      stats[normalized].maxWeight = Math.max(stats[normalized].maxWeight, e.weight);
      stats[normalized].totalVolume += e.weight * (e.reps || 1) * (e.sets || 1);
      stats[normalized].history.push({ 
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        weight: e.weight 
      });
    });

    return stats;
  }, [allEntries]);

  // Mandatory 7 muscle groups
  const muscles = ['Chest', 'Back', 'Biceps', 'Triceps', 'Shoulders', 'Legs', 'Abs'];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]">
          <TrendingUp size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Muscle Growth Analytics</h2>
          <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest">Strength & volume metrics over time</p>
        </div>
      </div>

      {/* Dynamic Symmetry & Imbalance Protection Panel */}
      <div className="glass-card p-6 border-l-4 border-l-[var(--accent)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="tab-heading flex items-center gap-2">
            <Zap size={16} className="text-[var(--accent)]" />
            Symmetry & Imbalance Auditor
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Safety Check</span>
        </div>
        <div className="space-y-4">
          {(() => {
            const chestCount = muscleStats['Chest']?.sessions || 0;
            const backCount = muscleStats['Back']?.sessions || 0;
            const bicepsCount = muscleStats['Biceps']?.sessions || 0;
            const tricepsCount = muscleStats['Triceps']?.sessions || 0;
            const legsCount = muscleStats['Legs']?.sessions || 0;
            const shouldersCount = muscleStats['Shoulders']?.sessions || 0;
            const totalCount = chestCount + backCount + bicepsCount + tricepsCount + legsCount + shouldersCount;

            if (totalCount < 3) {
              return (
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white/70 leading-relaxed italic">
                  ℹ️ Symmetry calibration base: Log at least 3 distinct muscle sessions to activate the Real-time Symmetry Imbalance Detector and posture protector.
                </div>
              );
            }

            const imbalances: { title: string; desc: string; type: 'warning' | 'critical' }[] = [];

            // Chest vs Back
            if (chestCount > backCount + 2) {
              imbalances.push({
                title: "⚠️ Postural Imbalance Detected (Chest > Back)",
                desc: `Your Chest sessions (${chestCount}) significantly exceed Back sessions (${backCount}). This discrepancy can cause anterior humeral migration and rounded shoulder posture. Perform Lat Pulldowns and Chest-Supported Rows to establish balance.`,
                type: 'warning'
              });
            } else if (backCount > chestCount + 2) {
              imbalances.push({
                title: "⚠️ Push/Pull Imbalance Detected (Back > Chest)",
                desc: `Your Back sessions (${backCount}) exceed Chest sessions (${chestCount}). Integrate Bench Presses or Pushups to reach pushing harmony.`,
                type: 'warning'
              });
            }

            // Biceps vs Triceps
            if (bicepsCount > tricepsCount + 2) {
              imbalances.push({
                title: "⚠️ Arm Extensor Deficient (Biceps > Triceps)",
                desc: `Biceps logs (${bicepsCount}) exceed Triceps (${tricepsCount}). Triceps cover 65% of upper arm muscle space. Add skull crushers to balance force.`,
                type: 'warning'
              });
            } else if (tricepsCount > bicepsCount + 2) {
              imbalances.push({
                title: "⚠️ Arm Pulling Deficient (Triceps > Biceps)",
                desc: `Triceps logs (${tricepsCount}) exceed Biceps (${bicepsCount}). Integrate hammer curls to protect your elbows during heavy extensions.`,
                type: 'warning'
              });
            }

            // Skipping Leg Day
            const upperTotal = chestCount + backCount + shouldersCount;
            if (legsCount <= 1 && upperTotal >= 5) {
              imbalances.push({
                title: "🚨 CRITICAL: Skipping Leg Day Imbalance",
                desc: `You logged ${upperTotal} upper focus sessions but only ${legsCount} for legs. Leg drills (Squats, RDLs) stimulate natural growth hormone and testosterone secretion, boosting your overall upper progress. Don't skip legs!`,
                type: 'critical'
              });
            }

            if (imbalances.length === 0) {
              return (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-start gap-3">
                  <span className="text-green-400 text-lg">💡</span>
                  <div>
                    <div className="text-xs font-black uppercase text-green-400 tracking-wider">Perfect Symmetry Confirmed</div>
                    <p className="text-[11px] text-white/90 leading-relaxed mt-0.5">
                      Your push-pull and upper-lower body volumes are perfectly aligned back-to-back. Excellent programming split!
                    </p>
                  </div>
                </div>
              );
            }

            return imbalances.map((imb, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-4 rounded-2xl flex items-start gap-3 border",
                  imb.type === 'critical' ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20"
                )}
              >
                <span className="text-lg mt-0.5">{imb.type === 'critical' ? "🚨" : "⚠️"}</span>
                <div>
                  <div className={cn("text-xs font-black uppercase tracking-wider", imb.type === 'critical' ? "text-red-400" : "text-yellow-400")}>
                    {imb.title}
                  </div>
                  <p className="text-[11px] text-white/80 leading-relaxed mt-1">{imb.desc}</p>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {muscles.map((m) => {
          const s = muscleStats[m];
          const hasLogs = s && s.sessions > 0;
          
          // Calculate progress percentage comparing latest to first weight
          let pct = 0;
          let progressColor = 'text-[var(--muted)] bg-white/5';
          let progressLabel = 'Initial';
          
          if (hasLogs && s.history.length > 1) {
            const firstWeight = s.history[0].weight;
            const latestWeight = s.history[s.history.length - 1].weight;
            
            if (firstWeight > 0) {
              const diff = latestWeight - firstWeight;
              pct = Math.round((diff / firstWeight) * 100);
            }
            
            if (pct > 0) {
              progressColor = 'text-[var(--green)] bg-[var(--green)]/15 border border-[var(--green)]/20';
              progressLabel = `+${pct}% Progress`;
            } else if (pct < 0) {
              progressColor = 'text-[var(--red)] bg-[var(--red)]/15 border border-[var(--red)]/25';
              progressLabel = `${pct}% Drop`;
            } else {
              progressColor = 'text-[var(--yellow)] bg-[var(--yellow)]/10 border border-[var(--yellow)]/20';
              progressLabel = '0% Stable';
            }
          } else if (hasLogs) {
            progressColor = 'text-[var(--accent)] bg-[var(--accent)]/15 border border-[var(--accent)]/20';
            progressLabel = 'Baseline';
          }

          return (
            <div 
              key={m} 
              className={cn(
                "glass-card p-6 border-b-4 group flex flex-col justify-between transition-all duration-300",
                hasLogs ? "border-b-[var(--accent)] hover:translate-y-[-4px]" : "border-b-[var(--border)] opacity-60 hover:opacity-100"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                      hasLogs ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "bg-[var(--border)] text-[var(--muted)]"
                    )}>
                      <Dumbbell size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black uppercase tracking-tight">{m}</h3>
                      <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest">
                        {hasLogs ? `${s.sessions} Sessions Logged` : '0 Sessions Logged'}
                      </p>
                    </div>
                  </div>

                  {/* Progress percentage badge */}
                  <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", progressColor)}>
                    {progressLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 border-b border-[var(--border)] pb-3">
                  <div className="p-2.5 bg-[var(--sub)] rounded-xl border border-[var(--border)]">
                    <div className="text-[8px] text-[var(--muted)] font-black uppercase tracking-widest">MAX WEIGHT</div>
                    <div className="text-lg font-black text-white">{hasLogs ? `${s.maxWeight}kg` : '0kg'}</div>
                  </div>
                  <div className="p-2.5 bg-[var(--sub)] rounded-xl border border-[var(--border)]">
                    <div className="text-[8px] text-[var(--muted)] font-black uppercase tracking-widest">TOTAL VOLUME</div>
                    <div className="text-lg font-black text-white">
                      {hasLogs ? `${Math.round(s.totalVolume / 100) / 10}k` : '0kg'}
                    </div>
                  </div>
                </div>

                {/* Line graph container */}
                <div className="h-32 w-full relative mb-4 flex items-center justify-center">
                  {hasLogs ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={s.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="var(--accent)" 
                          strokeWidth={3} 
                          dot={{ r: 4, strokeWidth: 1 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                          animationDuration={1500}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--card2)', 
                            border: '1px solid var(--border)', 
                            borderRadius: '12px', 
                            fontSize: '11px',
                            fontWeight: 'bold',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                          }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 flex flex-col items-center justify-center select-none w-full border border-dashed border-[var(--border)] rounded-2xl bg-black/10">
                      <HelpCircle size={22} className="text-[var(--muted)] mb-2 animate-pulse" />
                      <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">No strength data yet</p>
                      <span className="text-[8px] text-[var(--muted)]/65 mt-1">Log sets in the Logs tab to plot charts</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer row inside the card */}
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-3.5 mt-auto">
                <div className="flex items-center gap-1.5">
                  <BarChart3 size={12} className="text-[var(--muted)]" />
                  <span className="text-[8px] text-[var(--muted)] font-black uppercase tracking-widest">Target Focus Chart</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award size={12} className={hasLogs ? "text-[var(--yellow)] animate-pulse" : "text-[var(--muted)]"} />
                  <span className={cn("text-[8px] font-black uppercase tracking-widest", hasLogs ? "text-[var(--yellow)]" : "text-[var(--muted)]")}>
                    {hasLogs ? 'Elite Level' : 'Locked'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Muscle Strength distribution split across muscles */}
      <div className="glass-card p-5 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)]">
             <BarChart3 size={24} />
           </div>
           <div>
             <h2 className="text-xl font-black uppercase tracking-tight">Strength Distribution</h2>
             <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest">Aggregated peak lifts across focuses</p>
           </div>
        </div>
        
        <div className="h-80 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={muscles.map(m => ({ name: m, weight: muscleStats[m]?.maxWeight || 0 }))} margin={{ left: -20 }}>
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
