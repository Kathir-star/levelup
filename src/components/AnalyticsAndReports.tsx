import { useMemo, useState } from 'react';
import {
  UserProfile,
  WorkoutEntry,
  PR,
  SleepEntry,
  LoggedFoodEntry,
  AppSettings
} from '../types';
import { calculateMacroTargets } from '../utils/nutritionDatabase';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import ErrorBoundary from './ErrorBoundary';
import {
  FileDown,
  TrendingUp,
  Trophy,
  Flame,
  Droplets,
  Moon,
  Footprints,
  Dumbbell,
  Utensils,
  Award,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { cn } from '../lib/utils';

interface AnalyticsAndReportsProps {
  profile: UserProfile | null;
  workoutData: Record<string, WorkoutEntry[]>;
  prs: Record<string, PR>;
  sleepData: SleepEntry[];
  steps: number;
  water: number;
  settings?: Partial<AppSettings>;
  triggerToast: (msg: string) => void;
}

export default function AnalyticsAndReports({
  profile,
  workoutData,
  prs,
  sleepData,
  steps,
  water,
  settings,
  triggerToast
}: AnalyticsAndReportsProps) {
  const userKey = profile?.name || 'Athlete';
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const targets = useMemo(() => calculateMacroTargets(profile, settings), [profile, settings]);

  const nutritionLogs = useMemo<Record<string, LoggedFoodEntry[]>>(() => {
    try {
      const raw = localStorage.getItem(`lv_nutrition_logs_${userKey}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [userKey]);

  const waterHistory = useMemo<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(`lv_water_history_${userKey}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [userKey]);

  const stepsHistory = useMemo<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(`lv_steps_history_${userKey}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [userKey]);

  // Build daily timeline for selected rangeDays
  const timelineData = useMemo(() => {
    const days: {
      date: string;
      label: string;
      volume: number;
      sets: number;
      calories: number;
      protein: number;
      waterMl: number;
      sleepHrs: number;
      stepsCount: number;
    }[] = [];

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const wEntries = Array.isArray(workoutData[dateStr]) ? workoutData[dateStr] : [];
      const volume = wEntries.reduce(
        (sum, e) => sum + (Number(e.weight) || 0) * (Number(e.reps) || 0) * (Number(e.sets) || 1),
        0
      );
      const sets = wEntries.reduce((sum, e) => sum + (Number(e.sets) || 1), 0);

      const nEntries = Array.isArray(nutritionLogs[dateStr]) ? nutritionLogs[dateStr] : [];
      const calories = nEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
      const protein = Math.round(nEntries.reduce((sum, e) => sum + (e.protein || 0), 0));

      const waterMl =
        dateStr === todayStr
          ? Math.max(water * 250, waterHistory[dateStr] || 0)
          : waterHistory[dateStr] || 0;

      const sleepEntry = sleepData.find((s) => s.date === dateStr);
      const sleepHrs = sleepEntry ? Number(sleepEntry.hours) || 0 : 0;

      const stepsCount =
        dateStr === todayStr ? Math.max(steps, stepsHistory[dateStr] || 0) : stepsHistory[dateStr] || 0;

      days.push({
        date: dateStr,
        label,
        volume,
        sets,
        calories,
        protein,
        waterMl,
        sleepHrs,
        stepsCount
      });
    }

    return days;
  }, [rangeDays, workoutData, nutritionLogs, waterHistory, sleepData, stepsHistory, water, steps]);

  // Monthly Report Aggregate for selectedMonth (YYYY-MM)
  const monthlySummary = useMemo(() => {
    const workoutDates = Object.keys(workoutData).filter(
      (d) => d.startsWith(selectedMonth) && Array.isArray(workoutData[d]) && workoutData[d].length > 0
    );

    const monthWorkouts = workoutDates.flatMap((d) => workoutData[d]);
    const totalVolume = monthWorkouts.reduce(
      (s, e) => s + (Number(e.weight) || 0) * (Number(e.reps) || 0) * (Number(e.sets) || 1),
      0
    );
    const totalSets = monthWorkouts.reduce((s, e) => s + (Number(e.sets) || 1), 0);

    // Muscle breakdown
    const muscleCounts: Record<string, number> = {};
    monthWorkouts.forEach((e) => {
      const m = (e.muscle || 'other').toUpperCase();
      muscleCounts[m] = (muscleCounts[m] || 0) + (Number(e.sets) || 1);
    });
    const topMuscle =
      Object.entries(muscleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'FULL BODY';

    // Nutrition in month
    const nutDates = Object.keys(nutritionLogs).filter(
      (d) => d.startsWith(selectedMonth) && (nutritionLogs[d]?.length || 0) > 0
    );
    const avgCalories =
      nutDates.length > 0
        ? Math.round(
            nutDates.reduce(
              (acc, d) => acc + nutritionLogs[d].reduce((s, i) => s + i.calories, 0),
              0
            ) / nutDates.length
          )
        : 0;
    const avgProtein =
      nutDates.length > 0
        ? Math.round(
            nutDates.reduce(
              (acc, d) => acc + nutritionLogs[d].reduce((s, i) => s + i.protein, 0),
              0
            ) / nutDates.length
          )
        : 0;

    // Sleep in month
    const monthSleep = sleepData.filter((s) => s.date.startsWith(selectedMonth));
    const avgSleep =
      monthSleep.length > 0
        ? Number((monthSleep.reduce((s, e) => s + e.hours, 0) / monthSleep.length).toFixed(1))
        : 0;

    // Consistency grade
    const workoutScore = Math.min(100, Math.round((workoutDates.length / 20) * 100));
    const proteinScore = avgProtein > 0 ? Math.min(100, Math.round((avgProtein / targets.protein) * 100)) : 70;
    const overallScore = Math.round(workoutScore * 0.65 + proteinScore * 0.35);

    let grade = 'A+';
    if (overallScore < 50) grade = 'C';
    else if (overallScore < 70) grade = 'B';
    else if (overallScore < 85) grade = 'A';

    return {
      workoutsCompleted: workoutDates.length,
      totalVolume,
      totalSets,
      topMuscle,
      avgCalories,
      avgProtein,
      avgSleep,
      overallScore,
      grade,
      prCount: Object.keys(prs).length
    };
  }, [selectedMonth, workoutData, nutritionLogs, sleepData, prs, targets.protein]);

  const handleDownloadMonthlyPDF = () => {
    try {
      const doc = new jsPDF();
      const athleteName = profile?.name || 'Athlete';

      // Dark Header Banner
      doc.setFillColor(12, 12, 16);
      doc.rect(0, 0, 210, 42, 'F');

      doc.setTextColor(255, 59, 59);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('LEVELUP 2.0 — MONTHLY PERFORMANCE REPORT', 14, 20);

      doc.setTextColor(200, 200, 200);
      doc.setFontSize(10);
      doc.text(
        `Athlete: ${athleteName}   |   Month: ${selectedMonth}   |   Goal: ${profile?.goal || 'Muscle Gain'}   |   Grade: ${monthlySummary.grade} (${monthlySummary.overallScore}/100)`,
        14,
        32
      );

      // Section 1: Executive Summary
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('1. TRAINING & CONSISTENCY SUMMARY', 14, 56);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const summaryLines = [
        `• Workouts Completed: ${monthlySummary.workoutsCompleted} days active`,
        `• Total Tonnage Lifted: ${monthlySummary.totalVolume.toLocaleString()} kg across ${monthlySummary.totalSets} working sets`,
        `• Most Trained Muscle Group: ${monthlySummary.topMuscle}`,
        `• All-Time Personal Records (PRs) Held: ${monthlySummary.prCount} exercises`
      ];
      summaryLines.forEach((line, idx) => {
        doc.text(line, 18, 66 + idx * 8);
      });

      // Section 2: Nutrition & Recovery
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('2. NUTRITION, HYDRATION & SLEEP AVERAGES', 14, 108);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const nutLines = [
        `• Daily Calorie Average: ${monthlySummary.avgCalories || targets.calories} kcal (Target: ${targets.calories} kcal)`,
        `• Daily Protein Average: ${monthlySummary.avgProtein || targets.protein}g (Target: ${targets.protein}g)`,
        `• Average Sleep Duration: ${monthlySummary.avgSleep || 7.5} hours / night`,
        `• Current Body Weight: ${profile?.weight || 70} kg   |   Height: ${profile?.height || 175} cm`
      ];
      nutLines.forEach((line, idx) => {
        doc.text(line, 18, 118 + idx * 8);
      });

      // Section 3: Top Personal Records Table
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('3. TOP PERSONAL RECORDS (STRENGTH VAULT)', 14, 160);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const prEntries = Object.entries(prs).slice(0, 10);
      if (prEntries.length === 0) {
        doc.text('No PRs recorded yet. Log workouts to populate your strength records.', 18, 170);
      } else {
        prEntries.forEach(([exName, record], idx) => {
          const e1rm = Math.round(record.weight * (1 + (record.reps || 1) / 30));
          doc.text(
            `${idx + 1}. ${exName}: ${record.weight} kg x ${record.reps} reps (Est. 1RM: ${e1rm} kg) — ${record.date}`,
            18,
            170 + idx * 7
          );
        });
      }

      // Section 4: Next Month Action Plan
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('4. NEXT MONTH COACH ACTION PLAN', 14, 250);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        '• Aim for progressive overload (+2.5kg or +1-2 reps) on primary compound lifts each week.',
        18,
        259
      );
      doc.text(
        `• Maintain minimum ${targets.protein}g protein daily and 3.0L hydration for optimal myofibrillar recovery.`,
        18,
        266
      );

      doc.save(`LevelUp_Report_${athleteName}_${selectedMonth}.pdf`);
      triggerToast('📄 Monthly PDF Report generated & downloaded!');
    } catch (e) {
      console.error('PDF generation failed:', e);
      triggerToast('⚠️ Could not generate PDF report.');
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--card)] border border-[var(--border)] p-5 rounded-3xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Deep Analytics & Monthly Report
            </h2>
            <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest">
              Volume, Nutrition, Recovery & Exportable PDF Summaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => setRangeDays(days)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all",
                rangeDays === days
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-[var(--sub)] text-[var(--muted)] border-[var(--border)] hover:text-white"
              )}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Report Card + PDF Download */}
      <div className="bg-gradient-to-br from-[var(--card)] to-black border border-[var(--border)] rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-[var(--accent)]" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">
                Monthly Performance Report Card
              </h3>
              <p className="text-xs text-[var(--muted)] font-bold">
                Select month to inspect or download clean PDF report
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[var(--sub)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-black text-white outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={handleDownloadMonthlyPDF}
              className="px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:brightness-110 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[var(--accent)]/25 transition-all cursor-pointer"
            >
              <FileDown size={16} />
              Download PDF Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
            <div className="text-[10px] font-black uppercase text-[var(--muted)]">Overall Grade</div>
            <div className="text-3xl font-black text-[var(--yellow)] mt-1">
              {monthlySummary.grade}{' '}
              <span className="text-xs text-[var(--muted)]">({monthlySummary.overallScore}%)</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
            <div className="text-[10px] font-black uppercase text-[var(--muted)]">Workouts</div>
            <div className="text-2xl font-black text-white mt-1">
              {monthlySummary.workoutsCompleted} <span className="text-xs text-[var(--muted)]">days</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
            <div className="text-[10px] font-black uppercase text-[var(--muted)]">Total Volume</div>
            <div className="text-2xl font-black text-[var(--accent)] mt-1">
              {(monthlySummary.totalVolume / 1000).toFixed(1)}k <span className="text-xs">kg</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
            <div className="text-[10px] font-black uppercase text-[var(--muted)]">Top Muscle</div>
            <div className="text-lg font-black text-emerald-400 mt-1 truncate">
              {monthlySummary.topMuscle}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
            <div className="text-[10px] font-black uppercase text-[var(--muted)]">Avg Protein</div>
            <div className="text-2xl font-black text-red-400 mt-1">
              {monthlySummary.avgProtein || 0}g
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
            <div className="text-[10px] font-black uppercase text-[var(--muted)]">Avg Sleep</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              {monthlySummary.avgSleep || 0}h
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Volume Trend */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Dumbbell size={16} className="text-[var(--accent)]" />
                Workout Tonnage Volume ({rangeDays}D)
              </h4>
              <p className="text-[10px] text-[var(--muted)] font-bold uppercase">
                Total weight × reps × sets lifted per day
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ErrorBoundary>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="volume" name="Volume (kg)" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ErrorBoundary>
          </div>
        </div>

        {/* Nutrition Calories & Protein Trend */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Utensils size={16} className="text-emerald-400" />
                Calorie & Protein Consistency ({rangeDays}D)
              </h4>
              <p className="text-[10px] text-[var(--muted)] font-bold uppercase">
                Daily logged intake vs target ({targets.calories} kcal / {targets.protein}g P)
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ErrorBoundary>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }}
                  />
                  <Line type="monotone" dataKey="calories" name="Calories (kcal)" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="protein" name="Protein (g)" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
