import { useState, useEffect } from 'react';
import { Moon, Clock, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function SleepTracker() {
  const [sleepTime, setSleepTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [hours, setHours] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const today = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    const saved = localStorage.getItem(`sleep-${today}`);
    if (saved) {
      const { sleep, wake, h } = JSON.parse(saved);
      setSleepTime(sleep);
      setWakeTime(wake);
      setHours(h);
      setShowResult(true);
    }
  }, [today]);

  const calculateSleep = () => {
    const [sH, sM] = sleepTime.split(':').map(Number);
    const [wH, wM] = wakeTime.split(':').map(Number);
    
    let diff = (wH * 60 + wM) - (sH * 60 + sM);
    if (diff <= 0) diff += 24 * 60; // Next day
    
    const h = Math.round((diff / 60) * 10) / 10;
    setHours(h);
    setShowResult(true);
    
    // XP reward for logging sleep
    const currentXp = parseInt(localStorage.getItem('user-xp') || '0');
    const xpReward = Math.floor(h * 20); // 20 XP per hour of sleep
    localStorage.setItem('user-xp', (currentXp + xpReward).toString());
    window.dispatchEvent(new Event('storage'));

    localStorage.setItem(`sleep-${today}`, JSON.stringify({
      sleep: sleepTime,
      wake: wakeTime,
      h
    }));
  };

  const getQuality = (h: number) => {
    if (h < 6) return { text: 'Poor', emoji: '😴', color: 'text-red-400' };
    if (h < 8) return { text: 'Good', emoji: '🙂', color: 'text-blue-400' };
    return { text: 'Excellent', emoji: '💪', color: 'text-green-400' };
  };

  const quality = getQuality(hours);

  return (
    <div className="glass-card p-6 bg-gradient-to-br from-purple-600/10 to-indigo-500/10 border-purple-500/20 group relative overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(147,51,234,0.1)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
            <Moon size={20} />
          </div>
          <div>
            <h3 className="font-display font-black text-lg tracking-tight uppercase">Sleep Data</h3>
            <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Recovery tracking</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Sleep Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
            <input 
              type="time" 
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-sm font-bold focus:border-purple-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Wake Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
            <input 
              type="time" 
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-sm font-bold focus:border-purple-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={calculateSleep}
        className="w-full py-4 rounded-xl bg-purple-600 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-purple-600/20 hover:brightness-110 active:scale-95 transition-all mb-8"
      >
        Calculate & Log
      </button>

      {showResult && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
            <div>
              <div className="text-3xl font-black tracking-tighter flex items-baseline gap-1">
                {hours}
                <span className="text-xs text-[var(--muted)] font-bold">hrs</span>
              </div>
              <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mt-1">Total Rest</div>
            </div>
            <div className="text-right">
              <div className={cn("text-xl font-black transition-colors", quality.color)}>
                {quality.emoji} {quality.text}
              </div>
              <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Quality</div>
            </div>
          </div>

          <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl flex items-start gap-3">
             <Info size={14} className="text-purple-400 mt-0.5" />
             <p className="text-[10px] font-bold text-purple-300 italic leading-relaxed tracking-tight">
               {hours < 6 
                ? "Your sleep is below recommended. Try to get more rest for better recovery."
                : hours < 8 
                  ? "Good sleep! Keep it up to maintain high performance."
                  : "Excellent recovery! Your body is ready for peak performance today."
               }
             </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

