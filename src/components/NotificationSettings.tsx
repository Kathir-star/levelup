import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Bell, CheckCircle, Info, Trash, Droplets, Dumbbell, Calendar, 
  Play, Sparkles, X, BellOff, CheckCheck, RefreshCw, Smartphone
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationSettingsProps {
  onClose: () => void;
  triggerToast: (msg: string) => void;
  onForceUpdate: () => void;
}

export interface SessionNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'Completed' | 'Pending';
  type: 'workout' | 'water' | 'level' | 'coaching' | 'system';
}

const defaultReminderConfig = {
  workoutReminder: true,
  workoutTime: '18:00',
  waterReminder: true,
  waterTime: '12:00',
  restReminder: false,
  restTime: '09:00'
};

// Simulated subtle haptic trigger for high-fidelity fit-tech feeling
const triggerHaptic = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(12);
    } catch (e) {
      // Ignore security block in sandbox if iframe restricts clipboard/haptics
    }
  }
};

export default function NotificationSettings({ onClose, triggerToast, onForceUpdate }: NotificationSettingsProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');
  const [isMobile, setIsMobile] = useState(false);
  
  // Notification history state
  const [notifications, setNotifications] = useState<SessionNotification[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isScrollLoading, setIsScrollLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Preference Settings state
  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [workoutTime, setWorkoutTime] = useState('18:00');
  const [waterReminder, setWaterReminder] = useState(true);
  const [waterTime, setWaterTime] = useState('12:00');
  const [restReminder, setRestReminder] = useState(false);
  const [restTime, setRestTime] = useState('09:00');

  // Push Permission probe state
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');

  // 1. Detect device form factor (mobile vs desktop) for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Setup ESC Key listener for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 3. Load notifications history & preferences on mount
  const loadNotificationsData = useCallback(() => {
    try {
      const stored = localStorage.getItem('lv_session_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        // Fallback or dynamic initial seeding handles if absent
        const seedData: SessionNotification[] = [
          {
            id: "sn_1",
            title: "🏆 Level up Champion!",
            description: "Congratulations on starting your fitness biometric journey! Complete daily goals to unlock Level 2.",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            status: "Completed",
            type: "level"
          },
          {
            id: "sn_2",
            title: "💧 Biometric Hydration Rule Set",
            description: "Optimal cellular hydration targets generated: standard 250ml intervals active before training.",
            timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
            status: "Completed",
            type: "water"
          },
          {
            id: "sn_3",
            title: "🏋️ Daily Workout Mission Configured",
            description: "Action plan synchronized. Complete 4 active sets today to protect your daily streak multiplier.",
            timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
            status: "Pending",
            type: "workout"
          }
        ];
        localStorage.setItem('lv_session_notifications', JSON.stringify(seedData));
        setNotifications(seedData);
      }
    } catch (e) {
      console.error("Failed to parse notifications database", e);
    }
  }, []);

  useEffect(() => {
    loadNotificationsData();

    // Probe native HTML5 permissions
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
    } else {
      setPermissionStatus(Notification.permission as any);
    }

    // Load preferences
    try {
      const stored = localStorage.getItem('lv_notification_config');
      const parsed = stored ? JSON.parse(stored) : defaultReminderConfig;
      setWorkoutReminder(parsed.workoutReminder !== undefined ? parsed.workoutReminder : true);
      setWorkoutTime(parsed.workoutTime || '18:00');
      setWaterReminder(parsed.waterReminder !== undefined ? parsed.waterReminder : true);
      setWaterTime(parsed.waterTime || '12:00');
      setRestReminder(parsed.restReminder !== undefined ? parsed.restReminder : false);
      setRestTime(parsed.restTime || '09:00');
    } catch (e) {
      console.error("Preferences load error", e);
    }

    // Listen to live session notifications updates
    const handleUpdate = () => {
      loadNotificationsData();
    };
    window.addEventListener('lv_session_notifications_updated', handleUpdate);
    return () => window.removeEventListener('lv_session_notifications_updated', handleUpdate);
  }, [loadNotificationsData]);

  // Request browser Notification privileges
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      triggerToast("⚠️ Notifications are not supported in this browser environment.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermissionStatus(result as any);
      triggerHaptic();
      
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

  // Save scheduler settings configurations
  const saveSettings = () => {
    const config = {
      workoutReminder,
      workoutTime,
      waterReminder,
      waterTime,
      restReminder,
      restTime
    };
    try {
      localStorage.setItem('lv_notification_config', JSON.stringify(config));
      triggerToast("🔔 Coach Update: Notification preferences saved!");
      triggerHaptic();
      onClose();
    } catch (e) {
      triggerToast("⚠️ Failed to write preferences.");
    }
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

    triggerHaptic();

    // Trigger local push
    if (permissionStatus === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: "/favicon.ico",
        });
      } catch (e) {
        console.warn("Notification constructor restricted.");
      }
    }

    triggerToast(`🔔 ${message}`);
  };

  // Scroll handler for Infinite Scroll Lazy Loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (visibleCount >= notifications.length) return;

    // Check if scrolled within 30px of bottom boundary
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 30;
    
    if (isNearBottom && !isScrollLoading) {
      setIsScrollLoading(true);
      
      // Hardware-friendly micro de-bounce lag optimization (150ms buffer to simulate smooth telemetry loading)
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + 5, notifications.length));
        setIsScrollLoading(false);
      }, 150);
    }
  }, [visibleCount, notifications.length, isScrollLoading]);

  // Mark all notifications as Completed
  const handleMarkAllRead = () => {
    if (notifications.length === 0) return;
    triggerHaptic();
    const updated = notifications.map(notif => ({ ...notif, status: 'Completed' as const }));
    setNotifications(updated);
    try {
      localStorage.setItem('lv_session_notifications', JSON.stringify(updated));
      triggerToast("📚 All session notifications marked as read!");
    } catch (e) {
      console.error(e);
    }
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (notifications.length === 0) return;
    triggerHaptic();
    setNotifications([]);
    setVisibleCount(6);
    try {
      localStorage.setItem('lv_session_notifications', JSON.stringify([]));
      triggerToast("🧹 Biometric notification feed cleared.");
    } catch (e) {
      console.error(e);
    }
  };

  // Clear or toggle individual item
  const handleToggleIndividual = (id: string) => {
    triggerHaptic();
    const updated = notifications.map(notif => {
      if (notif.id === id) {
        return { 
          ...notif, 
          status: notif.status === 'Completed' ? 'Pending' as const : 'Completed' as const 
        };
      }
      return notif;
    });
    setNotifications(updated);
    try {
      localStorage.setItem('lv_session_notifications', JSON.stringify(updated));
    } catch (e) {}
  };

  // Relative/Human-readable time conversion helper
  const formatTimeDifference = useCallback((isoString: string) => {
    try {
      const past = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - past.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffSecs < 15) return "Just now";
      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${diffDays}d ago`;
    } catch (e) {
      return "Just now";
    }
  }, []);

  // Filter & Memoize visible indicators list
  const visibleNotificationsList = useMemo(() => {
    return notifications.slice(0, visibleCount);
  }, [notifications, visibleCount]);

  // Handle Swipe Gesture end on mobile bottom sheets
  const handleDragEnd = (_event: any, info: any) => {
    // If swiped down past velocity or offset of 100px on mobile
    if (isMobile && (info.offset.y > 100 || info.velocity.y > 300)) {
      triggerHaptic();
      onClose();
    }
  };

  return (
    <div 
      id="notification-panel-overlay"
      className="fixed inset-0 z-[650] bg-black/80 backdrop-blur-md flex items-end sm:items-stretch sm:justify-end cursor-pointer overflow-hidden select-none"
      onClick={() => {
        triggerHaptic();
        onClose();
      }}
    >
      <motion.div
        drag={isMobile ? "y" : false}
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 500 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={handleDragEnd}
        initial={isMobile ? { y: "100%" } : { x: "100%", opacity: 0.9 }}
        animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
        exit={isMobile ? { y: "100%", transition: { duration: 0.2 } } : { x: "100%", opacity: 0, transition: { duration: 0.25 } }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when tapping on content container
        className={cn(
          "bg-[var(--bg)] border-t border-[var(--border)] sm:border-t-0 sm:border-l w-full shadow-2xl relative flex flex-col cursor-default font-sans will-change-transform will-change-opacity",
          isMobile 
            ? "max-h-[85vh] h-full rounded-t-[2.5rem] bottom-0" 
            : "h-full w-full max-w-[370px] right-0 rounded-l-[2rem] border-l border-[var(--border)] border-y-0"
        )}
      >
        {/* Swipe down handle for mobile drawer */}
        {isMobile && (
          <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-14 h-1.5 bg-white/10 rounded-full" />
        )}

        {/* ACCESSIBLE CLOSE (X) BUTTON - TOP RIGHT BOUNDARY (FIXED) */}
        <button
          onClick={() => {
            triggerHaptic();
            onClose();
          }}
          className={cn(
            "absolute z-50 p-2.5 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-white bg-[var(--card)] hover:bg-[var(--border)] transition-all flex items-center justify-center cursor-pointer shadow-md",
            isMobile ? "top-5 right-5 w-10 h-10" : "top-4 right-4 w-10 h-10"
          )}
          style={{ minWidth: "40px", minHeight: "40px" }}
          title="Dismiss Panel"
        >
          <X size={16} className="transition-transform group-hover:rotate-90 duration-200" />
        </button>

        {/* PANEL HEADER WITH ICON */}
        <div className="pt-8 px-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3.5 mb-5 mt-1">
            <div className="w-10 h-10 bg-[var(--red)]/15 text-[var(--red)] rounded-xl flex items-center justify-center shadow-inner">
              <Bell size={18} className="animate-swing text-[var(--red)]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-white tracking-tight leading-tight">Session Alerts</h3>
              <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest mt-0.5">Biometric logs dashboard</p>
            </div>
          </div>

          {/* TWO WAY SEGMENTED SLICK TAB toggler */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-[var(--border)]">
            <button
              onClick={() => {
                triggerHaptic();
                setActiveTab('feed');
              }}
              className={cn(
                "flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                activeTab === 'feed' ? "bg-[var(--red)] text-white shadow-md" : "text-[var(--muted)] hover:text-white"
              )}
            >
              🚀 Alert Feed
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setActiveTab('settings');
              }}
              className={cn(
                "flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                activeTab === 'settings' ? "bg-[var(--red)] text-white shadow-md" : "text-[var(--muted)] hover:text-white"
              )}
            >
              ⚙️ Scheduler
            </button>
          </div>
        </div>

        {/* TAB 1: NOTIFICATION LIVE FEED */}
        {activeTab === 'feed' && (
          <>
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5 custom-scrollbar min-h-[250px]"
            >
              <AnimatePresence initial={false}>
                {notifications.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12 px-4 select-none"
                  >
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/40 mb-4 animate-pulse">
                      <BellOff size={24} />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Feed Fully Calibrated</h4>
                    <p className="text-[10px] text-[var(--muted)]/70 max-w-[220px] mx-auto mt-2 leading-relaxed">
                      Biometric coaching recommendations, water checkpoints, and training level milestones stream here in real-time.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {visibleNotificationsList.map((notif) => {
                      const isPending = notif.status === 'Pending';
                      
                      // Match type to dynamic icons and color tags
                      let iconBg = "bg-white/5";
                      let iconText = "text-white";
                      let badgeStyle = "border-white/10 text-white";
                      let typeIcon = <Bell size={13} />;

                      if (notif.type === 'workout') {
                        iconBg = "bg-[var(--red)]/10";
                        iconText = "text-[var(--red)]";
                        badgeStyle = "border-[var(--red)]/20 text-[var(--red)]";
                        typeIcon = <Dumbbell size={13} />;
                      } else if (notif.type === 'water') {
                        iconBg = "bg-blue-500/10";
                        iconText = "text-blue-400";
                        badgeStyle = "border-blue-500/15 text-blue-400";
                        typeIcon = <Droplets size={13} />;
                      } else if (notif.type === 'level') {
                        iconBg = "bg-amber-500/10";
                        iconText = "text-amber-400";
                        badgeStyle = "border-amber-500/20 text-amber-400";
                        typeIcon = <Sparkles size={13} />;
                      } else if (notif.type === 'coaching') {
                        iconBg = "bg-emerald-500/15";
                        iconText = "text-emerald-400";
                        badgeStyle = "border-emerald-500/20 text-emerald-400";
                        typeIcon = <Info size={13} />;
                      } else if (notif.type === 'system') {
                        iconBg = "bg-indigo-500/10";
                        iconText = "text-indigo-400";
                        badgeStyle = "border-indigo-500/20 text-indigo-400";
                        typeIcon = <CheckCircle size={13} />;
                      }

                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => handleToggleIndividual(notif.id)}
                          className={cn(
                            "p-3.5 bg-[var(--card2)] border hover:border-white/20 hover:-translate-y-[1px] active:translate-y-0 rounded-2xl flex gap-3.5 transition-all cursor-pointer relative overflow-hidden group select-none",
                            isPending ? "border-[var(--red)]/35 shadow-sm shadow-[var(--red)]/5" : "border-[var(--border)] opacity-80 hover:opacity-100"
                          )}
                        >
                          {/* Hardware-accelerated hover background element */}
                          <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 pointer-events-none -z-10" />

                          <div className={cn("w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-sm", iconBg, iconText)}>
                            {typeIcon}
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white uppercase tracking-tight leading-tight block truncate pr-3 group-hover:text-[var(--red)] transition-colors">{notif.title}</span>
                              <span className="text-[8px] text-[var(--muted)] font-black uppercase whitespace-nowrap">{formatTimeDifference(notif.timestamp)}</span>
                            </div>
                            <p className="text-[10px] text-white/70 leading-relaxed font-semibold">{notif.description}</p>
                            
                            <div className="flex items-center gap-2 pt-1 font-mono">
                              <span className={cn(
                                "text-[7.5px] border font-black px-1.5 py-0.5 rounded uppercase tracking-wider block",
                                isPending ? "bg-[var(--red)]/10 border-[var(--red)]/20 text-[var(--red)] animate-pulse" : "bg-neutral-800 border-neutral-700 text-[var(--muted)]"
                              )}>
                                {isPending ? "● Pending" : "✓ Done"}
                              </span>
                              <span className={cn("text-[7.5px] border font-black px-1.5 py-0.5 rounded uppercase tracking-wider block", badgeStyle)}>
                                {notif.type}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>

              {/* Lazy Load loading/trigger indicators for Infinite scroll */}
              {isScrollLoading && (
                <div className="flex items-center justify-center gap-2 py-3">
                  <RefreshCw size={12} className="animate-spin text-[var(--red)]" />
                  <span className="text-[8px] font-black uppercase text-[var(--muted)] tracking-widest">Hydrating logs...</span>
                </div>
              )}
            </div>

            {/* FEED ACTION FOOTER */}
            <div className="p-5 border-t border-[var(--border)] flex gap-3 bg-[var(--card)] shrink-0">
              <button
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="flex-1 py-3 border border-[var(--border)] text-white hover:border-white/15 disabled:opacity-40 disabled:hover:border-[var(--border)] active:scale-95 transition-all text-[9px] font-black uppercase tracking-widest rounded-xl cursor-pointer flex items-center justify-center gap-1.5 bg-[var(--card2)]"
              >
                <Trash size={12} /> Clear Feed
              </button>
              <button
                onClick={handleMarkAllRead}
                disabled={notifications.length === 0}
                className="flex-1 py-3 bg-[var(--red)] hover:brightness-110 disabled:opacity-40 active:scale-95 transition-all text-[9px] font-black uppercase tracking-widest rounded-xl text-white shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCheck size={12} /> Read All
              </button>
            </div>
          </>
        )}

        {/* TAB 2: SMART COACH REMINDERS SCHEDULER PREFERENCES */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar min-h-[250px]">
            {/* PLATFORM PUSH STATUS */}
            <div className="p-4 bg-gradient-to-br from-indigo-500/5 to-[var(--red)]/5 border border-[var(--border)] rounded-[1.8rem] space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--red)]/5 rounded-full blur-xl -z-10" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-white tracking-wider">Browser Push Status</span>
                </div>
                <div>
                  {permissionStatus === 'granted' && (
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                      ✓ GRANTED
                    </span>
                  )}
                  {permissionStatus === 'denied' && (
                    <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                      ❌ DENIED
                    </span>
                  )}
                  {permissionStatus === 'default' && (
                    <span className="text-[8px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-black tracking-widest uppercase animate-pulse">
                      PROBE
                    </span>
                  )}
                  {permissionStatus === 'unsupported' && (
                    <span className="text-[8px] bg-white/10 text-white/50 border border-white/10 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                      RESTRICTED
                    </span>
                  )}
                </div>
              </div>

              {permissionStatus === 'granted' ? (
                <p className="text-[10px] text-white/95 leading-relaxed font-semibold bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                  Browser push enabled. Scheduled alarms will pop up on your system natively.
                </p>
              ) : permissionStatus === 'denied' ? (
                <p className="text-[10px] text-red-400/90 leading-relaxed font-bold bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl">
                  Standard notifications locked. Reset browser lock icons to restore banners of the Coach.
                </p>
              ) : permissionStatus === 'unsupported' ? (
                <p className="text-[10px] text-[var(--muted)] font-semibold leading-relaxed bg-white/5 p-2.5 rounded-xl">
                  Biometric push scheduler running locally inside react engine for extreme performance.
                </p>
              ) : (
                <button
                  onClick={requestPermission}
                  className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[var(--red)] to-amber-500 hover:brightness-115 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  Enable Push Notifications
                </button>
              )}

              {/* MOBILE INSTALLATION ASSIST */}
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex gap-2">
                <Smartphone size={13} className="text-indigo-300 shrink-0 mt-0.5" />
                <p className="text-[9.5px] text-white/90 leading-relaxed font-semibold">
                  Tap Mobile Browser <span className="text-indigo-300 font-bold">Add to Home Screen</span> for standalone native push triggers.
                </p>
              </div>

              {/* FORCE CACHE CLEAR & HARDFLUSH TROUBLESHOOT */}
              <div className="p-4 bg-neutral-900 border border-[var(--border)] rounded-[1.5rem] space-y-2.5">
                <div className="flex items-center gap-2">
                  <RefreshCw size={12} className="text-[var(--red)] animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="text-[9.5px] font-black uppercase text-white tracking-wider">Troubleshoot Version</span>
                </div>
                <p className="text-[9px] text-[var(--muted)] leading-relaxed font-semibold">
                  If the app did not update correctly after reinstalling on your phone, force clear browser caches and reload live assets.
                </p>
                <button
                  onClick={() => {
                    const confirmed = window.confirm("This will clear cached app screens and perform a high-speed hard reload to fetch the latest version. Proceed?");
                    if (confirmed) {
                      onForceUpdate();
                    }
                  }}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 active:scale-95 text-white font-black text-[9px] uppercase tracking-widest rounded-xl border border-white/5 transition-all cursor-pointer text-center"
                >
                  Force Purge Cache & Update
                </button>
              </div>
            </div>

            {/* PREFERENCES SCHEDULERS ROWS */}
            <div className="space-y-4">
              {/* WORKOUT */}
              <div className="p-4 bg-[var(--card2)] border border-[var(--border)] rounded-2xl space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Dumbbell size={15} className="text-[var(--red)]" />
                    <span className="text-xs font-black uppercase text-white tracking-wider">Workout Reminder</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={workoutReminder} 
                      onChange={(e) => {
                        triggerHaptic();
                        setWorkoutReminder(e.target.checked);
                      }}
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4.5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[var(--red)]" />
                  </label>
                </div>
                {workoutReminder && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="flex items-center justify-between gap-4 pt-1 border-t border-white/5"
                  >
                    <span className="text-[9px] text-[var(--muted)] font-black uppercase tracking-wider">Daily Target Hour</span>
                    <input 
                      type="time" 
                      value={workoutTime} 
                      onChange={(e) => setWorkoutTime(e.target.value)}
                      className="bg-black/40 border border-[var(--border)] rounded-lg px-2 py-0.5 text-xs text-white outline-none focus:border-[var(--red)] font-bold font-mono"
                    />
                  </motion.div>
                )}
                <button 
                  onClick={() => handleTestNotification('workout')}
                  className="w-full text-left text-[9px] font-black uppercase text-[var(--muted)] hover:text-white transition-colors flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Play size={8} /> Trigger Instant Preview
                </button>
              </div>

              {/* WATER */}
              <div className="p-4 bg-[var(--card2)] border border-[var(--border)] rounded-2xl space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Droplets size={15} className="text-blue-400" />
                    <span className="text-xs font-black uppercase text-white tracking-wider">Water Checkports</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={waterReminder} 
                      onChange={(e) => {
                        triggerHaptic();
                        setWaterReminder(e.target.checked);
                      }}
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4.5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-500" />
                  </label>
                </div>
                {waterReminder && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="flex items-center justify-between gap-4 pt-1 border-t border-white/5"
                  >
                    <span className="text-[9px] text-[var(--muted)] font-black uppercase tracking-wider">Interval Time</span>
                    <input 
                      type="time" 
                      value={waterTime} 
                      onChange={(e) => setWaterTime(e.target.value)}
                      className="bg-black/40 border border-[var(--border)] rounded-lg px-2 py-0.5 text-xs text-white outline-none focus:border-blue-500 font-bold font-mono"
                    />
                  </motion.div>
                )}
                <button 
                  onClick={() => handleTestNotification('water')}
                  className="w-full text-left text-[9px] font-black uppercase text-[var(--muted)] hover:text-white transition-colors flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Play size={8} /> Trigger Instant Preview
                </button>
              </div>

              {/* REST CARD */}
              <div className="p-4 bg-[var(--card2)] border border-[var(--border)] rounded-2xl space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Calendar size={15} className="text-yellow-400" />
                    <span className="text-xs font-black uppercase text-white tracking-wider">Rest Calibrators</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={restReminder} 
                      onChange={(e) => {
                        triggerHaptic();
                        setRestReminder(e.target.checked);
                      }}
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4.5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-yellow-500" />
                  </label>
                </div>
                {restReminder && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="flex items-center justify-between gap-4 pt-1 border-t border-white/5"
                  >
                    <span className="text-[9px] text-[var(--muted)] font-black uppercase tracking-wider">Schedule Rest</span>
                    <input 
                      type="time" 
                      value={restTime} 
                      onChange={(e) => setRestTime(e.target.value)}
                      className="bg-black/40 border border-[var(--border)] rounded-lg px-2 py-0.5 text-xs text-white outline-none focus:border-yellow-500 font-bold font-mono"
                    />
                  </motion.div>
                )}
                <button 
                  onClick={() => handleTestNotification('rest')}
                  className="w-full text-left text-[9px] font-black uppercase text-[var(--muted)] hover:text-white transition-colors flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Play size={8} /> Trigger Instant Preview
                </button>
              </div>
            </div>

            {/* PREFERENCE CONTROL FOOTER info alerts */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-2">
              <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[9.5px] text-white/90 leading-relaxed font-semibold">
                Privacy Policy: All push preferences remain strictly client-side. No cloud trackers activated.
              </p>
            </div>
          </div>
        )}

        {/* SETTINGS RULES SAVE ACTIONS */}
        {activeTab === 'settings' && (
          <div className="p-5 border-t border-[var(--border)] flex gap-3 bg-[var(--card)] shrink-0">
            <button
              onClick={() => {
                triggerHaptic();
                onClose();
              }}
              className="flex-1 py-3 border border-[var(--border)] text-white hover:bg-[var(--sub)] hover:border-white/10 active:scale-95 transition-all text-[9px] font-black uppercase tracking-widest rounded-xl cursor-pointer bg-[var(--card2)]"
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              className="flex-1 py-3 bg-[var(--red)] hover:brightness-110 active:scale-95 transition-all text-[9px] font-black uppercase tracking-widest rounded-xl text-white shadow-lg cursor-pointer"
            >
              Save Rules
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
