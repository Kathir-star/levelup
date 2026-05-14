import { motion } from 'motion/react';
import { 
  Zap, 
  Timer, 
  TrendingUp, 
  Target, 
  Footprints, 
  Calendar, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  MessageSquare,
  ArrowRight,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react';
import { cn } from '../lib/utils';
import Logo from './common/Logo';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const features = [
    {
      icon: <MessageSquare className="text-[var(--red)]" />,
      title: "AI Coach",
      description: "Real-time motivation and guidance tailored to your performance."
    },
    {
      icon: <Timer className="text-[var(--red)]" />,
      title: "Smart Workout Timer",
      description: "Automated exercise tracking with intelligent rest periods."
    },
    {
      icon: <TrendingUp className="text-[var(--red)]" />,
      title: "Progress Tracking",
      description: "Visual graphs for weight, workouts, and step consistency."
    },
    {
      icon: <Target className="text-[var(--red)]" />,
      title: "Muscle Targeting",
      description: "Interactive muscle selection to focus on specific body areas."
    },
    {
      icon: <Footprints className="text-[var(--red)]" />,
      title: "Step Counter",
      description: "Automatic tracking using your device's accelerometer."
    },
    {
      icon: <Calendar className="text-[var(--red)]" />,
      title: "Workout Planner",
      description: "Personalized plans that evolve with your fitness level."
    }
  ];

  const steps = [
    { title: "Choose Level", icon: "1" },
    { title: "Select Muscle", icon: "2" },
    { title: "Start Workout", icon: "3" },
    { title: "Track Progress", icon: "4" }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-[var(--red)] selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            <span className="font-black text-2xl tracking-tighter uppercase">Level<span className="text-[var(--red)]">Up</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Features', 'Workouts', 'AI Coach'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-[var(--muted)] hover:text-white transition-colors uppercase tracking-widest">
                {item}
              </a>
            ))}
          </div>

          <button 
            onClick={onStart}
            className="px-6 py-2.5 rounded-full bg-[var(--red)] text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,59,48,0.2)]"
          >
            Start Training
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] text-[10px] font-black uppercase tracking-[0.2em]">
              <Zap size={14} />
              The Future of Fitness is Here
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.9] uppercase">
              Level Up Your <br />
              <span className="text-[var(--red)]">Fitness Journey</span>
            </h1>
            <p className="text-xl text-[var(--muted)] max-w-lg leading-relaxed">
              Smart workouts. Real-time tracking. AI-powered coaching. Experience the most advanced training system designed for results.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={onStart}
                className="px-8 py-4 rounded-2xl bg-[var(--red)] text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[var(--red)]/30 flex items-center gap-3"
              >
                Start Workout
                <ArrowRight size={20} />
              </button>
              <a 
                href="#features"
                className="px-8 py-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)] text-white font-black uppercase tracking-widest hover:border-[var(--red)] transition-all flex items-center gap-3"
              >
                Explore Features
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[var(--red)]/20 rounded-full blur-[120px] -z-10" />
            <div className="relative rounded-[40px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop" 
                alt="Fitness App Preview" 
                className="rounded-[32px] w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--red)] flex items-center justify-center text-white shadow-lg">
                    <Play fill="currentColor" size={20} />
                  </div>
                  <div>
                    <div className="text-white font-black uppercase tracking-widest text-sm">Active Session</div>
                    <div className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest">Chest & Shoulders</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--red)] font-black text-2xl tracking-tighter">12:45</div>
                  <div className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest">Time Elapsed</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-[var(--sub)]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Engineered for <span className="text-[var(--red)]">Performance</span></h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">Everything you need to transform your body and mind, all in one powerful application.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--red)]/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--sub)] border border-[var(--border)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{feature.title}</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Muscle Interaction Preview */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-[var(--red)]/10 rounded-full blur-[100px]" />
              <div className="grid grid-cols-2 gap-4 relative">
                {['Chest', 'Back', 'Legs', 'Shoulders'].map((m) => (
                  <div key={m} className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] text-center space-y-4 hover:border-[var(--red)] transition-all cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-[var(--sub)] mx-auto flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      💪
                    </div>
                    <div className="font-black uppercase tracking-widest text-xs">{m}</div>
                    <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-[var(--red)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 order-1 lg:order-2"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Train Smarter by <br />
              <span className="text-[var(--red)]">Targeting Muscles</span>
            </h2>
            <p className="text-xl text-[var(--muted)] leading-relaxed">
              Our interactive muscle visualizer helps you understand exactly which muscle groups you're training. Select a zone, get the exercises, and track your recovery.
            </p>
            <button 
              onClick={onStart}
              className="px-8 py-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)] text-white font-black uppercase tracking-widest hover:border-[var(--red)] transition-all flex items-center gap-3"
            >
              Try Visualizer
              <ChevronRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Workout Flow */}
      <section className="py-32 px-6 bg-[var(--sub)]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">How it <span className="text-[var(--red)]">Works</span></h2>
            <p className="text-[var(--muted)]">Four simple steps to start your transformation.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-full h-[2px] bg-gradient-to-r from-[var(--red)] to-transparent -translate-y-1/2 z-0" />
                )}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative z-10 p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] text-center space-y-6 group-hover:border-[var(--red)] transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[var(--red)] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-[var(--red)]/20">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-widest">{step.title}</h3>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress Preview */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Track Your Growth <br />
              <span className="text-[var(--red)]">Like a Pro</span>
            </h2>
            <p className="text-xl text-[var(--muted)] leading-relaxed">
              Visualize your progress with high-fidelity charts. Monitor your weight, track workout consistency, and celebrate every personal record.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
                <div className="text-[var(--red)] font-black text-3xl tracking-tighter">12%</div>
                <div className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest">Weight Loss</div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--sub)] border border-[var(--border)]">
                <div className="text-[var(--green)] font-black text-3xl tracking-tighter">+24</div>
                <div className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest">Workouts</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-[40px] bg-[var(--card)] border border-[var(--border)] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--red)]/5 to-transparent" />
            <div className="relative space-y-8">
              <div className="flex items-center justify-between">
                <div className="font-black uppercase tracking-widest text-sm">Weight Progress</div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--red)]" />
                  <div className="w-2 h-2 rounded-full bg-[var(--border)]" />
                </div>
              </div>
              <div className="h-48 flex items-end gap-2">
                {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className="flex-1 bg-gradient-to-t from-[var(--red)] to-[var(--red)]/40 rounded-t-lg"
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Coach Section */}
      <section id="ai-coach" className="py-32 px-6 bg-[var(--sub)]/30">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] self-start max-w-[80%]">
                <p className="text-sm">How's my form on the last set?</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--red)] text-white self-end ml-auto max-w-[80%] shadow-lg shadow-[var(--red)]/20">
                <p className="text-sm font-bold">Your pace was perfect! Keep that intensity for the next set. Push harder 💪</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] self-start max-w-[80%]">
                <p className="text-sm">I'm feeling tired...</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--red)] text-white self-end ml-auto max-w-[80%] shadow-lg shadow-[var(--red)]/20">
                <p className="text-sm font-bold">You're doing great 🔥 Almost there! Don't quit now.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 order-1 lg:order-2"
          >
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase leading-none">
              Your Personal <br />
              <span className="text-[var(--red)]">AI Coach</span>
            </h2>
            <p className="text-xl text-[var(--muted)] leading-relaxed">
              Never train alone again. Our AI Coach provides real-time motivation, form tips, and personalized encouragement during every session.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-[var(--bg)] bg-[var(--card)] overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-bold">
                <span className="text-[var(--red)]">10,000+</span> Champions Motivated
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto p-12 md:p-20 rounded-[40px] bg-gradient-to-br from-[var(--red)] to-[#800000] text-center space-y-10 relative overflow-hidden shadow-[0_0_100px_rgba(229,9,20,0.2)]"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase leading-none text-white">
              Ready to Transform <br /> Your Body?
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join thousands of others who have already leveled up their fitness. Start your journey today for free.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <button 
                onClick={onStart}
                className="px-10 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                Start Now
              </button>
              <button 
                onClick={onStart}
                className="px-10 py-5 rounded-2xl bg-black text-white font-black uppercase tracking-widest hover:bg-black/80 transition-all border border-white/20"
              >
                Join LevelUp
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-[var(--border)] bg-[var(--sub)]/20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Logo className="h-8" />
              <span className="font-black text-xl tracking-tighter uppercase">Level<span className="text-[var(--red)]">Up</span></span>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              The most advanced fitness tracking and AI coaching platform designed to help you reach your peak performance.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--red)] hover:border-[var(--red)] transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--red)] hover:border-[var(--red)] transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--red)] hover:border-[var(--red)] transition-all">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-[var(--muted)]">
              <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#workouts" className="hover:text-white transition-colors">Workouts</a></li>
              <li><a href="#ai-coach" className="hover:text-white transition-colors">AI Coach</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-[var(--muted)]">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-6">Newsletter</h4>
            <p className="text-sm text-[var(--muted)] mb-4">Get fitness tips and app updates.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--red)] transition-all"
              />
              <button className="p-2 rounded-xl bg-[var(--red)] text-white hover:brightness-110 transition-all">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[var(--border)] text-center text-[var(--muted)] text-xs">
          © 2026 LevelUp Fitness. All rights reserved. Built for Champions.
        </div>
      </footer>
    </div>
  );
}
