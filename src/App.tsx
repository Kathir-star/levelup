import { useState, useEffect } from 'react';
import { MuscleGroup, Exercise, WorkoutEntry, UserProfile, PR, SleepEntry } from './types';
import { calculateStreak, cn } from './lib/utils';
import { QUOTES, TAMIL_QUOTES } from './constants';
import { motion, AnimatePresence } from 'motion/react';
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
  RefreshCcw
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import WorkoutLog from './components/WorkoutLog';
import MuscleVisualizer from './components/MuscleVisualizer';
import WorkoutExecution from './components/WorkoutExecution';
import AICoach from './components/AICoach';
import StepTracker from './components/StepTracker';
import WaterTracker from './components/WaterTracker';
import SleepTracker from './components/SleepTracker';
import Planner from './components/Planner';
import BodyStats from './components/BodyStats';
import MuscleProgressCharts from './components/MuscleProgressCharts';
import HomeWorkout from './components/HomeWorkout';
import StructuredPlans from './components/StructuredPlans';
import Logo from './components/common/Logo';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
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
      } else {
        setUserProfile({ name: username, gender: 'male' });
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
    
    const dataToSave = { workoutData, userProfile, steps, water, prs, sleep };
    localStorage.setItem(`lv_data_${username}`, JSON.stringify(dataToSave));
  }, [username, workoutData, userProfile, steps, water, prs, sleep]);

  // Theme & Gender Effect
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.gender = userProfile.gender || 'male';
    document.documentElement.dataset.tamil = tamilMode ? 'true' : 'false';
    localStorage.setItem('lvTheme', theme);
    localStorage.setItem('lvTamilMode', String(tamilMode));
  }, [theme, userProfile.gender, tamilMode]);

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

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleTamilMode = () => setTamilMode(prev => !prev);
  const toggleVoice = () => setVoiceOn(prev => !prev);

  const handleLogWorkout = async (entry: WorkoutEntry) => {
    const entryWithMeta = { ...entry, date: today, time: new Date().toLocaleTimeString() };
    
    setWorkoutData(prev => {
      const currentDay = prev[today] || [];
      return { ...prev, [today]: [...currentDay, entryWithMeta] };
    });

    // 🔥 Gamification: XP Gain for Workouts
    const currentXp = parseInt(localStorage.getItem('user-xp') || '0');
    const gainedXp = Math.max(50, (entry.sets || 1) * 30); // 30 XP per set, min 50
    localStorage.setItem('user-xp', (currentXp + gainedXp).toString());
    window.dispatchEvent(new Event('storage'));

    // Update PRs if needed
    setPrs(prev => {
      const currentMusclePR = prev[entry.muscle];
      if (!currentMusclePR || entry.weight > currentMusclePR.weight) {
        return {
          ...prev,
          [entry.muscle]: { weight: entry.weight, reps: entry.reps, date: today }
        };
      }
      return prev;
    });
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
    localStorage.removeItem('username');
    setUsername(null);
    setUserProfile({ name: '' });
  };

  const handleStartApp = (name: string) => {
    localStorage.setItem('username', name);
    setUsername(name);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'male-plan', label: 'Male Session', icon: UserIcon },
    { id: 'female-plan', label: 'Female Session', icon: UserIcon },
    { id: 'home', label: 'Home Session', icon: Home },
    { id: 'planner', label: 'AI Planner', icon: ClipboardList },
    { id: 'log', label: 'Training Log', icon: Dumbbell },
    { id: 'charts', label: 'Muscle Progress', icon: TrendingUp },
    { id: 'body', label: 'Stats & BMI', icon: Calculator },
    { id: 'coach', label: 'AI Coach', icon: Bot },
  ];

  const streak = calculateStreak(workoutData);

  if (!username) {
    return <WelcomeScreen onStart={handleStartApp} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
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
          <div className="flex items-center gap-1 font-black text-2xl tracking-tighter uppercase hidden sm:flex">
            <span className="text-[var(--accent)]">LEVEL</span>
            <span className="text-white">UP</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2 bg-[var(--card)] px-4 py-2 rounded-xl border border-[var(--border)] shadow-sm">
            <div className="w-6 h-6 rounded-full bg-[var(--sub)] flex items-center justify-center text-[var(--accent)]">
              <UserIcon size={14} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{userProfile.name || 'Champion'}</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-[var(--red)]/10 px-4 py-2 rounded-xl border border-[var(--red)]/20 shadow-lg animate-in zoom-in duration-500 hidden sm:flex">
                <Flame size={16} className="text-[var(--red)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{streak} Day Streak</span>
            </div>
          )}
          <div className="flex items-center gap-1">
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

      {/* Tabs */}
      <div className="flex border-b-2 border-[var(--border)] bg-[var(--card2)] overflow-x-auto no-scrollbar sticky top-[68px] z-[90]">
        {tabs.map(tab => {
          const isFemaleTab = tab.id === 'female-plan';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-4 flex items-center gap-2 text-[11px] font-display font-black whitespace-nowrap border-b-2 transition-all uppercase tracking-[0.2em]",
                activeTab === tab.id 
                  ? isFemaleTab 
                    ? "text-[#ff69b4] border-[#ff69b4] shadow-[inset_0_-8px_15px_-10px_rgba(255,105,180,0.3)] bg-[#ff69b4]/5"
                    : "text-[var(--accent)] border-[var(--accent)] shadow-[inset_0_-8px_15px_-10px_var(--accent-glow)] bg-[var(--accent)]/5" 
                  : isFemaleTab
                    ? "text-[#ff69b4]/60 border-transparent hover:text-[#ff69b4]"
                    : "text-[var(--muted)] border-transparent hover:text-white"
              )}
            >
              <tab.icon size={14} className={cn(activeTab === tab.id && "animate-pulse")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <main 
        className="flex-1 p-5 sm:p-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300"
        data-gender={activeTab === 'female-plan' ? 'female' : userProfile.gender || 'male'}
      >
        {activeTab === 'male-plan' && (
          <StructuredPlans gender="male" />
        )}
        {activeTab === 'female-plan' && (
          <StructuredPlans gender="female" />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard 
            data={workoutData} 
            profile={userProfile} 
            steps={steps} 
            water={water[today] || 0} 
            waterGoal={8} 
          />
        )}
        {activeTab === 'steps' && (
          <StepTracker 
            initialSteps={steps[today] || 0} 
            onStepsChange={handleStepsChange} 
          />
        )}
        {activeTab === 'log' && (
          <WorkoutLog 
            onLog={handleLogWorkout} 
            todayEntries={workoutData[today] || []} 
            history={Object.values(workoutData).flat().reverse() as WorkoutEntry[]} 
          />
        )}
        {activeTab === 'charts' && (
          <MuscleProgressCharts data={workoutData} />
        )}
        {activeTab === 'coach' && (
          <AICoach userName={userProfile.name || 'Champion'} userProfile={userProfile} workoutData={workoutData} />
        )}
        {activeTab === 'body' && (
          <BodyStats profile={userProfile} onUpdate={handleProfileUpdate} />
        )}
        {activeTab === 'planner' && (
          <Planner userName={userProfile.name || 'Champion'} onProfileUpdate={handleProfileUpdate} />
        )}
        {activeTab === 'home' && (
          <HomeWorkout />
        )}
      </main>

      {/* Guided Workout Overlay */}
      {activeWorkout && (
        <WorkoutExecution 
          muscle={activeWorkout.muscle} 
          exercise={activeWorkout.exercise} 
          onComplete={completeWorkout} 
          onCancel={() => setActiveWorkout(null)} 
        />
      )}

      <footer className="p-4 text-center text-[var(--muted)] text-xs border-t border-[var(--border)] mt-5">
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
    </div>
  );
}
