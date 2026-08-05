import React, { useState } from 'react';
import { Award, Flame, CheckCircle, RefreshCw, Zap, ShieldAlert, Droplets, Footprints, Trophy, Candy } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  SYSTEM_CHALLENGES,
  UserChallenge,
  saveSugarLog,
  getTodaySugarLog
} from '../lib/challenges';

interface FitnessChallengesProps {
  userChallenges: UserChallenge[];
  today: string;
  onSugarLogChange: (sugarConsumed: boolean) => void;
  onRefresh?: () => void;
  className?: string;
}

export const FitnessChallenges: React.FC<FitnessChallengesProps> = ({
  userChallenges,
  today,
  onSugarLogChange,
  onRefresh,
  className
}) => {
  const [sugarStatus, setSugarStatus] = useState<boolean | null>(() => getTodaySugarLog(today));

  const handleSugarClick = (consumed: boolean) => {
    setSugarStatus(consumed);
    saveSugarLog(today, consumed);
    onSugarLogChange(consumed);
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'transformation':
        return <Flame className="text-orange-400" size={18} />;
      case 'sugar_cut':
        return <Candy className="text-red-400" size={18} />;
      case 'hydration':
        return <Droplets className="text-blue-400" size={18} />;
      case 'movement':
        return <Footprints className="text-emerald-400" size={18} />;
      case 'strength':
        return <Trophy className="text-yellow-400" size={18} />;
      default:
        return <Award className="text-[var(--accent)]" size={18} />;
    }
  };

  return (
    <div className={cn("glass-card p-5 border border-[var(--border)] rounded-2xl space-y-5 shadow-xl", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Award className="text-[var(--accent)]" size={20} />
            Active Fitness Challenges
          </h3>
          <p className="text-[11px] text-[var(--muted)] font-semibold leading-tight mt-0.5">
            Automated system-wide progress tracking synced with workouts, hydration, movement & discipline.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="self-start sm:self-auto text-[10px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={12} />
            Sync Progress
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SYSTEM_CHALLENGES.map((ch) => {
          const userCh = userChallenges.find((uc) => uc.challenge_id === ch.id);
          const progress = userCh ? userCh.progress : 0;
          const isCompleted = userCh ? userCh.is_completed : false;
          const pct = Math.min(100, Math.round((progress / ch.duration) * 100));
          const isUpdatedToday = userCh?.last_updated_date === today;

          return (
            <div
              key={ch.id}
              className={cn(
                "p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden",
                isCompleted
                  ? "bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
                      {getChallengeIcon(ch.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-tight text-white leading-snug">
                        {ch.name}
                      </h4>
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">
                        Duration: {ch.duration} {ch.type === 'strength' ? 'PRs' : 'Days'}
                      </span>
                    </div>
                  </div>

                  {isCompleted ? (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-1">
                      <CheckCircle size={10} /> Completed
                    </span>
                  ) : isUpdatedToday ? (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 px-2 py-0.5 rounded-lg shrink-0">
                      Active
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-white/5 text-[var(--muted)] px-2 py-0.5 rounded-lg shrink-0">
                      Pending
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-[var(--muted)] font-medium leading-relaxed">
                  {ch.description}
                </p>

                {/* Special Sugar Cut Daily Input Handler */}
                {ch.type === 'sugar_cut' && !isCompleted && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)] block">
                      Today's Sugar Log:
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSugarClick(false)}
                        className={cn(
                          "flex-1 py-1.5 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-1 cursor-pointer",
                          sugarStatus === false
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm"
                            : "bg-white/5 border-white/10 text-[var(--muted)] hover:text-white"
                        )}
                      >
                        <Zap size={10} /> Sugar Free
                      </button>
                      <button
                        onClick={() => handleSugarClick(true)}
                        className={cn(
                          "flex-1 py-1.5 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-1 cursor-pointer",
                          sugarStatus === true
                            ? "bg-red-500/20 border-red-500/40 text-red-300 shadow-sm"
                            : "bg-white/5 border-white/10 text-[var(--muted)] hover:text-white"
                        )}
                      >
                        <ShieldAlert size={10} /> Consumed (Reset)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar & Numbers */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-white/80">
                  <span className="uppercase tracking-wider">
                    Progress: {progress} / {ch.duration}
                  </span>
                  <span className={cn("font-black", isCompleted ? "text-emerald-400" : "text-[var(--accent)]")}>
                    {pct}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      isCompleted
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : "bg-gradient-to-r from-[var(--accent)] to-amber-400"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FitnessChallenges;
