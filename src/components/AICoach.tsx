import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';
import { 
  Send, Bot, User, Mic, MicOff, Loader2, Sparkles, BrainCircuit,
  Dumbbell, Utensils, Flame, TrendingUp, Calendar, Zap, RefreshCw, 
  Scale, ChevronRight, Apple, Info, ShieldCheck, ClipboardList, Clock, Brain
} from 'lucide-react';
import Markdown from 'react-markdown';
import AICoachRobot, { CoachRobotMode } from './AICoachRobot';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AICoachProps {
  userName: string;
  userProfile: any;
  workoutData?: any;
}

const PRESET_WORKOUTS: Record<string, any[]> = {
  loss: [
    { day: "Monday", focus: "Push (Chest/Triceps)", rest: false, type: "Strength", exercises: [
      { name: "Incline Barbell Bench Press", sets: "4", reps: "8-10", rest: "90s" },
      { name: "Dumbbell Shoulder Press", sets: "3", reps: "10-12", rest: "75s" },
      { name: "Weighted Chest Dips", sets: "3", reps: "10", rest: "60s" },
      { name: "Overhead Tricep Extension", sets: "3", reps: "12", rest: "60s" },
      { name: "High Incline Cardio Walk", sets: "1", reps: "15 mins", rest: "0s" }
    ]},
    { day: "Tuesday", focus: "Pull (Back/Biceps)", rest: false, type: "Strength", exercises: [
      { name: "Deadlift (Heavy)", sets: "3", reps: "5", rest: "120s" },
      { name: "Weighted Pull-Ups", sets: "4", reps: "6-8", rest: "90s" },
      { name: "One Arm Dumbbell Row", sets: "3", reps: "10-12", rest: "75s" },
      { name: "Incline Hammer Curl", sets: "3", reps: "12", rest: "60s" }
    ]},
    { day: "Wednesday", focus: "Rest & Active Walk", rest: true, type: "Rest", exercises: [] },
    { day: "Thursday", focus: "Legs (Lower Body)", rest: false, type: "Strength", exercises: [
      { name: "Heavy Barbell Squats", sets: "4", reps: "6-8", rest: "120s" },
      { name: "Romanian Deadlift", sets: "4", reps: "10", rest: "90s" },
      { name: "Bulgarian Split Squats", sets: "3", reps: "10/leg", rest: "75s" },
      { name: "Seated Calf Raises", sets: "4", reps: "15", rest: "60s" }
    ]},
    { day: "Friday", focus: "Metabolic HIIT Burner", rest: false, type: "HIIT", exercises: [
      { name: "Kettlebell Swings", sets: "4", reps: "20", rest: "45s" },
      { name: "Dumbbell Thrusters", sets: "4", reps: "12", rest: "45s" },
      { name: "Burpees", sets: "4", reps: "10", rest: "45s" },
      { name: "Plank Shoulder Taps", sets: "3", reps: "1 min", rest: "30s" }
    ]},
    { day: "Saturday", focus: "LISS Cardio & Core", rest: false, type: "Cardio", exercises: [
      { name: "Incline Treadmill Walk", sets: "1", reps: "30 mins", rest: "0s" },
      { name: "Hanging Leg Raises", sets: "3", reps: "15", rest: "60s" },
      { name: "Ab Wheel Rollouts", sets: "3", reps: "12", rest: "60s" }
    ]},
    { day: "Sunday", focus: "Active Recovery Rest", rest: true, type: "Rest", exercises: [] }
  ],
  gain: [
    { day: "Monday", focus: "Push (Heavy Chest Focus)", rest: false, type: "Strength", exercises: [
      { name: "Barbell Bench Press", sets: "4", reps: "6-8", rest: "120s" },
      { name: "Incline Dumbbell Press", sets: "4", reps: "8-10", rest: "90s" },
      { name: "Dumbbell Lateral Raises", sets: "4", reps: "12-15", rest: "60s" },
      { name: "Skull Crushers", sets: "3", reps: "10", rest: "75s" }
    ]},
    { day: "Tuesday", focus: "Pull (Heavy Back Thickness)", rest: false, type: "Strength", exercises: [
      { name: "Conventional Deadlifts", sets: "4", reps: "5", rest: "150s" },
      { name: "Barbell Rows", sets: "4", reps: "6-8", rest: "90s" },
      { name: "Close Grip Lat Pulldown", sets: "3", reps: "10", rest: "75s" },
      { name: "Barbell Bicep Curls", sets: "3", reps: "10", rest: "60s" }
    ]},
    { day: "Wednesday", focus: "Mid-Week Recovery", rest: true, type: "Rest", exercises: [] },
    { day: "Thursday", focus: "Legs (Quad & Calves Heavy)", rest: false, type: "Strength", exercises: [
      { name: "Heavy Squats", sets: "5", reps: "5", rest: "150s" },
      { name: "Leg Press (High Volume)", sets: "4", reps: "12", rest: "90s" },
      { name: "Leg Curls", sets: "3", reps: "12", rest: "60s" },
      { name: "Standing Calf Raises", sets: "4", reps: "15", rest: "60s" }
    ]},
    { day: "Friday", focus: "Shoulders & Arms Volume", rest: false, type: "Strength", exercises: [
      { name: "Overhead Barbell Press", sets: "4", reps: "6-8", rest: "90s" },
      { name: "Incline Dumbbell Bicep Curl", sets: "3", reps: "10", rest: "60s" },
      { name: "Rope Tricep Pushdowns", sets: "3", reps: "12", rest: "60s" },
      { name: "Cable Lateral Raises", sets: "3", reps: "15", rest: "45s" }
    ]},
    { day: "Saturday", focus: "Posterior Chain / Active Rest", rest: false, type: "Strength", exercises: [
      { name: "Romanian Deadlifts", sets: "4", reps: "8", rest: "90s" },
      { name: "Weighted Pull-Ups", sets: "3", reps: "8", rest: "90s" },
      { name: "Decline Weighted Crunches", sets: "3", reps: "15", rest: "60s" }
    ]},
    { day: "Sunday", focus: "CNS Sleep Recovery", rest: true, type: "Rest", exercises: [] }
  ],
  maintain: [
    { day: "Monday", focus: "Full Body Compound", rest: false, type: "Strength", exercises: [
      { name: "Barbell Back Squats", sets: "4", reps: "8", rest: "90s" },
      { name: "Dumbbell Bench Press", sets: "4", reps: "8", rest: "90s" },
      { name: "Pull-Ups", sets: "3", reps: "8-10", rest: "75s" },
      { name: "Dumbbell Hammer Curls", sets: "3", reps: "12", rest: "60s" }
    ]},
    { day: "Tuesday", focus: "Steady State LISS", rest: false, type: "Cardio", exercises: [
      { name: "Steady Jog / Elliptical", sets: "1", reps: "30 mins", rest: "0s" },
      { name: "Plank Hold", sets: "3", reps: "1 min", rest: "45s" }
    ]},
    { day: "Wednesday", focus: "Active Stretching Rest", rest: true, type: "Rest", exercises: [] },
    { day: "Thursday", focus: "Upper Body Hypertrophy", rest: false, type: "Strength", exercises: [
      { name: "Incline Barbell Press", sets: "4", reps: "10", rest: "75s" },
      { name: "Seated Cable Rows", sets: "4", reps: "10", rest: "75s" },
      { name: "Overhead Dumbbell Extension", sets: "3", reps: "12", rest: "60s" },
      { name: "Lateral Raises", sets: "3", reps: "15", rest: "45s" }
    ]},
    { day: "Friday", focus: "Lower Body / Core", rest: false, type: "Strength", exercises: [
      { name: "Leg Press", sets: "4", reps: "10", rest: "90s" },
      { name: "Romanian Deadlift", sets: "4", reps: "10", rest: "90s" },
      { name: "Hanging Knee Raises", sets: "3", reps: "15", rest: "60s" }
    ]},
    { day: "Saturday", focus: "HIIT Cardio Conditioning", rest: false, type: "HIIT", exercises: [
      { name: "Kettlebell Swings", sets: "3", reps: "15", rest: "30s" },
      { name: "Burpees", sets: "3", reps: "10", rest: "30s" },
      { name: "Mountain Climbers", sets: "3", reps: "30s", rest: "30s" }
    ]},
    { day: "Sunday", focus: "Clean Mind Mindfulness Rest", rest: true, type: "Rest", exercises: [] }
  ]
};

