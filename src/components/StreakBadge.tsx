import React, { useEffect, useState } from 'react';
import { Flame, Trophy, Award } from 'lucide-react';
import { cn } from '../lib/utils';

export interface StreakBadgeProps {
  streak: number;
  isPR?: boolean;
  hasTrainedToday?: boolean;
  className?: string;
  onMilestoneReached?: (streak: number) => void;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  isPR = false,
  hasTrainedToday = false,
  className,
  onMilestoneReached
}) => {
  const isMilestone = streak === 7 || streak === 30 || streak === 100;
  const shouldAnimate = isMilestone || isPR;
  const [animating, setAnimating] = useState(shouldAnimate);

  useEffect(() => {
    if (shouldAnimate) {
      setAnimating(true);
      if (isMilestone && onMilestoneReached) {
        onMilestoneReached(streak);
      }
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 3500); // Temporary trigger for 3.5 seconds
      return () => clearTimeout(timer);
    }
  }, [streak, isPR, isMilestone]);

  if (streak <= 0) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-lg transition-all duration-300 select-none",
        hasTrainedToday
          ? "bg-[var(--red)]/10 border-[var(--red)]/30 text-white"
          : "bg-[var(--yellow)]/10 border-[var(--yellow)]/30 text-[var(--yellow)]",
        animating && "animate-subtle-pulse border-[var(--accent)] ring-2 ring-[var(--accent)]/40 shadow-[0_0_15px_var(--accent-glow)] scale-[1.02]",
        className
      )}
    >
      {isPR ? (
        <Trophy size={14} className="text-amber-400 shrink-0" />
      ) : isMilestone ? (
        <Award size={14} className="text-[var(--accent)] shrink-0" />
      ) : (
        <Flame
          size={14}
          className={cn(
            "shrink-0",
            hasTrainedToday ? "text-[var(--red)]" : "text-[var(--yellow)]",
            streak >= 4 && "animate-pulse"
          )}
        />
      )}
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">
          {streak} Day Streak {isPR ? '🏆 PR!' : isMilestone ? '🌟 Milestone!' : ''}
        </span>
        {!hasTrainedToday && (
          <span className="text-[8px] font-bold text-[var(--yellow)] uppercase tracking-wider mt-0.5">
            ⚠️ At Risk!
          </span>
        )}
      </div>
    </div>
  );
};

export default StreakBadge;
