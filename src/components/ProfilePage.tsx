import { useState } from 'react';
import { LogOut, Flame, Scale, Trophy, Dumbbell, Mail, User } from 'lucide-react';
import { UserProfile, Workout, PersonalRecord, ProgressLog } from '../types';

interface ProfilePageProps {
  userProfile: UserProfile | null;
  workouts: Workout[];
  prs: PersonalRecord[];
  weightLogs: ProgressLog[];
  onLogout: () => Promise<void>;
  onUpdateProfile: (profileUpdates: Partial<UserProfile>) => Promise<void>;
}

export default function ProfilePage({ userProfile, workouts, prs, weightLogs, onLogout, onUpdateProfile }: ProfilePageProps) {
  const [name, setName] = useState(userProfile?.name || '');
  const [weightTarget, setWeightTarget] = useState(userProfile?.weightTarget || 80);
  const [isSaving, setIsSaving] = useState(false);

  // Compute stats
  const totalWorkouts = workouts.length;
  const totalWeightLifted = workouts.reduce((acc, curr) => {
    return acc + curr.exercises.reduce((exAcc, ex) => {
      return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0);
    }, 0);
  }, 0);

  const streak = userProfile?.streakCount || 0;
  const latestWeight = weightLogs[0]?.weight || 'None';

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({
        name: name.trim(),
        weightTarget: Number(weightTarget)
      });
      alert("Profile specifications successfully synchronized to the cloud!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          LevelUp Core Profile
        </h2>
        <p className="text-xs text-neutral-400">Manage your personal stats, synchronize goals, and audit earned badges.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Card Profile details */}
        <div className="lg:col-span-1 bg-neutral-900/60 border border-white/5 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center justify-between text-center min-h-[380px] relative overflow-hidden">
          
          <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-[8px] tracking-widest px-2 py-0.5 rounded">
            SYNCED ACTIVE
          </div>

          <div className="w-full space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <img 
                src={userProfile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
                alt="Avatar Profile" 
                className="w-full h-full rounded-full border-2 border-indigo-500 object-cover shadow-lg referrerPolicy='no-referrer'"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-neutral-950 p-1 rounded-full shadow border border-black flex items-center justify-center">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">{userProfile?.name || "Fitness Chief"}</h3>
              <p className="text-xs text-neutral-400 flex items-center justify-center gap-1.5 mt-1 font-mono">
                <Mail className="w-3 h-3 text-neutral-500" />
                {userProfile?.email || "anonymous@levelup.app"}
              </p>
            </div>

            {/* Streak Widget Box */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/10 p-4 rounded-xl flex items-center justify-between text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold font-mono text-amber-500 uppercase">ACTIVE STREAK</span>
                <p className="text-xs font-semibold text-neutral-300">No Excuses. Just progress.</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-6 h-6 text-amber-500 animate-bounce" />
                <span className="text-3xl font-black text-white font-mono">{streak}</span>
              </div>
            </div>
          </div>

          <div className="w-full pt-6 border-t border-white/5 space-y-2">
            <button
              onClick={onLogout}
              className="w-full py-2.5 bg-neutral-950 border border-white/5 hover:border-white/10 hover:bg-neutral-900 text-xs font-semibold text-rose-400 hover:text-rose-300 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <LogOut className="w-4 h-4" />
              SIGN OUT OF PROFILE
            </button>
            <p className="text-[9px] text-neutral-500">Registered since: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
          </div>

        </div>

        {/* Center/Right: Stats overview & Profile updating form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dashboard aggregates row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-neutral-900/60 border border-white/5 p-4.5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">Total Workouts</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-white font-mono">{totalWorkouts}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">({totalWeightLifted.toLocaleString()} lbs vol)</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/60 border border-white/5 p-4.5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">PRs Logged</span>
                <span className="text-xl font-extrabold text-white font-mono">{prs.length} Records</span>
              </div>
            </div>

            <div className="bg-neutral-900/60 border border-white/5 p-4.5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">Latest Weight</span>
                <span className="text-xl font-extrabold text-white font-mono">{latestWeight !== 'None' ? `${latestWeight} kg` : 'None'}</span>
              </div>
            </div>

          </div>

          {/* Form to update User Info details */}
          <form onSubmit={handleUpdate} className="bg-neutral-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono border-b border-white/5 pb-2">
              Sync Targets & Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">
                  Full Name / Tag
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 px-3 py-2 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-neutral-400 uppercase mb-1">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  value={weightTarget}
                  onChange={(e) => setWeightTarget(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/5 px-3 py-2 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                  min="30"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors active:scale-98"
            >
              {isSaving ? "SYNCHRONIZING..." : "SAVE PROFILE SETTINGS"}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
