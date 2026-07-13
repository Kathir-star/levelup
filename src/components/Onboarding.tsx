import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Activity, Trophy, Sparkles, ChevronRight, ChevronLeft, UserCheck } from 'lucide-react';

interface OnboardingProps {
  onComplete: (isDemo: boolean) => void;
  onGoogleLogin: () => void;
  isLoading: boolean;
}

export default function Onboarding({ onComplete, onGoogleLogin, isLoading }: OnboardingProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  const screens = [
    {
      id: 0,
      title: "Welcome to LevelUp 💪",
      subtitle: "Discipline Over Motivation",
      description: "Your journey to strength, discipline, and consistency starts here. LevelUp is built to help you track your limits, crush your goals, and dominate daily.",
      accentColor: "from-amber-500 to-orange-600",
      icon: <Dumbbell className="w-16 h-16 text-amber-500 animate-pulse" />
    },
    {
      id: 1,
      title: "Track. Improve. Dominate.",
      subtitle: "All-In-One Fitness Core",
      description: "No more notebooks. Seamlessly log your sets, monitor body fat & BMI indices, log exact daily protein, and secure badges along the way.",
      features: [
        { icon: <Dumbbell className="w-5 h-5 text-indigo-400" />, text: "Real-time Workout Tracking" },
        { icon: <Activity className="w-5 h-5 text-emerald-400" />, text: "Weight & Body Metric Indexing" },
        { icon: <Sparkles className="w-5 h-5 text-amber-400" />, text: "Protein & Macro Logging" },
        { icon: <Trophy className="w-5 h-5 text-purple-400" />, text: "PR Records & Achievement Badges" },
      ],
      accentColor: "from-indigo-500 to-purple-600"
    },
    {
      id: 2,
      title: "Stronger Than Yesterday",
      subtitle: "No Excuses. Just Progress.",
      description: "LevelUp isn't just an app. It's your daily push to become stronger than yesterday. Forge consistency, track habits, and view real-time data synced across devices.",
      accentColor: "from-rose-500 to-red-600",
      quote: "“The only bad workout is the one that didn't happen.”",
      icon: <Trophy className="w-16 h-16 text-rose-500" />
    },
    {
      id: 3,
      title: "Unleash Your Limits",
      subtitle: "Secure Sync & Cloud Persistence",
      description: "Connect to your cloud account to preserve your streaks, logs, and workout history. Access your workout specs across desktop and mobile instantly.",
      accentColor: "from-emerald-500 to-teal-600"
    }
  ];

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(prev => prev - 1);
    }
  };

  const activeScreen = screens[currentScreen];

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br ${activeScreen.accentColor} rounded-full blur-[120px] opacity-25 transition-all duration-1000`} />
      <div className={`absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br ${activeScreen.accentColor} rounded-full blur-[120px] opacity-20 transition-all duration-1000`} />
      
      {/* Brand Header */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
          <Dumbbell className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="font-bold tracking-wider text-sm text-neutral-100 font-mono">LEVELUP</span>
      </div>

      <div className="w-full max-w-lg bg-neutral-950/40 border border-white/5 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        
        {/* Onboarding Screen Slider Content */}
        <div className="min-h-[340px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Screen Header */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold font-mono tracking-widest text-neutral-400 uppercase">
                  {activeScreen.subtitle}
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-50 to-neutral-300 bg-clip-text text-transparent">
                  {activeScreen.title}
                </h2>
              </div>

              {/* Central Visual / Content */}
              {activeScreen.icon && (
                <div className="flex justify-center py-6">
                  {activeScreen.icon}
                </div>
              )}

              {activeScreen.features && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-4">
                  {activeScreen.features.map((feat, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl">
                      {feat.icon}
                      <span className="text-xs font-medium text-neutral-300">{feat.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeScreen.quote && (
                <div className="border-l-2 border-rose-500 pl-4 py-1 my-4 italic text-neutral-400 text-sm">
                  {activeScreen.quote}
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-neutral-400 leading-relaxed">
                {activeScreen.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Action CTAs & Slider Navigation */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
            
            {/* Screen indicator dots */}
            <div className="flex justify-center gap-1.5 mb-2">
              {screens.map((dot) => (
                <button
                  key={dot.id}
                  onClick={() => setCurrentScreen(dot.id)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentScreen === dot.id ? 'w-6 bg-amber-500' : 'w-1.5 bg-neutral-700 hover:bg-neutral-500'
                  }`}
                  aria-label={`Go to slide ${dot.id + 1}`}
                />
              ))}
            </div>

            {/* Next/Back Slider Buttons */}
            {currentScreen < screens.length - 1 ? (
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBack}
                  disabled={currentScreen === 0}
                  className={`flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                    currentScreen === 0 
                      ? 'text-neutral-600 cursor-not-allowed' 
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 text-xs font-bold bg-neutral-100 text-neutral-950 px-5 py-2.5 rounded-xl hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // Final Step: Connect Google / Continue as Guest (Highly recommended to bypass Iframe sandbox blocks)
              <div className="space-y-3">
                <button
                  onClick={onGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white text-neutral-900 font-bold text-xs py-3 rounded-xl hover:bg-neutral-100 transition-all active:scale-98 shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-neutral-500 font-mono">OR</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <button
                  onClick={() => onComplete(true)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-neutral-900 border border-white/10 hover:border-white/20 text-neutral-200 font-semibold text-xs py-2.5 rounded-xl hover:bg-neutral-800 transition-all active:scale-98"
                >
                  <UserCheck className="w-4 h-4 text-amber-500" />
                  Try Quick Access (Guest Mode)
                </button>
                <p className="text-[10px] text-neutral-500 text-center leading-relaxed">
                  Sandbox iframe notice: If Google Sign-In is blocked by browser security inside this preview panel, use Quick Access. All database tracking and syncing features are preserved.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Brand Footer */}
      <div className="absolute bottom-8 text-neutral-600 font-mono text-[10px] tracking-widest text-center">
        “ DISCIPLINE OVER MOTIVATION. ”
      </div>
    </div>
  );
}
