import { useState, useEffect, useCallback } from 'react';
import { MuscleGroup, Exercise, WorkoutEntry, UserProfile, PR, SleepEntry, DailyMission } from './types';
import { calculateStreak, cn } from './lib/utils';
import { QUOTES, TAMIL_QUOTES } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  LayoutDashboard, 
  Footprints, 
  Dumbbell, 
  Bot, 
  Droplets, 
  Trophy, 
  Calculator, 
  TrendingUp, 
  ClipboardList, 
  Home,
  Moon,
  Sun,
  Bell,
  Volume2,
  VolumeX,
  CheckCircle2,
  Flame,
  LogOut,
  User as UserIcon,
  ArrowRight,
  Activity,
  RefreshCcw,
  MonitorDown,
  Info,
  Brain,
  X,
  ShieldCheck
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import WorkoutLog from './components/WorkoutLog';
import MuscleVisualizer from './components/MuscleVisualizer';
import WorkoutExecution from './components/WorkoutExecution';
import AICoach from './components/AICoach';
import AICoachRobot from './components/AICoachRobot';
import StepTracker from './components/StepTracker';
import WaterTracker from './components/WaterTracker';
import SleepTracker from './components/SleepTracker';
import Planner from './components/Planner';
import BodyStats from './components/BodyStats';
import MuscleProgressCharts from './components/MuscleProgressCharts';
import HomeWorkout from './components/HomeWorkout';
import StructuredPlans from './components/StructuredPlans';
import ExerciseAnimations from './components/ExerciseAnimations';
import Logo from './components/common/Logo';
import NotificationSettings from './components/NotificationSettings';
import PostureCheck from './components/PostureCheck';
import SelfMastery from './components/SelfMastery';

function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[1000] bg-[#0a0a0a] flex flex-col items-center justify-center"
    >
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          filter: ["brightness(1) drop-shadow(0 0 10px rgba(255, 51, 51, 0.3))", "brightness(1.2) drop-shadow(0 0 25px rgba(255, 51, 51, 0.7))", "brightness(1) drop-shadow(0 0 10px rgba(255, 51, 51, 0.3))"]
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mb-8"
      >
        <img 
          src="https://res.cloudinary.com/df2ejdvcz/image/upload/v1778747229/logo_ihy7qo.jpg" 
          alt="Level Up Logo" 
          className="w-32 h-32 md:w-48 md:h-48 object-contain rounded-2xl"
        />
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl md:text-5xl font-black text-white italic tracking-wider uppercase mb-2"
      >
        LEVEL <span className="text-[var(--accent)]">UP</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[var(--muted)] text-sm font-bold uppercase tracking-[0.2em] mb-8"
      >
        Train. Transform. Dominate.
      </motion.p>
      
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest animate-pulse">Loading Beast Mode 😈</span>
      </div>
    </motion.div>
  );
}

function WelcomeScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--card2)_0%,_var(--bg)_100%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 max-w-md w-full text-center border-t-4 border-t-[var(--accent)]"
      >
        <Logo className="h-16 mx-auto mb-6" />
        <h1 className="font-display text-4xl font-black text-white italic tracking-wider uppercase mb-2">
          LEVEL <span className="text-[var(--accent)]">UP</span>
        </h1>
        <p className="text-[var(--muted)] text-sm font-bold uppercase tracking-[0.2em] mb-8">Enter your name to begin 💪</p>
        
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onStart(name.trim()); }} className="flex flex-col gap-4">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name..."
            className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-full px-6 py-4 text-white text-center focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all font-bold tracking-wider"
            required
          />
          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-[var(--accent)] text-white font-black font-display uppercase tracking-widest text-xl rounded-full py-4 shadow-[0_0_20px_var(--accent-glow)] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Start
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [sessionsSubTab, setSessionsSubTab] = useState<'male' | 'female' | 'home' | 'animations'>('animations');
  const [logsSubTab, setLogsSubTab] = useState<'training' | 'bmi'>('training');
  const [showAICoachModal, setShowAICoachModal] = useState(false);
  const [fabHovered, setFabHovered] = useState(false);

  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // This fires when the service worker controlling this page changes
        window.location.reload();
      });

      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    } else {
      window.location.reload();
    }
  };

  useEffect(() => {
    // Request notification permission and setup reminders
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;
      const today = new Date().toLocaleDateString('en-CA');
      const savedData = localStorage.getItem(`lv_data_${localStorage.getItem('username')}`);
      if (!savedData) return;
      
      const parsed = JSON.parse(savedData);
      const workoutData = parsed.workoutData || {};
      
      const hasWorkoutToday = workoutData[today] && workoutData[today].length > 0;
      
      if (!hasWorkoutToday) {
        const d = new Date();
        const day = d.getDay();
        const bodyTxt = day === 3 || day === 5 ? "😈 You can't skip leg day. Get up now!" : "💪 No excuses. Time to train!";
        
        new Notification("LEVEL UP FITNESS", {
          body: bodyTxt,
          icon: "https://res.cloudinary.com/df2ejdvcz/image/upload/v1778747229/logo_ihy7qo.jpg"
        });
      }
    };

    // Check reminders periodically if the app is open
    // Normally you'd do this via push notifications but for local PWA we check on open
    // or set a timeout for the evening
    const h = new Date().getHours();
    if (h >= 18 && h <= 20) {
      checkReminders();
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };
  
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [theme, setTheme] = useState(localStorage.getItem('lvTheme') || 'dark');
  const [tamilMode, setTamilMode] = useState(localStorage.getItem('lvTamilMode') === 'true');
  const [voiceOn, setVoiceOn] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');

  // App State
  const [workoutData, setWorkoutData] = useState<Record<string, WorkoutEntry[]>>({});
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '' });
  const [steps, setSteps] = useState<Record<string, number>>({});
  const [water, setWater] = useState<Record<string, number>>({});
  const [prs, setPrs] = useState<Record<string, PR>>({});
  const [sleep, setSleep] = useState<Record<string, SleepEntry>>({});
  
  // Gamification State
  const [xp, setXp] = useState<number>(0);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [showRewardBanner, setShowRewardBanner] = useState<{xp: number, message: string} | null>(null);

  // Smart Advanced States
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showPostureModal, setShowPostureModal] = useState(false);
  const [showChangeNameModal, setShowChangeNameModal] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelUpCelebration, setLevelUpCelebration] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type?: string }[]>([]);

  // Toast Creator Helper
  const addToast = useCallback((message: string, type: string = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // Level Progression Math Formulas
  const getLevelFromXp = (xpVal: number) => {
    if (xpVal < 100) return 1;
    if (xpVal < 250) return 2;
    if (xpVal < 450) return 3;
    if (xpVal < 700) return 4;
    return 5 + Math.floor((xpVal - 700) / 350);
  };

  const getXpInCurrentLevel = (xpVal: number) => {
    if (xpVal < 100) return xpVal;
    if (xpVal < 250) return xpVal - 100;
    if (xpVal < 450) return xpVal - 250;
    if (xpVal < 700) return xpVal - 450;
    if (xpVal < 1000) return xpVal - 700;
    return (xpVal - 1000) % 350;
  };

  // Active Workout State
  const [activeWorkout, setActiveWorkout] = useState<{ muscle: MuscleGroup; exercise: Exercise } | null>(null);
  const [showCompletion, setShowCompletion] = useState<{ duration: number; muscle: MuscleGroup; exercise: string } | null>(null);

  const today = new Date().toLocaleDateString('en-CA');

  // Load Initial Data
  useEffect(() => {
    if (!username) return;
    
    try {
      const savedData = localStorage.getItem(`lv_data_${username}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setWorkoutData(parsed.workoutData || {});
        setUserProfile(parsed.userProfile || { name: username, gender: 'male' });
        setSteps(parsed.steps || {});
        setWater(parsed.water || {});
        setPrs(parsed.prs || {});
        setSleep(parsed.sleep || {});
        
        let loadedXp = parsed.xp || 0;
        
        // Handle Missions
        if (parsed.missionsDate === today) {
          setMissions(parsed.missions || []);
        } else {
          // Generate new missions
          const newMissions: DailyMission[] = [
            { id: 'm1', text: 'Complete a workout session', completed: false, xpReward: 50 },
            { id: 'm2', text: 'Drink 2L+ of water', completed: false, xpReward: 20 },
            { id: 'm3', text: 'Hit 8000+ steps', completed: false, xpReward: 30 },
          ];
          setMissions(newMissions);
          
          if (parsed.missionsDate) {
             loadedXp += 10;
             setTimeout(() => setShowRewardBanner({ xp: 10, message: 'Daily Login Bonus!' }), 3000);
          }
        }
        setXp(loadedXp);
      } else {
        setUserProfile({ name: username, gender: 'male' });
        setMissions([
          { id: 'm1', text: 'Complete a workout session', completed: false, xpReward: 50 },
          { id: 'm2', text: 'Drink 2L+ of water', completed: false, xpReward: 20 },
          { id: 'm3', text: 'Hit 8000+ steps', completed: false, xpReward: 30 },
        ]);
      }
    } catch (e) {
      console.error('Failed to load data', e);
      setUserProfile({ name: username, gender: 'male' });
    }
  }, [username]);

  // Persist Data on Change
  useEffect(() => {
    if (!username) return;
    // Don't save if profile name is empty (initial state before load)
    if (!userProfile.name) return;
    
    const dataToSave = { 
      workoutData, userProfile, steps, water, prs, sleep, 
      xp, missions, missionsDate: today 
    };
    localStorage.setItem(`lv_data_${username}`, JSON.stringify(dataToSave));
  }, [username, workoutData, userProfile, steps, water, prs, sleep, xp, missions, today]);

  // Theme & Gender Effect
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.gender = userProfile.gender || 'male';
    document.documentElement.dataset.tamil = tamilMode ? 'true' : 'false';
    localStorage.setItem('lvTheme', theme);
    localStorage.setItem('lvTamilMode', String(tamilMode));
  }, [theme, userProfile.gender, tamilMode]);

  // Level-Up Threshold Progression & Toast Alert
  useEffect(() => {
    const computedLevel = getLevelFromXp(xp);
    try {
      localStorage.setItem('user-xp', String(xp));
    } catch (e) {}

    if (xp > 0 && computedLevel > currentLevel) {
      setCurrentLevel(computedLevel);
      setLevelUpCelebration(computedLevel);
      addToast(`🎉 LEVEL UP! You reached Level ${computedLevel}! You're getting stronger!`, 'success');
    } else {
      setCurrentLevel(computedLevel);
    }
  }, [xp, currentLevel]);

  // Greeting Effect
  useEffect(() => {
    if (userProfile.name) {
      if (tamilMode) {
        setGreeting(`Vanakkam 💪, ${userProfile.name}!`);
        setQuote(TAMIL_QUOTES[Math.floor(Math.random() * TAMIL_QUOTES.length)]);
      } else {
        const h = new Date().getHours();
        const g = h < 12 ? 'Good morning ☀️' : h < 17 ? 'Good afternoon 🌤️' : 'Good evening 🌙';
        setGreeting(`Vanakkam, ${g.toLowerCase()}, ${userProfile.name}! Let's crush it today.`);
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      }
    }
  }, [userProfile.name, tamilMode]);

  // Local notification reminder background scheduler
  useEffect(() => {
    const checkAndTriggerReminders = () => {
      try {
        let stored = localStorage.getItem('lv_notification_config');
        let config = {
          workoutReminder: true,
          workoutTime: '18:00',
          waterReminder: true,
          waterTime: '12:00',
          restReminder: false,
          restTime: '09:00'
        };
        
        if (stored) {
          config = JSON.parse(stored);
        } else {
          // Initialize defaults
          localStorage.setItem('lv_notification_config', JSON.stringify(config));
        }

        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const currentTimeString = `${currentHour}:${currentMinute}`;
        const todayStr = now.toLocaleDateString('en-CA');

        // Check already fired cache from localStorage to prevent multiple spawns in same minute
        const firedStored = localStorage.getItem('lv_notif_fired_log');
        let firedLog: Record<string, string[]> = firedStored ? JSON.parse(firedStored) : {};
        if (!firedLog[todayStr]) {
          firedLog = { [todayStr]: [] }; // Start fresh on new day
        }

        const firedToday = firedLog[todayStr];

        // 1. Workout Reminder
        if (config.workoutReminder && config.workoutTime === currentTimeString && !firedToday.includes('workout')) {
          firedToday.push('workout');
          const title = "🏋️ Workout Time!";
          const body = "Time to level up. Let's crash through today's exercises!";
          
          addToast(`🔔 ${title} - ${body}`, 'info');
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(title, { body, icon: "/favicon.ico" });
          }
        }

        // 2. Water Reminder
        if (config.waterReminder && config.waterTime === currentTimeString && !firedToday.includes('water')) {
          firedToday.push('water');
          const title = "💧 Hydration Check";
          const body = "Drink 250ml water now to protect muscle cell energy & protein synthesis!";
          
          addToast(`🔔 ${title} - ${body}`, 'info');
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(title, { body, icon: "/favicon.ico" });
          }
        }

        // 3. Rest Reminder
        if (config.restReminder && config.restTime === currentTimeString && !firedToday.includes('rest')) {
          firedToday.push('rest');
          const title = "🧘 Recovery System Check";
          const body = "It's time for some deep diaphragmatic breathing/stretching. Prioritize sleep!";
          
          addToast(`🔔 ${title} - ${body}`, 'info');
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(title, { body, icon: "/favicon.ico" });
          }
        }

        // Save updated fired list
        firedLog[todayStr] = firedToday;
        localStorage.setItem('lv_notif_fired_log', JSON.stringify(firedLog));
      } catch (err) {
        console.error("Local notification scheduler error:", err);
      }
    };

    // Run layout validation check immediately and every 30 seconds
    checkAndTriggerReminders();
    const interval = setInterval(checkAndTriggerReminders, 30000);
    return () => clearInterval(interval);
  }, [addToast]);

  const completeMission = (id: string, text: string, xpReward: number) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
    setXp(prev => prev + xpReward);
    setShowRewardBanner({ xp: xpReward, message: `Mission Complete: ${text}` });
    setTimeout(() => setShowRewardBanner(null), 3000);
  };
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleTamilMode = () => setTamilMode(prev => !prev);
  const toggleVoice = () => setVoiceOn(prev => !prev);

  const handleLogWorkout = async (entry: WorkoutEntry) => {
    // Check if this is a new PR
    const prKey = entry.exerciseName ? entry.exerciseName.toLowerCase() : entry.muscle;
    const currentPR = prs[prKey];
    const isNewPR = !currentPR || entry.weight > currentPR.weight;

    const entryWithMeta = { ...entry, date: today, time: new Date().toLocaleTimeString(), isPR: isNewPR };
    
    setWorkoutData(prev => {
      const currentDay = prev[today] || [];
      return { ...prev, [today]: [...currentDay, entryWithMeta] };
    });

    // 🔥 Gamification: XP Gain for Workouts
    let gainedXp = 50;
    if (entry.muscle === 'Legs' || entry.muscle === 'Hamstrings' || entry.muscle === 'Quadriceps' || entry.muscle === 'Glutes') {
      gainedXp += 50; // Leg day bonus 😈
    }
    
    setXp(prev => {
      const newXp = prev + gainedXp;
      return newXp;
    });
    
    if (isNewPR && entry.weight > 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff3b3b', '#ffd700', '#ffffff']
      });
      setShowRewardBanner({ xp: gainedXp, message: `NEW PERSONAL RECORD! ${entry.weight}KG 🔥` });
    } else {
      setShowRewardBanner({ xp: gainedXp, message: 'Exercise Complete!' });
    }
    
    setTimeout(() => setShowRewardBanner(null), 3000);

    // Update PRs if needed
    if (isNewPR && entry.weight > 0) {
      setPrs(prev => ({
        ...prev,
        [prKey]: { weight: entry.weight, reps: entry.reps, date: today }
      }));
    }
  };

  const handleLogSleep = async (entry: SleepEntry) => {
    setSleep(prev => ({ ...prev, [entry.date]: entry }));
  };

  const handleStepsChange = async (newSteps: number) => {
    setSteps(prev => ({ ...prev, [today]: newSteps }));
  };

  const handleWaterChange = async (newWater: number) => {
    setWater(prev => ({ ...prev, [today]: newWater }));
  };

  const handleProfileUpdate = async (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleDeleteWorkout = (date: string, index: number) => {
    setWorkoutData(prev => {
      const updatedList = [...(prev[date] || [])];
      updatedList.splice(index, 1);
      return { ...prev, [date]: updatedList };
    });
    addToast("🗑️ Logged entry successfully deleted.", "warning");
  };

  const handleEditWorkout = (date: string, index: number, updatedEntry: WorkoutEntry) => {
    setWorkoutData(prev => {
      const updatedList = [...(prev[date] || [])];
      updatedList[index] = updatedEntry;
      return { ...prev, [date]: updatedList };
    });
    addToast("✏️ Logged entry updated successfully.", "success");
  };

  const startGuidedWorkout = (muscle: MuscleGroup, exercise: Exercise) => {
    setActiveWorkout({ muscle, exercise });
  };

  const completeWorkout = (duration: number) => {
    if (!activeWorkout) return;
    
    const entry: WorkoutEntry = {
      muscle: activeWorkout.muscle,
      weight: 0, // BW
      reps: parseInt(activeWorkout.exercise.reps) || 0,
      sets: parseInt(activeWorkout.exercise.sets) || 0,
      notes: `Guided workout completed in ${Math.floor(duration / 60)}m ${duration % 60}s`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: today
    };
    
    handleLogWorkout(entry);
    setShowCompletion({ duration, muscle: activeWorkout.muscle, exercise: activeWorkout.exercise.name });
    setActiveWorkout(null);
  };

  const handleChangeName = () => {
    setNewNameInput(username || '');
    setShowChangeNameModal(true);
  };

  const handleSaveName = (nameToSave: string) => {
    const trimmed = nameToSave.trim();
    if (!trimmed) {
      addToast("⚠️ Name cannot be empty!", "error");
      return;
    }
    if (trimmed === username) {
      setShowChangeNameModal(false);
      return;
    }

    try {
      if (username) {
        // Rename localData cache key to prevent data loss
        const oldKey = `lv_data_${username}`;
        const newKey = `lv_data_${trimmed}`;
        const data = localStorage.getItem(oldKey);
        if (data) {
          localStorage.setItem(newKey, data);
          localStorage.removeItem(oldKey);
        }
      }

      // Save current username to global localStorage key
      localStorage.setItem('username', trimmed);

      // Update active state
      setUsername(trimmed);
      setUserProfile(prev => ({ ...prev, name: trimmed }));
      setShowChangeNameModal(false);
      addToast(`✏️ Profile name updated successfully to ${trimmed}!`, "success");
    } catch (e) {
      console.error("Failed to update profile name", e);
      addToast("⚠️ Failed to update profile name.", "error");
    }
  };

  const handleStartApp = (name: string) => {
    localStorage.setItem('username', name);
    setUsername(name);
  };

  const handleAddXp = (amount: number) => {
    setXp(prev => prev + amount);
  };

  const bottomTabs = [
    { id: 'logs', label: 'Logs', icon: ClipboardList },
    { id: 'stats', label: 'Stats', icon: Activity },
    { id: 'mastery', label: 'Self-Mastery', icon: ShieldCheck },
    { id: 'sessions', label: 'Sessions', icon: Home },
    { id: 'charts', label: 'Muscle Progress', icon: TrendingUp },
    { id: 'planner', label: 'AI Planner', icon: Brain },
  ];

  const streak = calculateStreak(workoutData);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!username) {
    return <WelcomeScreen onStart={handleStartApp} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Reward Notification Banner */}
      <AnimatePresence>
        {showRewardBanner && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -50, scale: 0.8, filter: "blur(10px)" }}
            className={cn(
              "fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-5 border backdrop-blur-xl",
              showRewardBanner.message.includes('PR') 
                ? "bg-gradient-to-br from-[var(--yellow)] to-amber-600 text-black border-amber-400/50 shadow-[0_20px_50px_rgba(251,191,36,0.4)]"
                : "bg-gradient-to-br from-[var(--card)] to-black text-white border-[var(--border)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner",
              showRewardBanner.message.includes('PR') ? "bg-black/20" : "bg-[var(--accent)]/20 text-[var(--accent)]"
            )}>
              {showRewardBanner.message.includes('PR') ? <Trophy size={28} /> : <Activity size={28} />}
            </div>
            <div className="flex flex-col">
              <div className={cn(
                "text-[10px] font-black uppercase tracking-[0.3em] mb-1",
                showRewardBanner.message.includes('PR') ? "text-black/60" : "text-[var(--accent)]"
              )}>
                {showRewardBanner.message.includes('PR') ? "Elite Achievement" : "Progress Logged"}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-black uppercase tracking-tight">{showRewardBanner.message}</span>
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  showRewardBanner.message.includes('PR') ? "bg-black/20" : "bg-white/10"
                )}>+{showRewardBanner.xp} XP</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showUpdate && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] bg-[var(--accent)] text-white px-6 py-4 rounded-full shadow-[0_0_20px_var(--accent-glow)] flex items-center gap-4 border border-white/20"
          >
            <div className="flex items-center gap-2 font-black tracking-widest uppercase">
              <Flame size={20} className="animate-pulse" />
              <span>🔥 New Update.</span>
            </div>
            <button 
              onClick={handleUpdate}
              className="bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full font-bold text-xs uppercase transition-colors"
            >
              Update Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-black via-[var(--card2)] to-black border-b border-[var(--border)] py-2 px-6 flex items-center gap-3 text-sm">
        <div className="w-2 h-2 rounded-full bg-[var(--green)] shadow-[0_0_10px_var(--green)] animate-pulse" />
        <div className="font-bold flex-1 text-xs sm:text-sm tracking-tight">{greeting}</div>
        <div className="text-[var(--muted)] italic text-[10px] uppercase font-black tracking-widest hidden lg:block overflow-hidden whitespace-nowrap text-ellipsis max-w-sm">{quote}</div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between py-4 px-6 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-[100] backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-2">
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-2 bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1.5 rounded-lg border border-[var(--accent)]/20 text-[10px] font-black uppercase tracking-widest animate-pulse hover:bg-[var(--accent)] hover:text-white transition-all"
            >
              Install App
            </button>
          )}
          <Logo onClick={() => setActiveTab('dashboard')} />
          <div className="flex items-center font-display text-2xl sm:text-3xl font-black italic tracking-wider uppercase ml-1.5 select-none leading-none">
            <span className="text-white">Level</span>
            <span className="text-[var(--red)]">Up</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2 bg-[var(--card)] px-4 py-2 rounded-xl border border-[var(--border)] shadow-sm group relative">
            <div className="w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
              <span className="text-[10px] font-black">{Math.floor(xp / 100) + 1}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] leading-none mb-0.5 mt-0.5">Lvl {Math.floor(xp / 100) + 1}</span>
              <div className="w-16 h-1 bg-[var(--sub)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent)]" style={{ width: `${xp % 100}%` }} />
              </div>
            </div>
          </div>
          {streak > 0 && (
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border shadow-lg animate-in zoom-in duration-500 hidden sm:flex", (workoutData[today] && workoutData[today].length > 0) ? "bg-[var(--red)]/10 border-[var(--red)]/20" : "bg-[var(--yellow)]/10 border-[var(--yellow)]/30")}>
                <Flame size={16} className={cn((workoutData[today] && workoutData[today].length > 0) ? "text-[var(--red)]" : "text-[var(--yellow)]", streak >= 4 ? "animate-pulse" : "", streak >= 8 ? "animate-bounce" : "")} />
                <div className="flex flex-col">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none", (workoutData[today] && workoutData[today].length > 0) ? "text-white" : "text-[var(--yellow)]")}>{streak} Day Streak</span>
                  {(!workoutData[today] || workoutData[today].length === 0) && (
                     <span className="text-[8px] font-bold text-[var(--yellow)] uppercase tracking-wider mt-0.5">⚠️ At Risk!</span>
                  )}
                </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowNotificationSettings(true)}
              className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm relative group"
              title="Smart Reminders"
            >
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--red)] rounded-full animate-pulse" />
            </button>
            <button 
              onClick={handleChangeName}
              className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm"
              title="Change Name"
            >
              <RefreshCcw size={16} />
            </button>
            <button 
              onClick={toggleVoice}
              className={cn(
                "p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] transition-all shadow-sm hidden sm:block",
                voiceOn ? "border-[var(--accent)] text-[var(--accent)]" : "hover:border-[var(--accent)]"
              )}
              title="Voice Assistant"
            >
              {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button 
              onClick={toggleTamilMode}
              className={cn(
                "p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] font-black text-xs transition-all shadow-sm",
                tamilMode ? "border-[var(--accent)] text-[var(--accent)]" : "hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--accent)]"
              )}
              title="Toggle Tamil Mode"
            >
              TA
            </button>
            <button 
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 p-4 sm:p-6 pb-28 sm:pb-32 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300"
        data-gender={
          activeTab === 'sessions' && sessionsSubTab === 'female' 
            ? 'female' 
            : userProfile.gender || 'male'
        }
      >
        {activeTab === 'sessions' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Switched Segmented Control */}
            <div className="flex justify-center">
              <div className="bg-[var(--card2)] p-1.5 rounded-2xl border border-[var(--border)] flex gap-1.5 w-full max-w-xl shadow-xl overflow-x-auto no-scrollbar">
                {(['male', 'female', 'home', 'animations'] as const).map((tab) => {
                  const isActive = sessionsSubTab === tab;
                  const isFemale = tab === 'female';
                  const isAnimations = tab === 'animations';
                  return (
                    <button
                      key={tab}
                      onClick={() => setSessionsSubTab(tab)}
                      className={cn(
                        "flex-1 py-3 px-2 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none whitespace-nowrap",
                        isActive
                          ? isFemale
                            ? "bg-[#ff69b4] text-white shadow-lg shadow-pink-500/20 active-glow"
                            : isAnimations
                              ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 active-glow"
                              : "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)] active-glow"
                          : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                      )}
                    >
                      {tab === 'male' && <UserIcon size={14} />}
                      {tab === 'female' && <UserIcon size={14} />}
                      {tab === 'home' && <Home size={14} />}
                      {tab === 'animations' && <Activity size={14} />}
                      {tab === 'male' && "Male Plan"}
                      {tab === 'female' && "Female Plan"}
                      {tab === 'home' && "Home Plan"}
                      {tab === 'animations' && "Motion Guides"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Posture Guard Quick Launch Banner */}
            <div className="flex justify-center px-4">
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 max-w-sm sm:max-w-md w-full p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Posture Guard</h4>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-0.5">Skeletal Calibration Beta</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPostureModal(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-display font-black text-[9px] uppercase tracking-widest text-white rounded-xl active:scale-95 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Postures Check
                </button>
              </div>
            </div>

            <div className="tab-content transition-all duration-300">
              {sessionsSubTab === 'male' && <StructuredPlans gender="male" />}
              {sessionsSubTab === 'female' && <StructuredPlans gender="female" />}
              {sessionsSubTab === 'home' && <HomeWorkout />}
              {sessionsSubTab === 'animations' && <ExerciseAnimations />}
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <MuscleProgressCharts data={workoutData} prs={prs} />
        )}

        {activeTab === 'planner' && (
          <Planner 
            userName={userProfile.name || 'Champion'} 
            onProfileUpdate={handleProfileUpdate}
            onAddXp={handleAddXp}
            triggerToast={(msg, type) => addToast(msg, type || 'info')}
          />
        )}

        {activeTab === 'mastery' && (
          <SelfMastery 
            onAddXp={handleAddXp}
            triggerToast={(msg, type) => addToast(msg, type || 'info')}
            hasWorkoutLoggedToday={!!(workoutData[today] && workoutData[today].length > 0)}
            waterIntakeLiters={(water[today] || 0) * 0.25}
          />
        )}

        {activeTab === 'stats' && (
          <Dashboard 
            data={workoutData} 
            profile={userProfile} 
            steps={steps} 
            water={water[today] || 0} 
            waterGoal={8} 
            missions={missions}
            completeMission={completeMission}
          />
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Switched Segmented Control for Logs */}
            <div className="flex justify-center">
              <div className="bg-[var(--card2)] p-1.5 rounded-2xl border border-[var(--border)] flex gap-1.5 w-full max-w-sm shadow-xl">
                <button
                  onClick={() => setLogsSubTab('training')}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none",
                    logsSubTab === 'training'
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)] active-glow"
                      : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                  )}
                >
                  <ClipboardList size={14} />
                  Training Log
                </button>
                <button
                  onClick={() => setLogsSubTab('bmi')}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none",
                    logsSubTab === 'bmi'
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)] active-glow"
                      : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                  )}
                >
                  <Calculator size={14} />
                  BMI Calculator
                </button>
              </div>
            </div>

            <div className="tab-content transition-all duration-300">
              {logsSubTab === 'training' && (
                <WorkoutLog 
                  onLog={handleLogWorkout} 
                  todayEntries={workoutData[today] || []} 
                  history={Object.values(workoutData).flat().reverse() as WorkoutEntry[]} 
                  prs={prs}
                  onDeleteEntry={handleDeleteWorkout}
                  onEditEntry={handleEditWorkout}
                  fullHistory={workoutData}
                />
              )}
              {logsSubTab === 'bmi' && (
                <BodyStats profile={userProfile} onUpdate={handleProfileUpdate} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) for AI Coach - Fully Interactive Rounded 3D Companion */}
      {username && !activeWorkout && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-[74px] right-2 sm:bottom-24 sm:right-6 z-[180] flex flex-col items-end cursor-pointer"
          onMouseEnter={() => setFabHovered(true)}
          onMouseLeave={() => setFabHovered(false)}
          onClick={() => setShowAICoachModal(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9, y: 2 }}
          transition={{ type: "spring", stiffness: 350, damping: 14 }}
        >
          <div className="relative group p-2">
            <span className="absolute inset-x-4 inset-y-4 rounded-full bg-[var(--accent)]/10 animate-ping opacity-25 pointer-events-none" />
            <AICoachRobot 
              mode={fabHovered ? 'greeting' : 'idle'} 
              size={105} 
              showSpeechBubble={fabHovered}
              speechText="Coach Ready! 💪"
            />
          </div>
        </motion.div>
      )}

      {/* Floating AI Coach Modal */}
      <AnimatePresence>
        {showAICoachModal && (
          <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center sm:justify-end sm:p-6 bg-black/80 backdrop-blur-sm">
            {/* Backdrop Closer */}
            <div className="absolute inset-0" onClick={() => setShowAICoachModal(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-3xl h-[85vh] sm:h-[650px] bg-[var(--bg)] rounded-t-[2.5rem] sm:rounded-[2rem] border-t sm:border border-[var(--border)] shadow-2xl relative overflow-hidden flex flex-col z-[510]"
            >
              <button
                onClick={() => setShowAICoachModal(false)}
                className="absolute top-5 right-5 z-[550] p-2.5 rounded-2xl bg-[var(--card2)] hover:bg-[var(--border)] text-[var(--muted)] hover:text-white border border-[var(--border)] active:scale-95 transition-all cursor-pointer shadow-md"
                title="Close AI Coach"
              >
                <X size={18} />
              </button>
              <div className="flex-1 overflow-hidden h-full">
                <AICoach 
                  userName={userProfile.name || 'Champion'} 
                  userProfile={userProfile} 
                  workoutData={workoutData} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Fixed Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[190] bg-[var(--card2)]/90 backdrop-blur-md border-t border-[var(--border)] py-1.5 pb-safe px-4 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.6)] flex justify-around items-center">
        {bottomTabs.map(tab => {
          const isActive = activeTab === tab.id;
          const isFemale = activeTab === 'sessions' && sessionsSubTab === 'female';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-1 text-center text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 relative cursor-pointer active:scale-95 group",
                isActive 
                  ? isFemale 
                    ? "text-[#ff69b4] drop-shadow-[0_0_8px_rgba(255,105,180,0.4)]"
                    : "text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-glow)]" 
                  : "text-[var(--muted)] hover:text-white"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300 mb-0.5 flex items-center justify-center",
                isActive 
                  ? isFemale 
                    ? "bg-[#ff69b4]/10"
                    : "bg-[var(--accent)]/10" 
                  : "group-hover:bg-white/5"
              )}>
                <tab.icon size={18} className={cn(isActive && "scale-110", "transition-transform duration-300")} />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold tracking-tight whitespace-nowrap">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeBottomTabGlow"
                  className={cn(
                    "absolute bottom-0 h-[3px] w-6 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                    isFemale ? "bg-[#ff69b4]" : "bg-[var(--accent)]"
                  )}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Guided Workout Overlay */}
      {activeWorkout && (
        <WorkoutExecution 
          muscle={activeWorkout.muscle} 
          exercise={activeWorkout.exercise} 
          onComplete={completeWorkout} 
          onCancel={() => setActiveWorkout(null)} 
        />
      )}

      <footer className="p-4 text-center text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest border-t border-[var(--border)] mt-5 pb-24">
        LEVELUP ⚡ Data saved locally • Every day adds a new link to your chain
      </footer>
      <AnimatePresence>
        {showCompletion && (
           <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-[var(--card)] border-2 border-[var(--accent)] rounded-[40px] p-8 max-w-md w-full shadow-[0_0_50px_rgba(var(--accent-rgb),0.3)] text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-[var(--accent)]" />
                <div className="text-6xl mb-6">🏆</div>
                <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-wider mb-2">Session Complete!</h2>
                <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] mb-8 italic">Elite level performance reached</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-[var(--sub)] p-4 rounded-3xl border border-[var(--border)]">
                      <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Duration</div>
                      <div className="text-2xl font-display font-black text-[var(--accent)] italic">
                        {Math.floor(showCompletion.duration / 60)}:{(showCompletion.duration % 60).toString().padStart(2, '0')}
                      </div>
                   </div>
                   <div className="bg-[var(--sub)] p-4 rounded-3xl border border-[var(--border)]">
                      <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Target</div>
                      <div className="text-2xl font-display font-black text-[var(--yellow)] italic uppercase">{showCompletion.muscle}</div>
                   </div>
                </div>

                <div className="bg-black/20 p-5 rounded-3xl border border-[var(--border)] mb-8">
                   <div className="text-xs font-bold text-white mb-1">"{showCompletion.exercise}"</div>
                   <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Logged & Registered</div>
                </div>

                <button 
                  onClick={() => setShowCompletion(null)}
                  className="w-full py-4 rounded-2xl bg-[var(--accent)] text-white font-display font-black text-xl uppercase tracking-widest shadow-xl shadow-[var(--accent-glow)] hover:brightness-110 active:scale-95 transition-all"
                >
                  Confirm & Close
                </button>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Advanced Overlay Modals */}
      <AnimatePresence>
        {showNotificationSettings && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md"
            >
              <NotificationSettings 
                onClose={() => setShowNotificationSettings(false)} 
                triggerToast={addToast} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPostureModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full max-w-4xl"
            >
              <PostureCheck 
                onClose={() => setShowPostureModal(false)} 
                activeExercise={activeWorkout ? activeWorkout.exercise.name : 'Squat'} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChangeNameModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Top boundary accent colored line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />
              
              <button
                onClick={() => setShowChangeNameModal(false)}
                className="absolute top-4 right-4 p-2.5 rounded-xl bg-[var(--card2)] hover:bg-[var(--border)] text-[var(--muted)] hover:text-white transition-all cursor-pointer border border-[var(--border)]"
                title="Close"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-5 mt-2">
                <div className="w-10 h-10 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl flex items-center justify-center">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-display font-black text-white uppercase tracking-tight">Edit Profile Name</h3>
                  <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">Change your screen name without resetting data</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">DisplayName / Username</label>
                  <input
                    type="text"
                    value={newNameInput}
                    onChange={(e) => setNewNameInput(e.target.value)}
                    placeholder="Enter name..."
                    className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--accent)] transition-all font-bold tracking-wide"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveName(newNameInput);
                      }
                    }}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowChangeNameModal(false)}
                    className="flex-1 py-3 bg-[var(--card2)] hover:bg-[var(--border)] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer border border-[var(--border)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveName(newNameInput)}
                    className="flex-1 py-3 bg-[var(--accent)] hover:brightness-110 text-white font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-[var(--accent-glow)]"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast Alert Toaster Container */}
      <div className="fixed top-6 right-6 z-[999] max-w-sm w-full space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className={cn(
                "p-4 rounded-2xl border backdrop-blur-lg flex items-start gap-3 shadow-xl pointer-events-auto cursor-pointer",
                toast.type === 'success' 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" 
                  : toast.type === 'warning'
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-300"
              )}
            >
              <div className="text-xs font-bold leading-relaxed">{toast.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Level Up Celebration Card overlay */}
      <AnimatePresence>
        {levelUpCelebration && (
          <div className="fixed inset-0 z-[800] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 100 }}
              className="bg-gradient-to-b from-[var(--card2)] to-black border-2 border-yellow-400 p-8 rounded-[3rem] text-center max-w-sm w-full shadow-[0_0_50px_rgba(234,179,8,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400" />
              <div className="text-6xl mb-6 animate-bounce">⚡🎉</div>
              <h1 className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 uppercase tracking-tighter">LVL {levelUpCelebration} REACHED!</h1>
              <div className="text-[10px] font-black uppercase text-[var(--muted)] tracking-[0.3em] mt-1">Biochemical Limit Shattered</div>
              
              <p className="text-xs text-white/95 leading-relaxed mt-6 max-w-xs mx-auto">
                Sensational effort! Your body mass, sets, and rep totals have successfully compiled past the threshold.
              </p>

              <div className="my-8 p-4 bg-white/5 border border-white/10 rounded-2xl text-left space-y-2">
                <div className="text-[9px] font-black uppercase text-yellow-400 tracking-wider">UNLOCKED REWARDS & PERKS:</div>
                <div className="text-xs text-white/90 font-bold flex items-center gap-2">🟢 +150 Daily Goal Boost Multiplier</div>
                <div className="text-xs text-white/90 font-bold flex items-center gap-2">🟢 Muscle Symmetry Sensor Access</div>
                <div className="text-xs text-white/90 font-bold flex items-center gap-2">🟢 Elite Coach Badge Highlight</div>
              </div>

              <button
                onClick={() => setLevelUpCelebration(null)}
                className="w-full py-4 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-display font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-yellow-400/20 active:scale-95"
              >
                Acknowledge Promotion
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
