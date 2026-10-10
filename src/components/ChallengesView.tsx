import React, { useState } from 'react';
import { 
  Trophy, Flame, Shield, Zap, Target, CheckCircle2, 
  Sparkles, Lock, ArrowRight, Star, RefreshCw, Calendar, Clock,
  Award, TrendingUp, Check, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import canvasConfetti from 'canvas-confetti';
import { 
  WINTER_ARC_PATHS, CHALLENGE_LIBRARY, getAchievementsList,
  calculateWinterArcProgress, WinterArcState, Challenge, WinterArcPath, XP_CONFIG
} from '../utils/gamification';
import { UserProfile, WorkoutEntry } from '../types';
import { cn } from '../lib/utils';

interface ChallengesViewProps {
  profile: UserProfile;
  workoutData: Record<string, WorkoutEntry[]>;
  prs: any[];
  userXp: number;
  userLevel: number;
  streak: number;
  onAddXp: (xp: number) => void;
  triggerToast: (msg: string, type?: string) => void;
  onSelectTab?: (tab: string) => void;
}

export default function ChallengesView({
  profile,
  workoutData,
  prs,
  userXp,
  userLevel,
  streak,
  onAddXp,
  triggerToast,
  onSelectTab
}: ChallengesViewProps) {
  const todayStr = new Date().toLocaleDateString('en-CA');

  // Winter Arc State in localStorage
  const [arcState, setArcState] = useState<WinterArcState>(() => {
    const saved = localStorage.getItem('lvl_winter_arc');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      isActive: false,
      startDate: todayStr,
      targetEndDate: '2027-01-31',
      selectedPathId: 'STRENGTH',
      completedDays: [],
      activeChallengeIds: ['ch_30_consistency', 'ch_strength_builder'],
      completedChallengeIds: [],
      totalXpEarned: 0
    };
  });

  const [selectedPathPreview, setSelectedPathPreview] = useState<string>(arcState.selectedPathId || 'STRENGTH');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'Strength' | 'Consistency' | 'Endurance' | 'Recovery'>('ALL');
  const [activeTabSub, setActiveTabSub] = useState<'ARC' | 'CHALLENGES' | 'ACHIEVEMENTS' | 'TIERS'>('ARC');

  const arcProgress = calculateWinterArcProgress(arcState);
  const totalWorkoutsLogged = Object.values(workoutData).reduce((acc, curr) => acc + curr.length, 0);

  const saveArcState = (updated: WinterArcState) => {
    setArcState(updated);
    localStorage.setItem('lvl_winter_arc', JSON.stringify(updated));
  };

  // Start Winter Arc
  const handleStartWinterArc = (pathId: string) => {
    const updated: WinterArcState = {
      ...arcState,
      isActive: true,
      startDate: todayStr,
      selectedPathId: pathId,
      completedDays: [todayStr],
      activeChallengeIds: arcState.activeChallengeIds.length > 0 ? arcState.activeChallengeIds : ['ch_30_consistency', 'ch_strength_builder']
    };
    saveArcState(updated);
    onAddXp(XP_CONFIG.WINTER_ARC_STARTED);
    triggerToast("❄️ WINTER ARC ACTIVATED! +200 XP Earned. Transformation locked in!", "success");

    try {
      canvasConfetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  // Switch Transformation Path
  const handleSelectPath = (pathId: string) => {
    setSelectedPathPreview(pathId);
    if (arcState.isActive) {
      const updated = { ...arcState, selectedPathId: pathId };
      saveArcState(updated);
      triggerToast(`Transformation path updated to ${pathId}`, "info");
    }
  };

  // Start or Complete Challenge
  const handleToggleChallenge = (challenge: Challenge) => {
    const isActive = (arcState.activeChallengeIds || []).includes(challenge.id);
    const isCompleted = (arcState.completedChallengeIds || []).includes(challenge.id);

    if (isCompleted) {
      triggerToast("This challenge is already completed! Amazing work.", "info");
      return;
    }

    if (!isActive) {
      // Activate
      const updated: WinterArcState = {
        ...arcState,
        activeChallengeIds: [...(arcState.activeChallengeIds || []), challenge.id]
      };
      saveArcState(updated);
      onAddXp(50);
      triggerToast(`⚔️ Challenge accepted: ${challenge.title}! +50 XP`, "success");
    } else {
      // Complete Challenge manually or via progress
      const updated: WinterArcState = {
        ...arcState,
        activeChallengeIds: (arcState.activeChallengeIds || []).filter(id => id !== challenge.id),
        completedChallengeIds: [...(arcState.completedChallengeIds || []), challenge.id],
        totalXpEarned: (arcState.totalXpEarned || 0) + challenge.xpReward
      };
      saveArcState(updated);
      onAddXp(challenge.xpReward);
      triggerToast(`🏆 CHALLENGE MASTERED: ${challenge.title}! +${challenge.xpReward} XP`, "success");

      try {
        canvasConfetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 }
        });
      } catch (e) {}
    }
  };

  // Achievements
  const achievements = getAchievementsList({
    totalWorkouts: totalWorkoutsLogged,
    streak: streak,
    totalPrs: (prs || []).length,
    winterArcActive: arcState.isActive,
    winterArcDays: (arcState.completedDays || []).length,
    level: userLevel
  });

  // Calculate dynamic progress for challenges
  const getChallengeProgress = (ch: Challenge) => {
    if (ch.id === 'ch_30_consistency') {
      const count = Math.min(ch.targetCount, Math.max(streak, (arcState.completedDays || []).length));
      return { current: count, target: ch.targetCount, percent: Math.round((count / ch.targetCount) * 100) };
    }
    if (ch.id === 'ch_strength_builder') {
      const count = Math.min(ch.targetCount, totalWorkoutsLogged);
      return { current: count, target: ch.targetCount, percent: Math.round((count / ch.targetCount) * 100) };
    }
    if (ch.id === 'ch_pr_hunt') {
      const count = Math.min(ch.targetCount, (prs || []).length);
      return { current: count, target: ch.targetCount, percent: Math.round((count / ch.targetCount) * 100) };
    }
    if (ch.id === 'ch_no_zero_days') {
      const count = Math.min(ch.targetCount, streak);
      return { current: count, target: ch.targetCount, percent: Math.round((count / ch.targetCount) * 100) };
    }
    // Default estimate based on completed days
    const count = Math.min(ch.targetCount, (arcState.completedDays || []).length);
    return { current: count, target: ch.targetCount, percent: Math.round((count / ch.targetCount) * 100) };
  };

  const filteredChallenges = CHALLENGE_LIBRARY.filter(ch => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ACTIVE') return (arcState.activeChallengeIds || []).includes(ch.id);
    return ch.category === activeFilter;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Winter Arc Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#120808] via-[#1a0f0f] to-[#0a0a0e] border border-red-900/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 top-8 opacity-10 text-8xl select-none font-black hidden sm:block">❄️</div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest">
              <Flame size={12} className="animate-pulse text-red-500" />
              SPECIAL WINTER EVENT • ENDS JANUARY 31
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white italic">
              THE WINTER ARC
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed">
              When the world slows down, we level up. Cold discipline, daily consistency, and ruthless physical transformation. Start anytime and stay locked in through January 31.
            </p>

            {arcState.isActive ? (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="px-4 py-2 rounded-2xl bg-black/50 border border-red-500/30">
                  <div className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Current Arc Day</div>
                  <div className="text-2xl font-black text-red-400 tracking-tight italic">Day {arcProgress.currentDay}</div>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-black/50 border border-white/10">
                  <div className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Days to Jan 31</div>
                  <div className="text-2xl font-black text-white tracking-tight italic">{arcProgress.daysRemaining} Days</div>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-black/50 border border-white/10">
                  <div className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Consistency</div>
                  <div className="text-2xl font-black text-amber-400 tracking-tight italic">{arcProgress.consistencyPercent}%</div>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-black/50 border border-emerald-500/20">
                  <div className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Current Path</div>
                  <div className="text-sm font-black text-emerald-400 tracking-wider flex items-center gap-1.5 mt-1">
                    <span>{arcProgress.path.icon}</span>
                    <span>{arcProgress.path.title}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => handleStartWinterArc(selectedPathPreview)}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-red-900/30 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
                >
                  <Flame size={18} />
                  <span>START YOUR WINTER ARC (+200 XP)</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Arc Progress Ring / Status */}
          <div className="shrink-0 w-full md:w-auto flex flex-col items-center justify-center p-6 rounded-2xl bg-black/60 border border-white/10">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="#ef4444"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * (arcProgress.progressPercent / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-white italic">{arcProgress.progressPercent}%</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">ARC TIMELINE</span>
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                Target: Jan 31
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex justify-center">
        <div className="bg-[var(--card2)] p-1.5 rounded-2xl border border-[var(--border)] flex gap-1.5 w-full max-w-2xl shadow-xl overflow-x-auto no-scrollbar">
          {(['ARC', 'CHALLENGES', 'ACHIEVEMENTS', 'TIERS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTabSub(tab)}
              className={cn(
                "flex-1 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none whitespace-nowrap",
                activeTabSub === tab
                  ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]"
                  : "text-[var(--muted)] hover:text-white hover:bg-white/5"
              )}
            >
              {tab === 'ARC' && <Flame size={14} />}
              {tab === 'CHALLENGES' && <Trophy size={14} />}
              {tab === 'ACHIEVEMENTS' && <Award size={14} />}
              {tab === 'TIERS' && <Layers size={14} />}
              {tab === 'ARC' && "8 Arc Paths"}
              {tab === 'CHALLENGES' && "Challenge Quests"}
              {tab === 'ACHIEVEMENTS' && "Trophies & Badges"}
              {tab === 'TIERS' && "Level Hierarchy"}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: TRANSFORMATION PATHS (ARC) */}
      {activeTabSub === 'ARC' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">
                Transformation Paths
              </h2>
              <p className="text-xs text-neutral-400 font-medium">
                Select the training doctrine that matches your goal. You can adapt or switch at any time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {WINTER_ARC_PATHS.map(path => {
              const isSelected = (arcState.selectedPathId === path.id) || (selectedPathPreview === path.id);
              const isActiveInArc = arcState.isActive && arcState.selectedPathId === path.id;

              return (
                <div
                  key={path.id}
                  onClick={() => handleSelectPath(path.id)}
                  className={cn(
                    "relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group",
                    isSelected
                      ? "bg-gradient-to-b from-[#1c1c24] to-[#121218] border-red-500 shadow-xl shadow-red-950/40 scale-[1.02]"
                      : "bg-[var(--card)] border-[var(--border)] hover:border-white/20 hover:bg-[#16161e]"
                  )}
                >
                  {isActiveInArc && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Check size={10} /> Active Path
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner" style={{ backgroundColor: path.accentBg }}>
                      {path.icon}
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-wider">{path.title}</h3>
                      <p className="text-[10px] font-bold text-amber-400 tracking-wider uppercase mt-0.5">{path.tagline}</p>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                      {path.description}
                    </p>

                    <div className="pt-2 border-t border-white/5 space-y-1 text-[10px]">
                      <div className="text-neutral-400 font-medium">
                        <span className="text-white font-bold">Focus:</span> {path.recommendedFocus}
                      </div>
                      <div className="text-neutral-400 font-medium">
                        <span className="text-white font-bold">Frequency:</span> {path.recommendedFrequency}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                      {isSelected ? "Selected" : "Select Path"}
                    </span>
                    {!arcState.isActive ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartWinterArc(path.id);
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        Pledge This Path
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPath(path.id);
                        }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        {isSelected ? "Current Path" : "Switch"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: CHALLENGE QUESTS */}
      {activeTabSub === 'CHALLENGES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">
                Winter Arc Challenge Missions
              </h2>
              <p className="text-xs text-neutral-400 font-medium">
                Accept high-yield fitness missions, push your limits, and earn massive XP rank rewards.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {(['ALL', 'ACTIVE', 'Strength', 'Consistency', 'Endurance', 'Recovery'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                    activeFilter === filter
                      ? "bg-red-600 text-white shadow-md shadow-red-900/30"
                      : "bg-[var(--card)] text-neutral-400 hover:text-white border border-[var(--border)]"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map(ch => {
              const isActive = (arcState.activeChallengeIds || []).includes(ch.id);
              const isCompleted = (arcState.completedChallengeIds || []).includes(ch.id);
              const progress = getChallengeProgress(ch);

              return (
                <div
                  key={ch.id}
                  className={cn(
                    "p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative",
                    isCompleted
                      ? "bg-emerald-950/20 border-emerald-500/40"
                      : isActive
                        ? "bg-gradient-to-b from-[#1e1414] to-[#120e0e] border-red-500/60 shadow-lg shadow-red-950/20"
                        : "bg-[var(--card)] border-[var(--border)]"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                        {ch.icon}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                          ch.difficulty === 'Elite' ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                          ch.difficulty === 'Hard' ? "bg-red-500/20 text-red-300 border-red-500/30" :
                          ch.difficulty === 'Medium' ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                          "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        )}>
                          {ch.difficulty}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-[8px] font-black tracking-widest">
                          +{ch.xpReward} XP
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-wider">{ch.title}</h3>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{ch.description}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        <span>Progress</span>
                        <span className="text-white">{progress.current} / {progress.target} {ch.unit} ({progress.percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-red-600 to-amber-500"
                          )}
                          style={{ width: `${Math.min(100, progress.percent)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                      {ch.duration}
                    </span>

                    <button
                      onClick={() => handleToggleChallenge(ch)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 flex items-center gap-1.5",
                        isCompleted
                          ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                          : isActive
                            ? "bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white shadow-md shadow-red-900/30"
                            : "bg-white/10 hover:bg-white/20 text-white"
                      )}
                    >
                      {isCompleted && <CheckCircle2 size={12} />}
                      {isCompleted ? "Completed" : isActive ? "Claim Progress" : "Accept Quest"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: ACHIEVEMENTS & TROPHIES */}
      {activeTabSub === 'ACHIEVEMENTS' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">
              Achievements & Trophies
            </h2>
            <p className="text-xs text-neutral-400 font-medium">
              Honor your milestones. Every heavy lift, streak, and disciplined day counts toward your legacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between",
                  ach.unlocked
                    ? "bg-gradient-to-b from-[#18151f] to-[#0f0e14] border-amber-500/50 shadow-xl shadow-amber-950/20"
                    : "bg-[var(--card)] border-[var(--border)] opacity-60"
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border",
                      ach.unlocked
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/20"
                        : "bg-neutral-800 border-neutral-700 text-neutral-500"
                    )}>
                      {ach.icon}
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-[9px] font-black tracking-widest">
                      +{ach.xpReward} XP
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">{ach.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{ach.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                    {ach.category}
                  </span>

                  {ach.unlocked ? (
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1">
                      <Lock size={12} /> LOCKED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: LEVEL HIERARCHY */}
      {activeTabSub === 'TIERS' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">
              LevelUp Rank Hierarchy
            </h2>
            <p className="text-xs text-neutral-400 font-medium">
              Ascend through the legendary fitness tiers by accumulating XP through disciplined training.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { level: '1-2', title: 'BEGINNER', desc: 'Starting the journey and learning fundamentals.', color: 'text-neutral-400' },
              { level: '3-4', title: 'ROOKIE', desc: 'Consistent movement patterns and initial adaptations.', color: 'text-emerald-400' },
              { level: '5-9', title: 'GRINDER', desc: 'Developing raw grit, workout momentum, and discipline.', color: 'text-blue-400' },
              { level: '10-14', title: 'CONSISTENT', desc: 'Unbroken habit formation and steady progressive overload.', color: 'text-cyan-400' },
              { level: '15-19', title: 'WARRIOR', desc: 'Domination of workouts and visible physical transformation.', color: 'text-amber-400' },
              { level: '20-24', title: 'ELITE', desc: 'Advanced biomechanics, heavy volume, and clean nutrition.', color: 'text-red-400' },
              { level: '25-29', title: 'MASTER', desc: 'Command over strength, conditioning, and recovery systems.', color: 'text-purple-400' },
              { level: '30-39', title: 'LEGEND', desc: 'Peak physical condition and inspiration to other athletes.', color: 'text-pink-400' },
              { level: '40-49', title: 'MYTHIC', desc: 'Unbreakable mental and physical pinnacle of human fitness.', color: 'text-yellow-300' },
              { level: '50+', title: 'IMMORTAL', desc: 'Supreme eternal mastery. Physical and mental perfection.', color: 'text-orange-400' }
            ].map(tier => {
              const isCurrent = userLevel >= parseInt(tier.level.split('-')[0]) && 
                (tier.level.includes('+') || userLevel <= parseInt(tier.level.split('-')[1]));

              return (
                <div
                  key={tier.title}
                  className={cn(
                    "p-5 rounded-2xl border transition-all duration-300",
                    isCurrent
                      ? "bg-gradient-to-b from-[#1e1515] to-[#120d0d] border-red-500 shadow-xl shadow-red-950/30 ring-1 ring-red-500"
                      : "bg-[var(--card)] border-[var(--border)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      LEVEL {tier.level}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[8px] font-black tracking-widest border border-red-500/30">
                        CURRENT TIER
                      </span>
                    )}
                  </div>

                  <h3 className={cn("text-lg font-black uppercase tracking-wider mt-2", tier.color)}>
                    {tier.title}
                  </h3>

                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {tier.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
