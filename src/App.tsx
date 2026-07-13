import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Apple, 
  Scale, 
  User, 
  Menu, 
  X, 
  Trophy,
  LayoutDashboard
} from 'lucide-react';

import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  addDoc,
  deleteDoc,
  orderBy,
  onSnapshot
} from './firebase';

import { UserProfile, Workout, PersonalRecord, ProgressLog, ProteinLog } from './types';

// Component imports
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import ProteinTracker from './components/ProteinTracker';
import ProgressTracker from './components/ProgressTracker';
import PRTracker from './components/PRTracker';
import ProfilePage from './components/ProfilePage';
import { DashboardSkeleton } from './components/LoadingSkeleton';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  
  // Real-time Cloud Data States
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [proteinLogs, setProteinLogs] = useState<ProteinLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workout' | 'protein' | 'progress' | 'pr' | 'profile'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth & Profile Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Load Profile from Firestore
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data() as UserProfile;
          setProfile(profileData);
          setOnboardingCompleted(profileData.onboardingCompleted);
        } else {
          // Initialize new UserProfile
          const newProfile: UserProfile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Fitness Chief',
            email: firebaseUser.email || '',
            avatarUrl: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            createdAt: new Date().toISOString(),
            streakCount: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            onboardingCompleted: false,
            weightTarget: 80,
            age: 25,
            gender: 'male',
            height: 175
          };

          await setDoc(profileRef, newProfile);
          setProfile(newProfile);
          setOnboardingCompleted(false);
        }
      } else {
        // Not authenticated
        setUser(null);
        setProfile(null);
        
        // Fallback checks for local demo/guest profile
        const cachedDemo = localStorage.getItem('levelup_demo_user');
        if (cachedDemo) {
          const parsedDemo = JSON.parse(cachedDemo);
          setProfile(parsedDemo);
          setOnboardingCompleted(parsedDemo.onboardingCompleted);
        } else {
          setOnboardingCompleted(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore Data Subscription
  useEffect(() => {
    if (!user) {
      // If Guest/Demo, load from LocalStorage fallback for real-time emulation!
      const loadDemoData = () => {
        const dWorkouts = localStorage.getItem('levelup_demo_workouts');
        const dPrs = localStorage.getItem('levelup_demo_prs');
        const dProgress = localStorage.getItem('levelup_demo_progress');
        const dProtein = localStorage.getItem('levelup_demo_protein');

        setWorkouts(dWorkouts ? JSON.parse(dWorkouts) : []);
        setPrs(dPrs ? JSON.parse(dPrs) : []);
        setProgressLogs(dProgress ? JSON.parse(dProgress) : []);
        setProteinLogs(dProtein ? JSON.parse(dProtein) : []);
      };

      loadDemoData();
      
      // Listen to local changes
      window.addEventListener('storage', loadDemoData);
      return () => window.removeEventListener('storage', loadDemoData);
    }

    // Workouts Listener
    const qWorkouts = query(
      collection(db, 'workouts'), 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubWorkouts = onSnapshot(qWorkouts, (snapshot) => {
      const wList: Workout[] = [];
      snapshot.forEach(doc => {
        wList.push({ id: doc.id, ...doc.data() } as Workout);
      });
      setWorkouts(wList);
    });

    // PRs Listener
    const qPrs = query(
      collection(db, 'prs'), 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubPrs = onSnapshot(qPrs, (snapshot) => {
      const prList: PersonalRecord[] = [];
      snapshot.forEach(doc => {
        prList.push({ id: doc.id, ...doc.data() } as PersonalRecord);
      });
      setPrs(prList);
    });

    // Progress Listener
    const qProgress = query(
      collection(db, 'progress'), 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubProgress = onSnapshot(qProgress, (snapshot) => {
      const progList: ProgressLog[] = [];
      snapshot.forEach(doc => {
        progList.push({ id: doc.id, ...doc.data() } as ProgressLog);
      });
      setProgressLogs(progList);
    });

    // Protein Logs Listener
    const qProtein = query(
      collection(db, 'protein_logs'), 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubProtein = onSnapshot(qProtein, (snapshot) => {
      const protList: ProteinLog[] = [];
      snapshot.forEach(doc => {
        protList.push({ id: doc.id, ...doc.data() } as ProteinLog);
      });
      setProteinLogs(protList);
    });

    return () => {
      unsubWorkouts();
      unsubPrs();
      unsubProgress();
      unsubProtein();
    };
  }, [user]);

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Sign-In failed:", err);
      alert("Sign-In popup blocked or aborted. Feel free to use Guest Access to trial all synchronized screens instantly.");
    } finally {
      setLoading(false);
    }
  };

  // Onboarding Complete Callback
  const handleOnboardingComplete = async (isDemo: boolean) => {
    if (isDemo) {
      // Setup mock demo profile
      const demoProfile: UserProfile = {
        id: 'guest-chief-777',
        name: 'Guest Chief 🔥',
        email: 'guest@levelup.app',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        createdAt: new Date().toISOString(),
        streakCount: 3,
        lastActiveDate: new Date().toISOString().split('T')[0],
        onboardingCompleted: true,
        weightTarget: 75,
        age: 26,
        gender: 'male',
        height: 180
      };

      localStorage.setItem('levelup_demo_user', JSON.stringify(demoProfile));
      
      // Add pre-loaded workouts and progress to showcase dashboard beautifully!
      const initialDemoWorkouts: Workout[] = [
        {
          id: 'demo-wk-1',
          userId: 'guest-chief-777',
          date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
          duration: 50,
          intensity: 'High',
          exercises: [
            { id: 'ex-1', name: 'Bench Press', sets: [{ id: 's-1', weight: 185, reps: 8 }] },
            { id: 'ex-2', name: 'Squats', sets: [{ id: 's-2', weight: 225, reps: 5 }] }
          ],
          notes: 'Form felt solid, focused on slow negatives.'
        },
        {
          id: 'demo-wk-2',
          userId: 'guest-chief-777',
          date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
          duration: 40,
          intensity: 'Medium',
          exercises: [
            { id: 'ex-3', name: 'Deadlift', sets: [{ id: 's-3', weight: 315, reps: 5 }] }
          ]
        }
      ];

      const initialDemoPrs: PersonalRecord[] = [
        { id: 'demo-pr-1', userId: 'guest-chief-777', exercise: 'Squat', weight: 245, reps: 5, date: '2026-07-10' },
        { id: 'demo-pr-2', userId: 'guest-chief-777', exercise: 'Bench Press', weight: 195, reps: 5, date: '2026-07-11' }
      ];

      const initialDemoProgress: ProgressLog[] = [
        { id: 'demo-p-1', userId: 'guest-chief-777', weight: 81.2, bmi: 25.1, bodyFat: 18.2, date: '2026-07-09' },
        { id: 'demo-p-2', userId: 'guest-chief-777', weight: 80.5, bmi: 24.8, bodyFat: 17.9, date: '2026-07-12' }
      ];

      localStorage.setItem('levelup_demo_workouts', JSON.stringify(initialDemoWorkouts));
      localStorage.setItem('levelup_demo_prs', JSON.stringify(initialDemoPrs));
      localStorage.setItem('levelup_demo_progress', JSON.stringify(initialDemoProgress));

      setProfile(demoProfile);
      setOnboardingCompleted(true);
    } else {
      // Authed user complete onboarding
      if (user && profile) {
        const updatedProfile = { ...profile, onboardingCompleted: true };
        await setDoc(doc(db, 'users', user.uid), updatedProfile);
        setProfile(updatedProfile);
        setOnboardingCompleted(true);
      }
    }
  };

  // Sign out / Reset Demo
  const handleLogout = async () => {
    if (user) {
      await signOut(auth);
    } else {
      localStorage.removeItem('levelup_demo_user');
      localStorage.removeItem('levelup_demo_workouts');
      localStorage.removeItem('levelup_demo_prs');
      localStorage.removeItem('levelup_demo_progress');
      localStorage.removeItem('levelup_demo_protein');
      setProfile(null);
      setOnboardingCompleted(false);
    }
    setActiveTab('dashboard');
  };

  // Update Profile specs in Cloud or LocalStorage
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (profile) {
      const updated = { ...profile, ...updates };
      setProfile(updated);

      if (user) {
        await setDoc(doc(db, 'users', user.uid), updated);
      } else {
        localStorage.setItem('levelup_demo_user', JSON.stringify(updated));
      }
    }
  };

  // Save Workout helper
  const handleSaveWorkout = async (wData: Omit<Workout, 'id' | 'userId'>) => {
    if (user) {
      await addDoc(collection(db, 'workouts'), {
        ...wData,
        userId: user.uid
      });
    } else {
      // Save locally
      const stored = localStorage.getItem('levelup_demo_workouts');
      const list = stored ? JSON.parse(stored) : [];
      const newWk: Workout = {
        id: 'wk-' + Date.now().toString(),
        userId: 'guest-chief-777',
        ...wData
      };
      const updated = [newWk, ...list];
      localStorage.setItem('levelup_demo_workouts', JSON.stringify(updated));
      setWorkouts(updated);
    }
  };

  // Delete Workout helper
  const handleDeleteWorkout = async (id: string) => {
    if (user) {
      await deleteDoc(doc(db, 'workouts', id));
    } else {
      const stored = localStorage.getItem('levelup_demo_workouts');
      if (stored) {
        const updated = JSON.parse(stored).filter((wk: Workout) => wk.id !== id);
        localStorage.setItem('levelup_demo_workouts', JSON.stringify(updated));
        setWorkouts(updated);
      }
    }
  };

  // Save PR helper
  const handleSavePR = async (exercise: string, weight: number, reps: number) => {
    const prData = {
      exercise,
      weight,
      reps,
      date: new Date().toISOString().split('T')[0]
    };

    if (user) {
      await addDoc(collection(db, 'prs'), {
        ...prData,
        userId: user.uid
      });
    } else {
      const stored = localStorage.getItem('levelup_demo_prs');
      const list = stored ? JSON.parse(stored) : [];
      const newPR: PersonalRecord = {
        id: 'pr-' + Date.now().toString(),
        userId: 'guest-chief-777',
        ...prData
      };
      const updated = [newPR, ...list];
      localStorage.setItem('levelup_demo_prs', JSON.stringify(updated));
      setPrs(updated);
    }
  };

  // Delete PR
  const handleDeletePR = async (id: string) => {
    if (user) {
      await deleteDoc(doc(db, 'prs', id));
    } else {
      const stored = localStorage.getItem('levelup_demo_prs');
      if (stored) {
        const updated = JSON.parse(stored).filter((p: PersonalRecord) => p.id !== id);
        localStorage.setItem('levelup_demo_prs', JSON.stringify(updated));
        setPrs(updated);
      }
    }
  };

  // Save Progress Log helper
  const handleSaveProgress = async (weight: number, bmi: number, bodyFat: number) => {
    const progData = {
      weight,
      bmi,
      bodyFat,
      date: new Date().toISOString().split('T')[0]
    };

    if (user) {
      await addDoc(collection(db, 'progress'), {
        ...progData,
        userId: user.uid
      });
    } else {
      const stored = localStorage.getItem('levelup_demo_progress');
      const list = stored ? JSON.parse(stored) : [];
      const newLog: ProgressLog = {
        id: 'prog-' + Date.now().toString(),
        userId: 'guest-chief-777',
        ...progData
      };
      const updated = [newLog, ...list];
      localStorage.setItem('levelup_demo_progress', JSON.stringify(updated));
      setProgressLogs(updated);
    }
  };

  // Delete Progress Log
  const handleDeleteProgress = async (id: string) => {
    if (user) {
      await deleteDoc(doc(db, 'progress', id));
    } else {
      const stored = localStorage.getItem('levelup_demo_progress');
      if (stored) {
        const updated = JSON.parse(stored).filter((p: ProgressLog) => p.id !== id);
        localStorage.setItem('levelup_demo_progress', JSON.stringify(updated));
        setProgressLogs(updated);
      }
    }
  };

  // Save Protein Log helper
  const handleSaveProtein = async (amount: number) => {
    const protData = {
      amount,
      date: new Date().toISOString().split('T')[0]
    };

    if (user) {
      await addDoc(collection(db, 'protein_logs'), {
        ...protData,
        userId: user.uid
      });
    } else {
      const stored = localStorage.getItem('levelup_demo_protein');
      const list = stored ? JSON.parse(stored) : [];
      const newLog: ProteinLog = {
        id: 'prot-' + Date.now().toString(),
        userId: 'guest-chief-777',
        ...protData
      };
      const updated = [newLog, ...list];
      localStorage.setItem('levelup_demo_protein', JSON.stringify(updated));
      setProteinLogs(updated);
    }
  };

  // Delete Protein Log
  const handleDeleteProtein = async (id: string) => {
    if (user) {
      await deleteDoc(doc(db, 'protein_logs', id));
    } else {
      const stored = localStorage.getItem('levelup_demo_protein');
      if (stored) {
        const updated = JSON.parse(stored).filter((p: ProteinLog) => p.id !== id);
        localStorage.setItem('levelup_demo_protein', JSON.stringify(updated));
        setProteinLogs(updated);
      }
    }
  };

  // Render correct panel
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            userProfile={profile} 
            workouts={workouts} 
            prs={prs} 
            weightLogs={progressLogs} 
            proteinLogs={proteinLogs}
            onNavigateTo={(tab) => setActiveTab(tab)}
          />
        );
      case 'workout':
        return (
          <WorkoutTracker 
            workouts={workouts} 
            onSaveWorkout={handleSaveWorkout} 
            onDeleteWorkout={handleDeleteWorkout}
          />
        );
      case 'protein':
        return (
          <ProteinTracker 
            logs={proteinLogs} 
            onSaveProtein={handleSaveProtein} 
            onDeleteProtein={handleDeleteProtein}
          />
        );
      case 'progress':
        return (
          <ProgressTracker 
            logs={progressLogs} 
            userProfile={profile} 
            onSaveProgress={handleSaveProgress} 
            onDeleteProgress={handleDeleteProgress}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'pr':
        return (
          <PRTracker 
            prs={prs} 
            workouts={workouts} 
            streakCount={profile?.streakCount || 0} 
            onSavePR={handleSavePR} 
            onDeletePR={handleDeletePR}
          />
        );
      case 'profile':
        return (
          <ProfilePage 
            userProfile={profile} 
            workouts={workouts} 
            prs={prs} 
            weightLogs={progressLogs} 
            onLogout={handleLogout} 
            onUpdateProfile={handleUpdateProfile}
          />
        );
      default:
        return <DashboardSkeleton />;
    }
  };

  // Return Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-neutral-100 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono tracking-widest text-neutral-500 animate-pulse uppercase">Leveling Up Core System...</p>
      </div>
    );
  }

  // Return Onboarding Flow
  if (!onboardingCompleted) {
    return (
      <Onboarding 
        onComplete={handleOnboardingComplete} 
        onGoogleLogin={handleGoogleLogin}
        isLoading={loading}
      />
    );
  }

  // Main Dashboard Interface
  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Visual Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-[120px] opacity-[0.03] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-[0.03] pointer-events-none" />

      {/* MOBILE HEADER TAB */}
      <header className="md:hidden border-b border-white/5 bg-neutral-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold tracking-wider text-xs font-mono text-white">LEVELUP</span>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-neutral-950 border-r border-white/5 z-50 transform transition-transform duration-300 md:translate-x-0 md:static md:flex md:flex-col justify-between shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Dumbbell className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-black tracking-widest text-sm text-white font-mono block">LEVELUP</span>
              <span className="text-[8px] font-mono font-bold text-neutral-500 tracking-wider">DISCIPLINE CORE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {[
              { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'workout', label: 'Workout Core', icon: <Dumbbell className="w-4 h-4" /> },
              { id: 'protein', label: 'Protein macro', icon: <Apple className="w-4 h-4" /> },
              { id: 'progress', label: 'Progress Hub', icon: <Scale className="w-4 h-4" /> },
              { id: 'pr', label: 'PR Trophies', icon: <Trophy className="w-4 h-4" /> },
              { id: 'profile', label: 'Parameters', icon: <User className="w-4 h-4" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 text-amber-500 border border-amber-500/25 shadow'
                    : 'text-neutral-400 hover:text-white border border-transparent hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Badge Profile Summary bottom */}
        <div className="p-4 border-t border-white/5 bg-neutral-950/40">
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all text-left"
          >
            <img 
              src={profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"} 
              alt="Avatar avatar" 
              className="w-8 h-8 rounded-full border border-white/10 object-cover referrerPolicy='no-referrer'"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <span className="text-xs font-extrabold text-neutral-100 block truncate leading-none mb-1">
                {profile?.name || 'Chief User'}
              </span>
              <span className="text-[9px] font-bold font-mono text-amber-500 uppercase tracking-widest leading-none block">
                🔥 STREAK: {profile?.streakCount || 0}
              </span>
            </div>
          </button>
        </div>
      </aside>

      {/* SIDEBAR BACKDROP FOR MOBILE */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Welcome Greeting Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4.5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">
                Welcome back, Chief 🔥
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Logged in as <strong className="text-neutral-200">{profile?.name}</strong>. Syncing and database services operational.
            </p>
          </div>

          {/* Quick status bar */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-white/5 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Cloud persistence: synced
          </div>
        </header>

        {/* Dynamic Inner Tab View */}
        <div className="space-y-6">
          {renderActiveTab()}
        </div>

      </main>

    </div>
  );
}
