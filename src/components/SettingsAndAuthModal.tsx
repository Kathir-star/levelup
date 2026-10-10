import { useState } from 'react';
import {
  UserProfile,
  AppSettings,
  FitnessGoal,
  ActivityLevel,
  DietaryPreference
} from '../types';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  firebaseSignOut,
  User
} from '../lib/firebase';
import {
  DEFAULT_APP_SETTINGS,
  calculateMacroTargets
} from '../utils/nutritionDatabase';
import {
  X,
  Cloud,
  CheckCircle2,
  Download,
  Upload,
  LogOut,
  RefreshCw,
  Shield,
  Sliders,
  User as UserIcon,
  Mail,
  Lock,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsAndAuthModalProps {
  onClose: () => void;
  profile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  firebaseUser: User | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'offline';
  lastSyncedAt: string | null;
  onManualSync: () => Promise<void>;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onForceCacheRefresh: () => void;
  triggerToast: (msg: string) => void;
}

export default function SettingsAndAuthModal({
  onClose,
  profile,
  onUpdateProfile,
  settings,
  onUpdateSettings,
  firebaseUser,
  syncStatus,
  lastSyncedAt,
  onManualSync,
  onExportJSON,
  onImportJSON,
  onForceCacheRefresh,
  triggerToast
}: SettingsAndAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'profile' | 'targets' | 'data'>('account');

  // Auth form states
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile edit states
  const [name, setName] = useState(profile?.name || 'Athlete');
  const [height, setHeight] = useState(String(profile?.height || 175));
  const [weight, setWeight] = useState(String(profile?.weight || 70));
  const [targetWeight, setTargetWeight] = useState(String(profile?.targetWeight || 75));
  const [age, setAge] = useState(String(profile?.age || 24));
  const [gender, setGender] = useState<'male' | 'female'>(profile?.gender || 'male');
  const [goal, setGoal] = useState<FitnessGoal>(profile?.goal || 'Muscle Gain');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel || 'Moderately Active');
  const [dietPreference, setDietPreference] = useState<DietaryPreference>(profile?.dietPreference || 'Non-Vegetarian');

  // Target edit states
  const [calTarget, setCalTarget] = useState(String(settings.calorieTarget || 0));
  const [proTarget, setProTarget] = useState(String(settings.proteinTarget || 0));
  const [waterGoal, setWaterGoal] = useState(String(settings.waterGoalMl || 3000));
  const [stepGoal, setStepGoal] = useState(String(settings.stepGoal || 10000));
  const [sleepGoal, setSleepGoal] = useState(String(settings.sleepGoalHours || 8));

  const autoMacros = calculateMacroTargets(profile, { ...settings, calorieTarget: 0, proteinTarget: 0 });

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      triggerToast('☁️ Signed in with Google! Syncing your fitness vault...');
    } catch (err: any) {
      setAuthError(err?.message || 'Google sign-in could not complete.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'reset') {
        await sendPasswordResetEmail(auth, email.trim());
        triggerToast('📧 Password reset email sent!');
        setAuthMode('signin');
      } else if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        triggerToast('🎉 Account created & cloud backup enabled!');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        triggerToast('☁️ Signed in! Cloud vault connected.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = () => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || profile.name,
      height: Number(height) || 175,
      weight: Number(weight) || 70,
      targetWeight: Number(targetWeight) || 75,
      age: Number(age) || 24,
      gender,
      goal,
      activityLevel,
      dietPreference
    };
    onUpdateProfile(updated);
    triggerToast('✅ Profile & fitness goals updated!');
  };

  const handleSaveTargets = () => {
    const updated: AppSettings = {
      ...settings,
      calorieTarget: Number(calTarget) || 0,
      proteinTarget: Number(proTarget) || 0,
      waterGoalMl: Number(waterGoal) || 3000,
      stepGoal: Number(stepGoal) || 10000,
      sleepGoalHours: Number(sleepGoal) || 8
    };
    onUpdateSettings(updated);
    triggerToast('🎯 Daily macro & habit targets saved!');
  };

  return (
    <div
      className="fixed inset-0 z-[750] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--card)] border border-[var(--border)] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Top Bar */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white">
              Account, Cloud Sync & Settings
            </h3>
            <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">
              LevelUp 2.0 Persistent Vault & Personalization
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-[var(--muted)] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-[var(--sub)] border-b border-[var(--border)]">
          {[
            { id: 'account', label: 'Cloud Account', icon: Cloud },
            { id: 'profile', label: 'Profile & Goal', icon: UserIcon },
            { id: 'targets', label: 'Macro Targets', icon: Sliders },
            { id: 'data', label: 'Backup & App', icon: Shield }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={cn(
                  "py-2.5 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all",
                  activeTab === t.id
                    ? "bg-[var(--accent)] text-white shadow-md"
                    : "text-[var(--muted)] hover:text-white"
                )}
              >
                <Icon size={14} />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* TAB 1: CLOUD ACCOUNT */}
          {activeTab === 'account' && (
            <div className="space-y-5">
              {firebaseUser ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
                        {(firebaseUser.email || profile?.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Cloud Vault Connected
                        </div>
                        <div className="text-sm font-black text-white">{firebaseUser.email || profile?.name}</div>
                        <div className="text-[10px] text-[var(--muted)]">
                          Status: {syncStatus.toUpperCase()}{' '}
                          {lastSyncedAt ? `• Last synced ${new Date(lastSyncedAt).toLocaleTimeString()}` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={onManualSync}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 hover:brightness-110 transition-all"
                    >
                      <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                      Sync Now
                    </button>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed">
                    Your workouts, PRs, South Indian nutrition logs, water, sleep, body stats, and Winter Arc streaks are automatically backed up to your private cloud vault and stay intact across refreshes and devices.
                  </p>

                  <button
                    onClick={async () => {
                      await firebaseSignOut(auth);
                      triggerToast('Signed out of cloud account. Local data remains safe.');
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-black uppercase tracking-wider flex items-center gap-2"
                  >
                    <LogOut size={14} /> Sign Out of Cloud
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
                    <h4 className="text-sm font-black uppercase text-white">
                      Sync Across Mobile & Laptop (Zero Data Loss)
                    </h4>
                    <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                      Sign in with Google or Email/Password to link your current local profile (<strong>{profile?.name}</strong>) to your private encrypted cloud database. All existing logs will be automatically migrated!
                    </p>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full py-3.5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all cursor-pointer"
                  >
                    <Cloud size={16} /> Continue with Google (1-Tap Cloud Sync)
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-[var(--border)]" />
                    <span className="flex-shrink mx-3 text-[10px] font-black uppercase text-[var(--muted)]">
                      Or Email & Password
                    </span>
                    <div className="flex-grow border-t border-[var(--border)]" />
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    <div className="flex gap-2">
                      {(['signin', 'signup', 'reset'] as const).map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => {
                            setAuthMode(m);
                            setAuthError(null);
                          }}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border",
                            authMode === m
                              ? "bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]"
                              : "bg-[var(--sub)] text-[var(--muted)] border-[var(--border)]"
                          )}
                        >
                          {m === 'signin' ? 'Sign In' : m === 'signup' ? 'Create Account' : 'Reset Password'}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm text-white outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    {authMode !== 'reset' && (
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password (min 6 chars)"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm text-white outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    )}

                    {authError && (
                      <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400 font-bold">
                        {authError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all"
                    >
                      {authLoading
                        ? 'Processing...'
                        : authMode === 'signin'
                        ? 'Sign In & Sync Vault'
                        : authMode === 'signup'
                        ? 'Create Cloud Account & Backup'
                        : 'Send Password Reset Link'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE & FITNESS GOALS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">Athlete Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">Primary Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as FitnessGoal)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  >
                    <option value="Muscle Gain">Muscle Gain (Lean Bulk)</option>
                    <option value="Fat Loss">Fat Loss (Cutting)</option>
                    <option value="Body Recomposition">Body Recomposition</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Athletic Performance">Athletic Performance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">Activity Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  >
                    <option value="Sedentary">Sedentary (Desk Job)</option>
                    <option value="Lightly Active">Lightly Active (1-3 days/wk)</option>
                    <option value="Moderately Active">Moderately Active (3-5 days/wk)</option>
                    <option value="Very Active">Very Active (6-7 days/wk)</option>
                    <option value="Athlete">2x Daily / Competitive Athlete</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">Dietary Preference</label>
                  <select
                    value={dietPreference}
                    onChange={(e) => setDietPreference(e.target.value as DietaryPreference)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  >
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">Target Wt (kg)</label>
                  <input
                    type="number"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-white font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Save Athlete Profile
              </button>
            </div>
          )}

          {/* TAB 3: MACRO & HABIT TARGETS */}
          {activeTab === 'targets' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)] text-xs text-white/80">
                <strong>Auto-Calculated Recommended Baseline:</strong> {autoMacros.calories} kcal •{' '}
                {autoMacros.protein}g Protein • {autoMacros.carbs}g Carbs • {autoMacros.fats}g Fats (Set custom override below or leave 0 for automatic calculation).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">
                    Custom Calorie Target (0 = Auto)
                  </label>
                  <input
                    type="number"
                    value={calTarget}
                    onChange={(e) => setCalTarget(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">
                    Custom Protein Target g (0 = Auto)
                  </label>
                  <input
                    type="number"
                    value={proTarget}
                    onChange={(e) => setProTarget(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">
                    Daily Water Target (ml)
                  </label>
                  <input
                    type="number"
                    value={waterGoal}
                    onChange={(e) => setWaterGoal(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--muted)]">
                    Daily Step Target
                  </label>
                  <input
                    type="number"
                    value={stepGoal}
                    onChange={(e) => setStepGoal(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm font-bold text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveTargets}
                className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-white font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Save Daily Targets
              </button>
            </div>
          )}

          {/* TAB 4: BACKUP, IMPORT & APP MAINTENANCE */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)] space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Full JSON Vault Export & Restore
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Download a complete backup of your workouts, PRs, nutrition history, and settings, or restore from a backup file.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={onExportJSON}
                    className="flex-1 py-3 px-4 rounded-xl bg-[var(--accent)] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Download size={15} /> Export JSON Backup
                  </button>
                  <label className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={15} /> Import JSON Backup
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onImportJSON(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)] space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  PWA Cache & Update Controls
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Running LevelUp v2.0.0. If your mobile browser cached an older stylesheet or script, force refresh the service worker cache below. Your fitness data will NOT be deleted.
                </p>
                <button
                  onClick={onForceCacheRefresh}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--border)] text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} /> Refresh App Shell Cache (Safe — Keeps All Data)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
