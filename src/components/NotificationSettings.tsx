import { useState, useEffect } from 'react';
import { Bell, Lock, CheckCircle, Info, Trash, AlertCircle, Droplets, Dumbbell, Calendar, Play, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface NotificationSettingsProps {
  onClose: () => void;
  triggerToast: (msg: string) => void;
}

export default function NotificationSettings({ onClose, triggerToast }: NotificationSettingsProps) {
  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [workoutTime, setWorkoutTime] = useState('18:00');
  
  const [waterReminder, setWaterReminder] = useState(true);
  const [waterTime, setWaterTime] = useState('12:00');

  const [restReminder, setRestReminder] = useState(false);
  const [restTime, setRestTime] = useState('09:00');

  // New browser notification settings state
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');

  // Load preferences from localStorage on mount & probe browser API
  useEffect(() => {
    // Check permission status
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
    } else {
      setPermissionStatus(Notification.permission as any);
    }

    try {
      const stored = localStorage.getItem('lv_notification_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.workoutReminder !== undefined) setWorkoutReminder(parsed.workoutReminder);
        if (parsed.workoutTime !== undefined) setWorkoutTime(parsed.workoutTime);
        if (parsed.waterReminder !== undefined) setWaterReminder(parsed.waterReminder);
        if (parsed.waterTime !== undefined) setWaterTime(parsed.waterTime);
        if (parsed.restReminder !== undefined) setRestReminder(parsed.restReminder);
        if (parsed.restTime !== undefined) setRestTime(parsed.restTime);
      }
    } catch (e) {
      console.error("Failed to load notifications preferences", e);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      triggerToast("⚠️ Notifications are not supported in this browser environment.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermissionStatus(result as any);
      if (result === 'granted') {
        triggerToast("🎉 Push Notifications Authorized! Live bio-coaching is active.");
        new Notification("LVL up Coach", {
          body: "System ready: Workout reminders will arrive at your specified target times!",
          icon: "/favicon.ico"
        });
      } else if (result === 'denied') {
        triggerToast("⚠️ Permission denied. Reminders will fallback to in-app toasts.");
      }
    } catch (err) {
      console.warn("Permission request failed", err);
    }
  };

  const saveSettings = () => {
    const config = {
      workoutReminder,
      workoutTime,
      waterReminder,
      waterTime,
      restReminder,
      restTime
    };
    localStorage.setItem('lv_notification_config', JSON.stringify(config));
    triggerToast("🔔 Coach Update: Notification preferences saved!");
    onClose();
  };

  const handleTestNotification = (type: 'workout' | 'water' | 'rest') => {
    let title = "LVL up Coach";
    let message = "";

    if (type === 'workout') {
      message = "Time for your workout, let's go! 🏋️";
    } else if (type === 'water') {
      message = "Water Check: Drink 250ml water now to protect muscle cell hydration. 💧";
    } else {
      message = "Coach says: Slow down, today is an active recovery day! 🧘";
    }

    // Attempt real browser notification
    if (permissionStatus === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: "/favicon.ico",
        });
      } catch (e) {
        console.warn("Direct Notification constructor failed. Relying on Toast.");
      }
    }

    // Always fallback to in-app toast for perfect consistency
    triggerToast(`🔔 ${message}`);
  };

  return (
    <div className="p-6 sm:p-8 bg-[var(--bg)] border border-[var(--border)] rounded-[2rem] w-full max-w-md mx-auto shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-44 h-44 bg-[var(--red)]/5 rounded-full blur-2xl -z-10" />

      <div className="flex items-center gap-3.5 border-b border-[var(--border)] pb-4">
        <div className="w-10 h-10 bg-[var(--red)]/10 text-[var(--red)] rounded-xl flex items-center justify-center shadow-lg">
          <Bell size={20} className="animate-swing" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight text-white">Smart Reminders</h3>
          <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest">Local scheduling assistants</p>
        </div>
      </div>

      {/* BROWSER SERVICE WORKER / PUSH INTEGRATION STATUS */}
      <div className="p-5 bg-gradient-to-br from-indigo-500/5 to-[var(--red)]/5 border border-[var(--border)] rounded-[1.8rem] space-y-3.5 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span className="text-[11px] font-black uppercase text-white tracking-wider">Browser Push Status</span>
          </div>
          <div>
            {permissionStatus === 'granted' && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-black tracking-widest uppercase">
                ✓ GRANTED
              </span>
            )}
            {permissionStatus === 'denied' && (
              <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-black tracking-widest uppercase">
                ❌ DENIED
              </span>
            )}
            {permissionStatus === 'default' && (
              <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full font-black tracking-widest uppercase animate-pulse">
                PENDING ACTION
              </span>
            )}
            {permissionStatus === 'unsupported' && (
              <span className="text-[9px] bg-white/10 text-white/50 border border-white/10 px-2.5 py-1 rounded-full font-black tracking-widest uppercase">
                UNSUPPORTED
              </span>
            )}
          </div>
        </div>

        {/* Success / Status Views */}
        {permissionStatus === 'granted' ? (
          <div className="space-y-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle size={14} />
              <span className="text-xs font-black uppercase tracking-wider">Permissions Granted</span>
            </div>
            <p className="text-[10px] text-white/90 leading-relaxed font-semibold">
              Your browser notifications are successfully active. Workout, Water, and Recovery reminders will now trigger native alert banners.
            </p>
          </div>
        ) : permissionStatus === 'denied' ? (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">System Locked</p>
            <p className="text-[10px] text-white/80 leading-relaxed">
              Standard notification banners are blocked. Click the padlock icon in your browser URL bar to re-enable alerts.
            </p>
          </div>
        ) : permissionStatus === 'unsupported' ? (
          <p className="text-[10px] text-[var(--muted)] font-medium leading-relaxed bg-white/5 p-3 rounded-xl">
            Local browser context doesn't support the HTML5 Web Notification API. Falling back to internal app toasts seamlessly.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] text-[var(--muted)] leading-relaxed font-bold">
              Enable real-time push tracking to stay synchronized. Click below to grant browser permission.
            </p>
            <button
              onClick={requestPermission}
              className="w-full py-3 px-4 bg-gradient-to-r from-[var(--red)] to-amber-500 hover:brightness-115 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[var(--red)]/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Bell size={14} /> Enable Push Notifications
            </button>
          </div>
        )}

        {/* MOBILE ALERTS OPTIMIZATION GUIDE */}
        <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-indigo-300">
            <span className="text-xs">📱</span>
            <span className="text-[10px] font-black uppercase tracking-wider">Set Up Mobile Lockscreen pushing</span>
          </div>
          <p className="text-[10px] text-white/90 leading-relaxed">
            To receive live reminders directly on your phone's lockscreen, tap your mobile browser menu <span className="text-indigo-300 font-bold">(Share / Opener)</span> and select <span className="text-indigo-300 font-bold">"Add to Home Screen"</span>. Once opened from your homescreen, the coach will trigger local system notifications natively on your mobile phone!
          </p>
        </div>
      </div>

      <div className="space-y-5">
        
        {/* WORKOUT REMINDER ROW */}
        <div className="p-4 bg-[var(--card2)] border border-[var(--border)] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Dumbbell size={16} className="text-[var(--red)]" />
              <span className="text-xs font-black uppercase text-white tracking-wider">Workout Reminder</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={workoutReminder} 
                onChange={(e) => setWorkoutReminder(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--red)]" />
            </label>
          </div>
          {workoutReminder && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="flex items-center justify-between gap-4 pt-1"
            >
              <span className="text-[10px] text-[var(--muted)] font-black uppercase tracking-wider">Trigger Time</span>
              <input 
                type="time" 
                value={workoutTime} 
                onChange={(e) => setWorkoutTime(e.target.value)}
                className="bg-black/40 border border-[var(--border)] rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-[var(--red)] font-bold"
              />
            </motion.div>
          )}
          <button 
            onClick={() => handleTestNotification('workout')}
            className="w-full text-left text-[9px] font-black uppercase text-[var(--muted)] hover:text-white transition-colors flex items-center gap-1 mt-1"
          >
            <Play size={8} /> Send test preview alert
          </button>
        </div>

        {/* WATER TRACKER REMINDER ROW */}
        <div className="p-4 bg-[var(--card2)] border border-[var(--border)] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Droplets size={16} className="text-blue-400" />
              <span className="text-xs font-black uppercase text-white tracking-wider">Hydration Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={waterReminder} 
                onChange={(e) => setWaterReminder(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500" />
            </label>
          </div>
          {waterReminder && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="flex items-center justify-between gap-4 pt-1"
            >
              <span className="text-[10px] text-[var(--muted)] font-black uppercase tracking-wider">Trigger Time</span>
              <input 
                type="time" 
                value={waterTime} 
                onChange={(e) => setWaterTime(e.target.value)}
                className="bg-black/40 border border-[var(--border)] rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-blue-500 font-bold"
              />
            </motion.div>
          )}
          <button 
            onClick={() => handleTestNotification('water')}
            className="w-full text-left text-[9px] font-black uppercase text-[var(--muted)] hover:text-white transition-colors flex items-center gap-1 mt-1"
          >
            <Play size={8} /> Send test preview alert
          </button>
        </div>

        {/* REST DAY SUGGESTIONS */}
        <div className="p-4 bg-[var(--card2)] border border-[var(--border)] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar size={16} className="text-yellow-400" />
              <span className="text-xs font-black uppercase text-white tracking-wider">Rest Checkpoints</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={restReminder} 
                onChange={(e) => setRestReminder(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500" />
            </label>
          </div>
          {restReminder && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="flex items-center justify-between gap-4 pt-1"
            >
              <span className="text-[10px] text-[var(--muted)] font-black uppercase tracking-wider">Trigger Time</span>
              <input 
                type="time" 
                value={restTime} 
                onChange={(e) => setRestTime(e.target.value)}
                className="bg-black/40 border border-[var(--border)] rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-yellow-500 font-bold"
              />
            </motion.div>
          )}
          <button 
            onClick={() => handleTestNotification('rest')}
            className="w-full text-left text-[9px] font-black uppercase text-[var(--muted)] hover:text-white transition-colors flex items-center gap-1 mt-1"
          >
            <Play size={8} /> Send test preview alert
          </button>
        </div>

      </div>

      <div className="space-y-4 pt-4 border-t border-[var(--border)]">
        <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
          <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/90 leading-relaxed font-bold">
            All notifications are processed client-side inside this browser session for total biometric privacy.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-[var(--card2)] border border-[var(--border)] text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[var(--sub)] hover:border-white/15 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={saveSettings}
            className="flex-1 py-3 bg-[var(--red)] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[var(--red)]/20 active:scale-95 transition-all"
          >
            Confirm Rules
          </button>
        </div>
      </div>
    </div>
  );
}