export default function AICoach({ userName, userProfile, workoutData }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `vanakkam ${userName}! I'm your **LEVELUP** AI elite coach. I've analyzed your ${userProfile.gender || 'male'} profile. Let's optimize your ${userProfile.goal || 'fitness'} journey! How can I help you today? ⚡` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [robotMode, setRobotMode] = useState<CoachRobotMode>('greeting');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeCoachTab, setActiveCoachTab] = useState<'chat' | 'summary'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Storage synced states to dynamically get the user's latest plan
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('lvProfile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: userName || userProfile.name || 'Champion',
      age: userProfile.age || 24,
      gender: userProfile.gender || 'male',
      weight: userProfile.weight || 75,
      height: userProfile.height || 175,
      goal: userProfile.goal || 'loss',
      level: userProfile.level || 'beginner'
    };
  });

  const [schedulerPlan, setSchedulerPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('lvl_scheduler_plan');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return PRESET_WORKOUTS[profile.goal || 'loss'] || PRESET_WORKOUTS['loss'];
  });

  const [sakthiMultiplier, setSakthiMultiplier] = useState(() => {
    try {
      const saved = localStorage.getItem('lvl_multiplier');
      if (saved) return Number(saved);
    } catch (e) {}
    return profile.goal === 'loss' ? 11 : (profile.goal === 'gain' ? 17 : 14);
  });

  // Keep synced with any localStorage updates (synchronized dynamically)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedProfile = localStorage.getItem('lvProfile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setProfile(parsed);
          const savedPlan = localStorage.getItem('lvl_scheduler_plan');
          if (savedPlan) {
            setSchedulerPlan(JSON.parse(savedPlan));
          } else {
            setSchedulerPlan(PRESET_WORKOUTS[parsed.goal || 'loss'] || PRESET_WORKOUTS['loss']);
          }
          const savedMult = localStorage.getItem('lvl_multiplier');
          if (savedMult) {
            setSakthiMultiplier(Number(savedMult));
          } else {
            setSakthiMultiplier(parsed.goal === 'loss' ? 11 : (parsed.goal === 'gain' ? 17 : 14));
          }
        }
      } catch (e) {
        console.error('Failed to sync storage', e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also trigger on mount to make sure we have the latest
    handleStorageChange();
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Transition initial greeting back to idle after a delay
  useEffect(() => {
    if (robotMode === 'greeting' && !isSpeaking) {
      const timer = setTimeout(() => {
        setRobotMode('idle');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [robotMode, isSpeaking]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, activeCoachTab]);

  useEffect(() => {
    if (isLoading) {
      setRobotMode('thinking');
    } else if (isRecording) {
      setRobotMode('listening');
    } else if (isSpeaking) {
      setRobotMode('greeting');
    } else {
      setRobotMode('idle');
    }
  }, [isLoading, isRecording, isSpeaking]);

  // Calorie & dynamic macros calculations
  const sakthiCalories = Math.round((profile.weight || 75) * 2.2 * sakthiMultiplier);
  const proteinGrams = Math.round((profile.weight || 75) * 2.2);
  const proteinCalories = proteinGrams * 4;
  const fatCalories = Math.round(sakthiCalories * 0.22);
  const fatGrams = Math.round(fatCalories / 9);
  const remainingCalories = sakthiCalories - proteinCalories - fatCalories;
  const carbGrams = Math.max(20, Math.round(remainingCalories / 4));

  const mealCalculations = {
    breakfast: {
      cals: Math.round(sakthiCalories * 0.25),
      prot: Math.round(proteinGrams * 0.25),
      carbs: Math.round(carbGrams * 0.25),
      fats: Math.round(fatGrams * 0.25),
      time: "08:30 AM",
      recommendations: profile.goal === 'loss' 
        ? ["3 Whole Eggs boiled", "60g dry Oats cooked in water", "1 medium Banana", "10 Almonds"]
        : profile.goal === 'gain'
        ? ["4 Whole Eggs scrambled", "80g dry Oats in double toned milk", "1 large Banana", "15 Cashews"]
        : ["3 Whole Eggs scrambled", "70g dry Oats cooked in half-milk half-water", "1 medium Banana", "12 Almonds"]
    },
    lunch: {
      cals: Math.round(sakthiCalories * 0.35),
      prot: Math.round(proteinGrams * 0.35),
      carbs: Math.round(carbGrams * 0.35),
      fats: Math.round(fatGrams * 0.35),
      time: "01:30 PM",
      recommendations: profile.goal === 'loss'
        ? ["150g raw weighed White Rice cooked", "150g Skinless Chicken Breast or 150g Grilled Tofu", "150g Fresh Curd / Yogurt", "Salad bowl"]
        : profile.goal === 'gain'
        ? ["200g raw weighed White Rice cooked", "200g Skinless Chicken Breast or 200g Paneer/Soy Chunks", "200g Fresh Curd with 1 tsp Desi Ghee", "Salad"]
        : ["170g raw weighed White Rice cooked", "170g Skinless Chicken Breast or 170g Grilled Tofu/Paneer", "170g Fresh Curd", "Mixed salad"]
    },
    snack: {
      cals: Math.round(sakthiCalories * 0.15),
      prot: Math.round(proteinGrams * 0.15),
      carbs: Math.round(carbGrams * 0.15),
      fats: Math.round(fatGrams * 0.15),
      time: "05:30 PM",
      recommendations: profile.goal === 'loss'
        ? ["1 scoop Whey Protein in water", "100g Boiled Sweet Potato", "15g Pumpkin Seeds"]
        : profile.goal === 'gain'
        ? ["1 scoop Whey Protein in 250ml milk", "150g Boiled Sweet Potato", "30g Peanuts", "1 whole Apple"]
        : ["1 scoop Whey Protein in water", "120g Boiled Sweet Potato", "20g Almonds"]
    },
    dinner: {
      cals: Math.round(sakthiCalories * 0.25),
      prot: Math.round(proteinGrams * 0.25),
      carbs: Math.round(carbGrams * 0.25),
      fats: Math.round(fatGrams * 0.25),
      time: "08:30 PM",
      recommendations: profile.goal === 'loss'
        ? ["2 Wheat Roti", "150g Paneer cooked or Grilled Fish", "1 tsp Olive Oil", "Steamed broccoli / veggies"]
        : profile.goal === 'gain'
        ? ["3 Wheat Roti", "200g Paneer cooked or Grilled Fish", "1.5 tbsp Desi Ghee / Olive Oil", "Mixed vegetable curry"]
        : ["2.5 Wheat Roti", "170g Paneer cooked or Grilled Fish", "1 tbsp Desi Ghee / Olive Oil", "Salad & Veggies"]
    }
  };

  const handleSend = async (overrideMsg?: string | React.MouseEvent | React.KeyboardEvent) => {
    let finalMsg = '';
    if (typeof overrideMsg === 'string') {
      finalMsg = overrideMsg;
    } else {
      finalMsg = input.trim();
    }
    
    if (!finalMsg || isLoading) return;

    if (typeof overrideMsg !== 'string') setInput('');
    setMessages(prev => [...prev, { role: 'user', content: finalMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const isTamil = document.documentElement.dataset.tamil === 'true';
      const tamilConstraint = isTamil 
        ? "\n8. TAMIL MODE ENABLED: Interject Tamil punchlines in Roman script (e.g., 'Idhu gym illa da… battlefield!', 'Na ready... nee ready ah?', 'Veri kondu aadu!', 'Semma mass panni vidu'). Use these naturally. Keep core advice in English but wrap it in heavy Tamil mass-style motivation."
        : "";

      // Format recent workout activity if available
      let recentActivityContext = "No recent workouts logged.";
      if (workoutData && Object.keys(workoutData).length > 0) {
        const sortedDates = Object.keys(workoutData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const recentDate = sortedDates[0];
        const recentWorkouts = workoutData[recentDate];
        const musclesWorked = Array.from(new Set(recentWorkouts.map((w: any) => w.muscle))).join(', ');
        recentActivityContext = `Recent Workout on ${recentDate}: Focused on ${musclesWorked}.`;
      }

      const systemPrompt = `You are LEVELUP – an elite Indian Personal Trainer & Nutrition Expert. 
User Context: Name=${userName}, Gender=${userProfile.gender || 'male'}, Goal=${userProfile.goal || 'maintain'}, Weight=${userProfile.weight || 'unknown'}kg.
Recent Activity: ${recentActivityContext}

MISSION:
1. Provide ultra-precise fitness advice tailored to ${userName}'s profile and recent activity.
2. Structure workouts (Push/Pull/Legs, Upper/Lower, etc.) with sets/reps/rest. If generating a plan, consider what muscles they recently worked so they don't overtrain.
3. Track nutrition—especially Indian meals (Biryani, Poha, Roti, etc.)—and estimate macros.
4. If the user mentions gender or theme, acknowledge it (Male=Red/Strong vibe, Female=Pink/Purple/Flow vibe).
5. MEN'S DISCIPLINE & SELF-MASTERY SUPPORT: If the user mentions struggling, scrolling addictions, toxic media, or lapses in self-control, act as a compassionate, non-shaming behavioral mentor. Validate their challenges, focus on small wins, provide constructive habits to trigger instead (such as simple physical work, reading, or box breathing), and guide them with high-respect encouragement.
6. Always address the user as ${userName}.
7. Use professional formatting: bold headings, tables for workouts/diet, and bullet points.
8. Tone: High-energy, knowledgeable, motivating, supportive, respectful, and disciplined.${tamilConstraint}

FORMATTING (CRITICAL):
- You MUST use Markdown tables to present ALL workout plans (Columns: Exercise | Sets | Reps | Rest).
- You MUST use Markdown tables to present ALL diet/meal plans (Columns: Meal | Food | Calories | Protein).
- Use **bold headings** for different sections.
- Keep responses concise, structured, and information-dense.
- Always end with a short motivational punchline using the user's name!`;

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const result = await chat.sendMessage({
        message: finalMsg
      });
      
      const text = result.text;
      setMessages(prev => [...prev, { role: 'assistant', content: text || "Mission accomplished! Keep the fire burning!" }]);
      
      // Trigger voice waves / speaking companion animation
      setIsSpeaking(true);
      setTimeout(() => {
        setIsSpeaking(false);
      }, 7000);
    } catch (error) {
      console.error('AI Coach Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Champion, my uplink is shaky! But discipline doesn't need a connection. Keep up the intensity and retry in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceChat = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('Voice activation is unavailable in this environment.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recog = new SR();
    recog.lang = 'en-IN';
    recog.continuous = false;
    recog.interimResults = true;

    recog.onstart = () => setIsRecording(true);
    recog.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setInput(t);
    };
    recog.onend = () => {
      setIsRecording(false);
      if (input.trim()) handleSend();
    };
    recog.onerror = () => setIsRecording(false);
    recog.start();
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[var(--bg)]">
      {/* AI Header */}
      <div className="p-5 border-b border-[var(--border)] bg-[var(--card2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl flex items-center justify-center relative group border border-white/10 overflow-visible shrink-0">
            <AICoachRobot mode={robotMode} size={56} />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[var(--green)] rounded-full border-2 border-black" />
          </div>
          <div>
            <h3 className="tab-heading text-base leading-none">LEVELUP AI Companion</h3>
            <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
              <Sparkles size={9} className="text-[var(--yellow)] animate-pulse" />
              Elite Personalized Intelligence
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-[var(--sub)] rounded-full border border-[var(--border)] shrink-0">
           <div className="w-2 h-2 bg-[var(--green)] rounded-full animate-pulse" />
           <span className="text-[8px] font-black uppercase tracking-widest">Neural Link Active</span>
        </div>
      </div>

      {/* Segmented Controller Tab Switcher */}
      <div className="px-5 py-2.5 border-b border-[var(--border)] bg-[var(--card2)]/50 flex justify-center">
        <div className="bg-neutral-900/80 p-1 rounded-xl border border-white/5 w-full max-w-md flex">
          <button
            id="coach-tab-chat"
            onClick={() => setActiveCoachTab('chat')}
            className={cn(
              "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5",
              activeCoachTab === 'chat' 
                ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md shadow-red-600/10" 
                : "text-[var(--muted)] hover:text-white hover:bg-white/5"
            )}
          >
            <BrainCircuit size={13} />
            💬 AI Chat Coach
          </button>
          <button
            id="coach-tab-summary"
            onClick={() => setActiveCoachTab('summary')}
            className={cn(
              "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5",
              activeCoachTab === 'summary' 
                ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md shadow-red-600/10" 
                : "text-[var(--muted)] hover:text-white hover:bg-white/5"
            )}
          >
            <ClipboardList size={13} />
            📋 Active Plan Summary
          </button>
        </div>
      </div>

      {/* Main Container Switch */}
      {activeCoachTab === 'chat' ? (
        <>
          {/* Chat Space */}
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20"
          >
            {messages.map((m, i) => (
              <div key={i} className={cn("flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300", m.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] sm:max-w-[75%] p-5 rounded-3xl text-sm leading-relaxed",
                  m.role === 'user' 
                    ? "bg-[var(--accent)] text-white rounded-br-none shadow-xl shadow-[var(--accent-glow)]/10" 
                    : "bg-[var(--card)] text-white border border-[var(--border)] rounded-bl-none shadow-sm"
                )}>
                  <div className="markdown-body prose prose-invert prose-xs max-w-none">
                    <Markdown>{m.content}</Markdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-3xl rounded-bl-none shadow-sm flex items-center gap-3 text-[var(--muted)] text-xs font-black uppercase tracking-widest">
                  <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
                  Coach Calculating...
                </div>
              </div>
            )}
          </div>

          {/* Suggested Actions */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-6 flex flex-wrap gap-2 justify-center -mb-2 mt-2 relative z-10">
              <button 
                id="suggested-action-workout"
                onClick={() => {
                   const tamil = document.documentElement.dataset.tamil === 'true';
                   handleSend(tamil ? 'Enakku oru nalla personalized workout plan kodu.' : 'Generate a personalized workout plan based on my profile.');
                }}
                className="px-4 py-2 bg-[var(--card)] border border-[var(--accent)] text-[var(--accent)] text-[11px] font-bold uppercase tracking-wider rounded-full hover:bg-[var(--accent)] hover:text-white transition-all shadow-sm cursor-pointer"
              >
                Workout Plan
              </button>
              <button 
                id="suggested-action-diet"
                onClick={() => {
                   const tamil = document.documentElement.dataset.tamil === 'true';
                   handleSend(tamil ? 'Oru high-protein Indian diet plan suggest pannu.' : 'Suggest a high-protein Indian diet plan.');
                }}
                className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] text-[11px] font-bold uppercase tracking-wider rounded-full hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm cursor-pointer"
              >
                Diet Plan
              </button>
            </div>
          )}

          {/* Input Zone */}
          <div className="p-6 bg-[var(--card2)] border-t border-[var(--border)]">
            <div className="flex gap-3 items-center max-w-3xl mx-auto">
              <button 
                id="mic-voice-toggle"
                onClick={toggleVoiceChat}
                className={cn(
                  "w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all group shrink-0 cursor-pointer",
                  isRecording 
                    ? "bg-[#1a0000] border-[var(--red)] text-[var(--red)] shadow-[0_0_20px_var(--red)] animate-pulse" 
                    : "bg-[var(--sub)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                )}
                title="Voice Input"
              >
                {isRecording ? <Mic size={24} /> : <MicOff size={24} className="group-hover:scale-110 transition-transform" />}
              </button>
              
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Track meal, plan workout, or ask for advice..." 
                  className="w-full h-14 pl-5 pr-14 rounded-2xl bg-[var(--sub)] border border-[var(--border)] text-white text-sm outline-none focus:border-[var(--accent)] transition-all font-medium placeholder:text-white/20"
                />
                <button 
                  id="send-message-btn"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 cursor-pointer"
                >
                  <Send size={18} className="translate-x-0.5" />
                </button>
              </div>
            </div>
            {isRecording && (
              <div className="text-[10px] text-[var(--red)] font-black uppercase tracking-[0.3em] text-center mt-3 animate-pulse">
                 Neural Link Syncing... Speak Clear
              </div>
            )}
          </div>
        </>
      ) : (
        /* Plan Summary View */
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/30">
          
          {/* Active Fitness Profile Card */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20 shadow-md">
                <Scale size={22} />
              </div>
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">ACTIVE PROFILE ARCHITECTURE</span>
                <h4 className="text-lg font-display font-black text-white uppercase italic mt-1">{profile.name} • {profile.weight} kg</h4>
                <p className="text-[10px] text-[var(--muted)] uppercase font-semibold leading-none mt-0.5">
                  Goal: <span className="text-white font-bold">{profile.goal?.toUpperCase()}</span> | Level: <span className="text-white font-bold">{profile.level?.toUpperCase()}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 z-10 bg-black/40 px-4 py-3 rounded-xl border border-white/5 justify-between">
              <div>
                <span className="text-[8px] font-black text-neutral-400 uppercase tracking-wider block">SAKTHI ALAVU TARGET</span>
                <span className="text-xl font-display font-black text-emerald-400 tracking-tight">{sakthiCalories} <span className="text-[10px] text-white">KCAL</span></span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="text-[8px] font-black text-neutral-400 uppercase tracking-wider block">DAILY PROTEIN</span>
                <span className="text-xl font-display font-black text-cyan-400 tracking-tight">{proteinGrams}<span className="text-[10px] text-white">G</span></span>
              </div>
            </div>
          </div>

          {/* Quick Informational Toast */}
          <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 flex items-start gap-3">
            <Info size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Below is your <strong className="text-white">live generated split & diet profile</strong>. This overview synchronizes instantly when you adjust your targets in the <strong className="text-white">🏋️ LevelUp Strategist (Planner)</strong> tab. Use this to easily check targets.
            </p>
          </div>

          {/* Two-Column split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMN 1: WORKOUT SPLIT LIST */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Calendar size={18} className="text-red-500 shrink-0" />
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">Weekly Training Split</h3>
              </div>
              
              <div className="space-y-3">
                {schedulerPlan.map((day, dIdx) => (
                  <div key={day.day || dIdx} className="bg-neutral-900/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-red-500 uppercase tracking-wider">{day.day}</span>
                        <span className={cn(
                          "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest",
                          day.type === 'Strength' ? "bg-red-500/10 text-red-400 border border-red-500/15" :
                          day.type === 'HIIT' ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
                          day.type === 'Cardio' ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" :
                          "bg-white/5 text-neutral-400 border border-white/5"
                        )}>
                          {day.type || (day.rest ? "Rest" : "Workout")}
                        </span>
                      </div>
                      {day.rest ? (
                        <span className="text-[8px] font-black bg-white/5 text-neutral-400 py-0.5 px-2 rounded tracking-widest uppercase">RECOVERY</span>
                      ) : (
                        <span className="text-[8px] font-black bg-red-500/10 text-red-400 py-0.5 px-2 rounded tracking-widest uppercase flex items-center gap-1">
                          <Flame size={8} /> ACTIVE
                        </span>
                      )}
                    </div>
                    
                    <h5 className="text-sm font-bold text-white uppercase mb-1.5">{day.focus}</h5>
                    
                    {!day.rest && day.exercises && day.exercises.length > 0 ? (
                      <ul className="space-y-1.5 pl-1">
                        {day.exercises.map((ex: any, exIdx: number) => (
                          <li key={exIdx} className="text-xs text-neutral-400 flex items-start gap-1.5">
                            <span className="text-red-500 text-[10px] mt-0.5">•</span>
                            <div>
                              <span className="text-white font-medium">{ex.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono ml-2">
                                {ex.sets} sets × {ex.reps} reps (Rest: {ex.rest})
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : day.rest ? (
                      <p className="text-xs text-neutral-500 italic">No exercises scheduled. Focus on Box Breathing & Active Walk recovery.</p>
                    ) : (
                      <p className="text-xs text-neutral-500 italic">Empty routine. Go to Planner tab to add custom exercises.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: DIET PLAN LIST */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Utensils size={18} className="text-emerald-500 shrink-0" />
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">Daily Diet Plan & Fuel Split</h3>
              </div>

              {/* Macro breakdown overview */}
              <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-neutral-950/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block">PROTEIN</span>
                  <span className="text-base font-display font-black text-white">{proteinGrams}g</span>
                  <span className="text-[8px] text-neutral-500 block font-semibold mt-0.5">{proteinCalories} Kcal</span>
                </div>
                <div className="bg-neutral-950/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">CARBS</span>
                  <span className="text-base font-display font-black text-white">{carbGrams}g</span>
                  <span className="text-[8px] text-neutral-500 block font-semibold mt-0.5">{carbGrams * 4} Kcal</span>
                </div>
                <div className="bg-neutral-950/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block">FATS</span>
                  <span className="text-base font-display font-black text-white">{fatGrams}g</span>
                  <span className="text-[8px] text-neutral-500 block font-semibold mt-0.5">{fatCalories} Kcal</span>
                </div>
              </div>

              {/* Meal List */}
              <div className="space-y-3">
                {(Object.keys(mealCalculations) as Array<keyof typeof mealCalculations>).map((mealKey) => {
                  const meal = mealCalculations[mealKey];
                  return (
                    <div key={mealKey} className="bg-neutral-900/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-500 uppercase tracking-wider capitalize">{mealKey}</span>
                          <span className="text-[9px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded font-mono flex items-center gap-1 border border-white/5">
                            <Clock size={10} />
                            {meal.time}
                          </span>
                        </div>
                        <span className="text-xs font-display font-black text-white">{meal.cals} Kcal</span>
                      </div>
                      
                      <div className="text-[10px] text-neutral-500 font-mono mb-2 flex gap-3">
                        <span>P: <strong className="text-neutral-300">{meal.prot}g</strong></span>
                        <span>C: <strong className="text-neutral-300">{meal.carbs}g</strong></span>
                        <span>F: <strong className="text-neutral-300">{meal.fats}g</strong></span>
                      </div>

                      <div className="bg-black/25 rounded-lg p-2.5 border border-white/[0.03]">
                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Elite Ingredients Suggestion</span>
                        <ul className="space-y-1">
                          {meal.recommendations.map((food, fIdx) => (
                            <li key={fIdx} className="text-xs text-neutral-300 flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                              {food}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Bottom Motivating Callout Card */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h5 className="text-xs font-black uppercase text-white tracking-wider">Dynamic Execution Protocol</h5>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-1">Discipline and Consistency Over Everything</p>
              </div>
            </div>
            <button
              onClick={() => setActiveCoachTab('chat')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-display font-black text-[9px] uppercase tracking-widest text-neutral-950 rounded-lg active:scale-95 transition-all shadow-md shadow-emerald-500/10 cursor-pointer self-start sm:self-auto"
            >
              Back to Coach Chat
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
