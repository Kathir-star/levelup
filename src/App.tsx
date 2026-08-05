import { useState, useEffect, useCallback } from 'react';
import { MuscleGroup, Exercise, WorkoutEntry, UserProfile, PR, SleepEntry, DailyMission } from './types';
import { calculateStreak, cn } from './lib/utils';
import { QUOTES, TAMIL_QUOTES } from './constants';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import VoiceButton from './components/VoiceButton';
import { ALL_50_EXERCISES } from './components/ExercisePromptLibrary';
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
  ShieldCheck,
  Award
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
import SelfMastery from './components/SelfMastery';
import StreakBadge from './components/StreakBadge';
import FitnessChallenges from './components/FitnessChallenges';
import {
  UserChallenge,
  getInitialUserChallenges,
  fetchUserChallengesFromSupabase,
  getTodaySugarLog,
  evaluateAndUpdateChallenges
} from './lib/challenges';
import { calculate7DayMuscleFrequency } from './lib/supabase';



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

const CURRENT_VERSION = "1.1.0";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateDetails, setUpdateDetails] = useState<{ version: string; message: string } | null>(null);
  const [isUpdateModalDelayed, setIsUpdateModalDelayed] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [sessionUid, setSessionUid] = useState<string | null>(localStorage.getItem('lv_session_uid'));
  const [activeWorkout, setActiveWorkout] = useState<{ muscle: MuscleGroup; exercise: Exercise } | null>(null);
  const [showCompletion, setShowCompletion] = useState<{ duration: number; muscle: MuscleGroup; exercise: string } | null>(null);
  const [sessionsSubTab, setSessionsSubTab] = useState<'male' | 'female' | 'home' | 'animations'>('animations');
  const [animationsCategory, setAnimationsCategory] = useState<'ALL' | 'PUSH' | 'PULL' | 'LEGS' | 'CORE' | 'MOBILITY' | 'CARDIO'>('ALL');
  const [logsSubTab, setLogsSubTab] = useState<'training' | 'heatmap' | 'challenges' | 'bmi'>('training');
  const [showAICoachModal, setShowAICoachModal] = useState(false);
  const [fabHovered, setFabHovered] = useState(false);
  const [jarvisEnabled, setJarvisEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('lvl_jarvis_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('lvl_jarvis_enabled', String(jarvisEnabled));
  }, [jarvisEnabled]);

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
                setUpdateDetails({
                  version: "1.1.0",
                  message: "Service Worker cache update found. Click Update to apply new workout telemetry."
                });
              }
            });
          }
        });
      });
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const forceUpdateApp = async () => {
    addToast("🔄 Initiating high-speed cache purge...", "success");
    
    // Clear browser Cache Storage
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      } catch (err) {
        console.warn("Failed to delete caches:", err);
      }
    }

    // Command SW to Skip Waiting
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      } catch (err) {
        console.warn("Failed signaling SW skip waiting:", err);
      }
    }

    // Force hard reload with cache buster
    setTimeout(() => {
      window.location.href = window.location.origin + '?v=' + Date.now();
    }, 1000);
  };

  const setupPushNotifications = async () => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      // Small delayed trigger to prompt user after engagement
      setTimeout(async () => {
        try {
          const result = await Notification.requestPermission();
          if (result === 'granted') {
            addToast("🔔 Push updates configured!", "success");
          }
        } catch (err) {
          console.warn("Notification request failed or restricted in environment:", err);
        }
      }, 5000);
    }
  };

  const isVersionNewer = (latest: string, current: string): boolean => {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);
    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const l = latestParts[i] || 0;
      const c = currentParts[i] || 0;
      if (l > c) return true;
      if (l < c) return false;
    }
    return false;
  };

  const checkVersionUpdate = useCallback(async () => {
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      if (data && data.version) {
        if (isVersionNewer(data.version, CURRENT_VERSION)) {
          setUpdateDetails(data);
        }
      }
    } catch (err) {
      console.log("Failsafe: version check skipped or offline:", err);
    }
  }, []);

  const [isUpdateDismissed, setIsUpdateDismissed] = useState(false);

  // 1. Local user session sync & notification setup on land
  useEffect(() => {
    let uid = localStorage.getItem('lv_session_uid');
    if (!uid) {
      uid = 'local-user-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('lv_session_uid', uid);
    }
    setSessionUid(uid);
    console.log("Local session secured. Sync complete:", uid);
    setupPushNotifications();
  }, []);

  // 2. Initial version check & interval scheduler (every 12 minutes)
  useEffect(() => {
    checkVersionUpdate();

    const interval = setInterval(() => {
      checkVersionUpdate();
    }, 720000); // 12 minutes

    return () => clearInterval(interval);
  }, [checkVersionUpdate]);

  // 3. Delayed update trigger if within active workout session
  useEffect(() => {
    if (updateDetails) {
      if (activeWorkout) {
        setIsUpdateModalDelayed(true);
      } else {
        if (!isUpdateDismissed) {
          setShowUpdateModal(true);
          setIsUpdateModalDelayed(false);
        }
      }
    }
  }, [updateDetails, activeWorkout, isUpdateDismissed]);

  // 4. URL flag & Service Worker forced events listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('update') === 'true' || params.get('trigger_update') === 'true') {
      setUpdateDetails({
        version: "1.2.0",
        message: "New version available! Slashed weight records, added advanced sleep graphs and hydrated water interval logs."
      });
    }

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'TRIGGER_FORCE_UPDATE') {
        setUpdateDetails({
          version: "1.2.0",
          message: "A new background update was received. Please update to see the latest workouts!"
        });
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);


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
  
  // Fitness Challenges & Milestones State
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>(() => getInitialUserChallenges());
  const [sugarConsumedToday, setSugarConsumedToday] = useState<boolean | null>(() => getTodaySugarLog(today));
  const [latestPRLogged, setLatestPRLogged] = useState<boolean>(false);

  // Gamification State
  const [xp, setXp] = useState<number>(0);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [showRewardBanner, setShowRewardBanner] = useState<{xp: number, message: string} | null>(null);

  // Smart Advanced States
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
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

  const today = new Date().toLocaleDateString('en-CA');

  // Session Notifications Database Initialization
  const initSessionNotifications = useCallback(() => {
    try {
      const existing = localStorage.getItem('lv_session_notifications');
      if (!existing) {
        const nowMs = Date.now();
        const fallback = [
          {
            id: "sn_1",
            title: "🏆 Level up Champion!",
            description: "Congratulations on starting your fitness biometric journey! Complete daily goals to unlock Level 2.",
            timestamp: new Date(nowMs - 15 * 60 * 1000).toISOString(), // 15m ago
            status: "Completed",
            type: "level"
          },
          {
            id: "sn_2",
            title: "💧 Biometric Hydration Rule Set",
            description: "Optimal cellular hydration targets generated: standard 250ml intervals active before training.",
            timestamp: new Date(nowMs - 65 * 60 * 1000).toISOString(), // 1h ago
            status: "Completed",
            type: "water"
          },
          {
            id: "sn_3",
            title: "🏋️ Daily Workout Mission Configured",
            description: "Action plan synchronized. Complete your home workout checklist today to protect your streak.",
            timestamp: new Date(nowMs - 180 * 60 * 1000).toISOString(), // 3h ago
            status: "Pending",
            type: "workout"
          },
          {
            id: "sn_4",
            title: "🧘 Postural Symmetry Auditor On",
            description: "Push-pull kinetic metrics active. The coach is tracking your muscle ratios.",
            timestamp: new Date(nowMs - 300 * 60 * 1000).toISOString(), // 5h ago
            status: "Completed",
            type: "coaching"
          },
          {
            id: "sn_5",
            title: "🔒 Biometric Data Sandbox Encrypted",
            description: "Personal metrics isolated. All biometric sessions remain in physical local browser memory.",
            timestamp: new Date(nowMs - 450 * 60 * 1000).toISOString(), // 7h ago
            status: "Completed",
            type: "system"
          }
        ];
        localStorage.setItem('lv_session_notifications', JSON.stringify(fallback));
      }
    } catch (e) {
      console.error("Failed to seed session notifications", e);
    }
  }, []);

  const addSessionNotification = useCallback((
    title: string,
    description: string,
    type: 'workout' | 'water' | 'level' | 'coaching' | 'system',
    status: 'Completed' | 'Pending' = 'Completed'
  ) => {
    try {
      const stored = localStorage.getItem('lv_session_notifications');
      const list = stored ? JSON.parse(stored) : [];
      const newItem = {
        id: "sn_" + Date.now().toString() + Math.random().toString(36).substring(2, 6),
        title,
        description,
        timestamp: new Date().toISOString(),
        status,
        type
      };
      
      const updated = [newItem, ...list];
      localStorage.setItem('lv_session_notifications', JSON.stringify(updated));
      
      // Dispatch alert updates
      window.dispatchEvent(new Event('lv_session_notifications_updated'));
    } catch (e) {
      console.error("Failed to add session notification", e);
    }
  }, []);

  // Load Initial Data
  useEffect(() => {
    if (!username) return;
    
    try {
      initSessionNotifications();
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
      addSessionNotification(
        "🏆 Level Up Achieved!",
        `Amazing work! You successfully progressed to Level ${computedLevel}. Keep up the high intensity splits!`,
        "level"
      );
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

  // Fetch user challenges from Supabase on profile load
  useEffect(() => {
    fetchUserChallengesFromSupabase(userProfile.name || 'local_user').then((data) => {
      if (data && data.length > 0) {
        setUserChallenges(data);
      }
    });
  }, [userProfile.name]);

  // Evaluate & sync challenge progress across daily inputs
  useEffect(() => {
    if (!userChallenges || userChallenges.length === 0) return;
    const result = evaluateAndUpdateChallenges({
      userChallenges,
      today,
      workoutData,
      stepsToday: steps[today] || 0,
      waterToday: water[today] || 0,
      sugarConsumedToday,
      isPRLoggedToday: latestPRLogged,
      waterGoal: 3000
    });

    if (result.hasChanges) {
      setUserChallenges(result.updatedChallenges);
      if (result.completedChallengeName) {
        addToast(`🏆 Challenge Mastered: ${result.completedChallengeName}! (+250 XP)`, "success");
        setXp(prev => prev + 250);
      }
    }
  }, [workoutData, steps, water, sugarConsumedToday, latestPRLogged, today]);

  const handleSyncChallenges = useCallback(async () => {
    const fresh = await fetchUserChallengesFromSupabase(userProfile.name || 'local_user');
    const result = evaluateAndUpdateChallenges({
      userChallenges: fresh,
      today,
      workoutData,
      stepsToday: steps[today] || 0,
      waterToday: water[today] || 0,
      sugarConsumedToday,
      isPRLoggedToday: latestPRLogged,
      waterGoal: 3000
    });
    setUserChallenges(result.updatedChallenges);
    addToast("🔄 Challenge progress resynced with latest metrics.", "info");
  }, [userProfile.name, today, workoutData, steps, water, sugarConsumedToday, latestPRLogged, addToast]);


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
          addSessionNotification(title, body, "workout", "Pending");
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
          addSessionNotification(title, body, "water", "Pending");
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
          addSessionNotification(title, body, "coaching", "Pending");
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
  }, [addToast, addSessionNotification]);

  const completeMission = (id: string, text: string, xpReward: number) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
    setXp(prev => prev + xpReward);
    setShowRewardBanner({ xp: xpReward, message: `Mission Complete: ${text}` });
    addSessionNotification(
      "🎯 Daily Mission Completed",
      `Completed mission '${text}'! claimed +${xpReward} XP reward bonus.`,
      "level",
      "Completed"
    );
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
      addSessionNotification(
        "🔥 New Strength PR Reached!",
        `Outstanding! Reached a new Personal Record for ${entry.exerciseName || entry.muscle} of ${entry.weight}kg!`,
        "level"
      );
    } else {
      setShowRewardBanner({ xp: gainedXp, message: 'Exercise Complete!' });
    }
    
    addSessionNotification(
      "🏋️ Workout Session Registered",
      `Successfully logged set: ${entry.reps} reps of ${entry.exerciseName || entry.muscle} at ${entry.weight}kg (+${gainedXp} XP).`,
      "workout"
    );
    
    setTimeout(() => setShowRewardBanner(null), 3000);

    // Update PRs if needed
    if (isNewPR && entry.weight > 0) {
      setLatestPRLogged(true);
      setPrs(prev => ({
        ...prev,
        [prKey]: { weight: entry.weight, reps: entry.reps, date: today }
      }));
    }
  };

  const handleLogSleep = async (entry: SleepEntry) => {
    setSleep(prev => ({ ...prev, [entry.date]: entry }));
    addSessionNotification(
      "😴 Sleep Diagnostics Tracked",
      `Saved overnight sleep metrics: ${entry.hours} hours. Sleep depth quality scored at ${entry.quality}%.`,
      "coaching"
    );
  };

  const handleStepsChange = async (newSteps: number) => {
    setSteps(prev => ({ ...prev, [today]: newSteps }));
    addSessionNotification(
      "🚶 Daily Activity Synchronized",
      `Total steps for today updated to ${newSteps}. Cellular kinetic calorie targets advancing.`,
      "system"
    );
  };

  const handleWaterChange = async (newWater: number) => {
    setWater(prev => ({ ...prev, [today]: newWater }));
    addSessionNotification(
      "💧 Hydration Volume Updated",
      `Logged water: Daily volume is now ${newWater}ml. Cell hydration threshold stabilized.`,
      "water"
    );
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

  const startVoiceWorkout = (muscle: MuscleGroup) => {
    const exerciseSpec = ALL_50_EXERCISES.find(ex => 
      ex.targetMuscles.some((m: string) => m.toLowerCase() === muscle.toLowerCase()) ||
      ex.category.toLowerCase() === muscle.toLowerCase()
    ) || ALL_50_EXERCISES[0];

    const exercise: Exercise = {
      name: exerciseSpec.name,
      sets: "3",
      reps: "12",
      rest: "45s",
      intensity: "beginner",
      image: "",
      notes: "Voice initiated guided workout"
    };

    startGuidedWorkout(muscle, exercise);
    addToast(`🏋️ Starting voice workout: ${exercise.name}!`, "success");
  };

  const addVoiceCalories = (amount: number) => {
    const entry: WorkoutEntry = {
      muscle: 'Full Body',
      exerciseName: 'Nutrition Entry',
      weight: 0,
      reps: 0,
      sets: 0,
      notes: `Logged ${amount} calories via Jarvis Voice Coach`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: today
    };
    handleLogWorkout(entry);
    addToast(`🍎 Logged nutrition entry: +${amount} calories!`, "success");
  };

  const addVoiceWater = (amount: number) => {
    const todayWater = water[today] || 0;
    const newWater = todayWater + amount;
    handleWaterChange(newWater);
    addToast(`💧 Hydration update: +${amount}ml!`, "success");
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
    { id: 'stats', label: 'Dashboard', icon: Activity },
    { id: 'mastery', label: 'Self-Mastery', icon: ShieldCheck },
    { id: 'sessions', label: 'Sessions', icon: Home },
    { id: 'charts', label: 'Earn Growth', icon: TrendingUp },
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
        {showUpdateModal && updateDetails && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,51,51,0.15)] overflow-hidden relative"
            >
              <div className="w-14 h-14 bg-[var(--red)]/10 text-[var(--red)] rounded-2xl flex items-center justify-center mb-6">
                <Flame size={28} className="animate-pulse text-[var(--red)]" />
              </div>
              
              <h3 className="text-xl font-black text-white tracking-tight uppercase">🚀 Update Available</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed mt-4 font-semibold">
                {updateDetails.message || "New features, better performance, and improved workouts available."}
              </p>

              <div className="mt-5 p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between font-mono text-[9px]">
                <span className="text-[var(--muted)]">CURRENT VERSION:</span>
                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">v{CURRENT_VERSION}</span>
              </div>
              
              <div className="p-3 bg-[var(--red)]/5 border border-[var(--red)]/10 rounded-xl flex items-center justify-between font-mono text-[9px] mt-2">
                <span className="text-[var(--red)] font-black">LATEST VERSION:</span>
                <span className="font-bold text-white bg-[var(--red)]/20 text-[var(--red)] px-2 py-0.5 rounded">v{updateDetails.version}</span>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setIsUpdateDismissed(true);
                    setShowUpdateModal(false);
                    addToast("Update postponed. Finish your session!", "info");
                  }}
                  className="flex-1 py-4 border border-[var(--border)] bg-[#111111] hover:bg-neutral-900 text-[var(--muted)] hover:text-white font-display font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Later
                </button>
                <button
                  onClick={forceUpdateApp}
                  className="flex-1 py-4 bg-[var(--red)] hover:brightness-110 text-white font-display font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-[var(--red)]/15 active:scale-95"
                >
                  Update Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-[100] backdrop-blur-md bg-[var(--bg)] bg-opacity-95 border-b border-[var(--border)]">
        {/* Top Greeting Bar */}
        <div className="bg-black/30 border-b border-white/[0.02]">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-1.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] shadow-[0_0_8px_var(--green)] animate-pulse shrink-0" />
              <div className="font-extrabold text-[11px] sm:text-xs text-white/90 tracking-tight leading-none">{greeting}</div>
            </div>
            <div className="text-[var(--muted)] italic text-[9px] uppercase font-black tracking-widest hidden lg:block overflow-hidden whitespace-nowrap text-ellipsis max-w-sm">
              {quote}
            </div>
          </div>
        </div>

        {/* Main Brand & Controls Header */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 flex items-center justify-between gap-3 flex-wrap">
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
            <div className="flex items-center font-display text-xl sm:text-2xl font-black italic tracking-wider uppercase ml-1 select-none leading-none">
              <span className="text-white">Level</span>
              <span className="text-[var(--red)]">Up</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-1.5 bg-[var(--card)] px-2.5 py-1.5 rounded-xl border border-[var(--border)] shadow-sm group relative">
              <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                <span className="text-[9px] font-black">{Math.floor(xp / 100) + 1}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] leading-none mb-0.5">Lvl {Math.floor(xp / 100) + 1}</span>
                <div className="w-12 h-1 bg-[var(--sub)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent)]" style={{ width: `${xp % 100}%` }} />
                </div>
              </div>
            </div>
            {streak > 0 && (
              <StreakBadge
                streak={streak}
                isPR={latestPRLogged}
                hasTrainedToday={!!(workoutData[today] && workoutData[today].length > 0)}
                className="hidden sm:inline-flex"
              />
            )}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowNotificationSettings(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm relative group flex items-center justify-center shrink-0 cursor-pointer"
                title="Smart Reminders"
              >
                <Bell size={14} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--red)] rounded-full animate-pulse" />
              </button>
              <button 
                onClick={handleChangeName}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm flex items-center justify-center shrink-0 cursor-pointer"
                title="Change Name"
              >
                <RefreshCcw size={14} />
              </button>
              <button 
                onClick={() => setJarvisEnabled(!jarvisEnabled)}
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all shadow-sm flex items-center justify-center shrink-0 cursor-pointer border",
                  jarvisEnabled 
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]" 
                    : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                )}
                title={jarvisEnabled ? "Disable Jarvis AI Coach" : "Enable Jarvis AI Coach"}
              >
                <Brain size={14} className={jarvisEnabled ? "animate-pulse text-cyan-400" : ""} />
              </button>
              <button 
                onClick={toggleVoice}
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--card)] border border-[var(--border)] transition-all shadow-sm hidden sm:flex items-center justify-center shrink-0 cursor-pointer",
                  voiceOn ? "border-[var(--accent)] text-[var(--accent)]" : "hover:border-[var(--accent)]"
                )}
                title="Voice Assistant"
              >
                {voiceOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              <button 
                onClick={toggleTamilMode}
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--card)] border border-[var(--border)] font-black text-[9px] sm:text-[10px] transition-all shadow-sm flex items-center justify-center shrink-0 cursor-pointer",
                  tamilMode ? "border-[var(--accent)] text-[var(--accent)]" : "hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--accent)]"
                )}
                title="Toggle Tamil Mode"
              >
                TA
              </button>
              <button 
                onClick={toggleTheme}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm flex items-center justify-center shrink-0 cursor-pointer"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-3 pb-[calc(56px+env(safe-area-inset-bottom))] animate-in fade-in slide-in-from-bottom-2 duration-300"
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

            <div className="tab-content transition-all duration-300">
              {sessionsSubTab === 'male' && <StructuredPlans gender="male" />}
              {sessionsSubTab === 'female' && <StructuredPlans gender="female" />}
              {sessionsSubTab === 'home' && <HomeWorkout />}
              {sessionsSubTab === 'animations' && (
                <ExerciseAnimations 
                  initialCategory={animationsCategory} 
                  onCategoryChange={setAnimationsCategory} 
                />
              )}
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
            setActiveTab={setActiveTab}
            setSessionsSubTab={setSessionsSubTab}
            setAnimationsCategory={setAnimationsCategory}
            onAddXp={handleAddXp}
            triggerToast={(msg, type) => addToast(msg, type || 'info')}
          />
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Switched Segmented Control for Logs */}
            <div className="flex justify-center">
              <div className="bg-[var(--card2)] p-1.5 rounded-2xl border border-[var(--border)] flex gap-1.5 w-full max-w-lg shadow-xl overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setLogsSubTab('training')}
                  className={cn(
                    "flex-1 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none whitespace-nowrap",
                    logsSubTab === 'training'
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)] active-glow"
                      : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                  )}
                >
                  <ClipboardList size={14} />
                  Training Log
                </button>
                <button
                  onClick={() => setLogsSubTab('heatmap')}
                  className={cn(
                    "flex-1 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none whitespace-nowrap",
                    logsSubTab === 'heatmap'
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)] active-glow"
                      : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                  )}
                >
                  <Activity size={14} />
                  Heatmap
                </button>
                <button
                  onClick={() => setLogsSubTab('challenges')}
                  className={cn(
                    "flex-1 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none whitespace-nowrap",
                    logsSubTab === 'challenges'
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)] active-glow"
                      : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                  )}
                >
                  <Award size={14} />
                  Challenges
                </button>
                <button
                  onClick={() => setLogsSubTab('bmi')}
                  className={cn(
                    "flex-1 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none whitespace-nowrap",
                    logsSubTab === 'bmi'
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)] active-glow"
                      : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                  )}
                >
                  <Calculator size={14} />
                  BMI Calc
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
              {logsSubTab === 'heatmap' && (
                <MuscleVisualizer 
                  onStartWorkout={(m, ex) => {
                    setActiveWorkout({ muscle: m, exercise: ex });
                  }}
                  muscleData={calculate7DayMuscleFrequency(workoutData)}
                />
              )}
              {logsSubTab === 'challenges' && (
                <FitnessChallenges
                  userChallenges={userChallenges}
                  today={today}
                  onSugarLogChange={(consumed) => setSugarConsumedToday(consumed)}
                  onRefresh={handleSyncChallenges}
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
      <div className="fixed bottom-0 left-0 right-0 z-[190] bg-[#0b0b0e]/95 backdrop-blur-lg border-t border-[var(--border)] pt-1 pb-[calc(env(safe-area-inset-bottom)+4px)] px-2 select-none shadow-[0_-8px_24px_rgba(0,0,0,0.7)] flex justify-around items-center">
        {bottomTabs.map(tab => {
          const isActive = activeTab === tab.id;
          const isFemale = activeTab === 'sessions' && sessionsSubTab === 'female';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-0.5 text-center text-[10px] font-black uppercase tracking-[0.05em] transition-all duration-300 relative cursor-pointer active:scale-95 group",
                isActive 
                  ? isFemale 
                    ? "text-[#ff69b4] drop-shadow-[0_0_8px_rgba(255,105,180,0.5)]"
                    : "text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-glow)]" 
                  : "text-[var(--muted)] hover:text-white"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all duration-300 mb-0.5 flex items-center justify-center",
                isActive 
                  ? isFemale 
                    ? "bg-[#ff69b4]/12 scale-110 border border-[#ff69b4]/20"
                    : "bg-[var(--accent)]/12 scale-110 border border-[var(--accent)]/20" 
                  : "group-hover:bg-white/5 border border-transparent"
              )}>
                <tab.icon size={16} className="transition-transform duration-300" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold tracking-tight whitespace-nowrap leading-none">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeBottomTabGlow"
                  className={cn(
                    "absolute bottom-0 h-[2.5px] w-7 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
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
                <div className="text-6xl mb-4">🛡️</div>
                <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-wider mb-1">SOVEREIGN FOCUS.</h2>
                <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] mb-5 italic">No excuses. You showed up today.</p>
                
                <div className="bg-red-950/20 border border-red-500/20 p-2.5 rounded-xl text-center mb-5">
                   <p className="text-[10px] font-black text-white uppercase tracking-wider">Discipline beats motivation.</p>
                   <p className="text-[8px] font-semibold text-neutral-400 uppercase tracking-[0.1em] mt-0.5">Stay locked in. Control your mind.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                   <div className="bg-[var(--sub)] p-3 rounded-2xl border border-[var(--border)]">
                      <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Duration</div>
                      <div className="text-xl font-display font-black text-[var(--accent)] italic">
                        {Math.floor(showCompletion.duration / 60)}:{(showCompletion.duration % 60).toString().padStart(2, '0')}
                      </div>
                   </div>
                   <div className="bg-[var(--sub)] p-3 rounded-2xl border border-[var(--border)]">
                      <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Target</div>
                      <div className="text-xl font-display font-black text-[var(--yellow)] italic uppercase">{showCompletion.muscle}</div>
                   </div>
                </div>

                <div className="bg-black/20 p-4 rounded-2xl border border-[var(--border)] mb-5">
                   <div className="text-xs font-bold text-white mb-0.5">"{showCompletion.exercise}"</div>
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
          <NotificationSettings 
            onClose={() => setShowNotificationSettings(false)} 
            triggerToast={addToast} 
            onForceUpdate={forceUpdateApp}
          />
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
      <div className="fixed bottom-5 left-5 right-5 md:top-6 md:right-6 md:left-auto md:bottom-auto z-[100000] max-w-sm w-auto md:w-full space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
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

      {username && jarvisEnabled && (
        <VoiceButton
          userProfile={userProfile}
          startWorkout={startVoiceWorkout}
          addCalories={addVoiceCalories}
          addWater={addVoiceWater}
          setActiveTab={setActiveTab}
          addToast={addToast}
          onDisable={() => setJarvisEnabled(false)}
        />
      )}

    </div>
  );
}
