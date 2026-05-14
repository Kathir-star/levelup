import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QUOTES, TAMIL_QUOTES } from "../../constants";

/* =========================
   💪 WORKOUT QUOTES
========================= */

const WORKOUT_QUOTES: Record<string, string[]> = {
  legs: [
    "Skipping legs? Weak.",
    "You either squat… or you stay small.",
    "Leg day is war. Survivors become legends 😈",
    "If you can walk after leg day, you didn’t train hard enough.",
    "Leg pain today, power tomorrow."
  ],
  push: [
    "Push till failure 💪",
    "Push beyond limits. That’s where growth begins.",
    "Chest day = confidence day.",
    "Every push builds power."
  ],
  pull: [
    "Pull your limits closer and break them.",
    "Back day builds the real strength behind you.",
    "Strong back, stronger mindset."
  ]
};

const TAMIL_WORKOUT_QUOTES: Record<string, string[]> = {
  legs: [
    "Leg day illa da ithu yuddham! 😈",
    "Kaal valithal dhan nejamana mass.",
    "Workout mudichutu nadunghura kaal dhan gethu."
  ],
  push: [
    "Thallu... innum thallu! Growth angadhan irukku.",
    "Nenju nimirndhu nillu.",
    "Power aana push, vera level progress."
  ],
  pull: [
    "Izhuthu vachi sei!",
    "Pinnaadi irukkura strength ah kaatu.",
    "Veri kondu izhu thalaiva!"
  ]
};

/* =========================
   🧠 DAILY QUOTE LOGIC
========================= */

const getDailyQuote = (isTamil: boolean): string => {
  const sourceQuotes = isTamil ? TAMIL_QUOTES : QUOTES;
  
  // To keep it "daily" but responsive to tamil changes, we don't cache locally in this simple implementation,
  // or we cache it with a prefix.
  const today = new Date().toDateString();
  const cacheKey = isTamil ? "dailyQuote_tamil" : "dailyQuote";
  const stored = localStorage.getItem(cacheKey);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        return parsed.quote;
      }
    } catch (e) {
      // Ignore
    }
  }

  const randomQuote = sourceQuotes[Math.floor(Math.random() * sourceQuotes.length)];

  localStorage.setItem(
    cacheKey,
    JSON.stringify({ date: today, quote: randomQuote })
  );

  return randomQuote;
};

/* =========================
   💪 WORKOUT QUOTE LOGIC
========================= */

const getWorkoutQuote = (isTamil: boolean, type?: string): string => {
  if (!type) return "";

  const sourceMap = isTamil ? TAMIL_WORKOUT_QUOTES : WORKOUT_QUOTES;
  const group = sourceMap[type.toLowerCase()] || [];
  if (group.length === 0) return "";

  return group[Math.floor(Math.random() * group.length)];
};

/* =========================
   🌟 MAIN COMPONENT
========================= */

type Props = {
  workoutType?: "legs" | "push" | "pull";
};

export default function DailyMotivation({ workoutType }: Props) {
  const [quote, setQuote] = useState("");
  const [workoutQuote, setWorkoutQuote] = useState("");

  useEffect(() => {
    const isTamil = document.documentElement.dataset.tamil === 'true';
    setQuote(getDailyQuote(isTamil));
    setWorkoutQuote(getWorkoutQuote(isTamil, workoutType));

    // Simple observer to watch for dataset changes if needed, but App.tsx unmounts/remounts tabs or state might not trigger it directly.
    const observer = new MutationObserver(() => {
        const newIsTamil = document.documentElement.dataset.tamil === 'true';
        setQuote(getDailyQuote(newIsTamil));
        setWorkoutQuote(getWorkoutQuote(newIsTamil, workoutType));
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tamil'] });

    return () => observer.disconnect();
  }, [workoutType]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 px-0">
      <AnimatePresence mode="wait">
        <motion.div
           key={quote}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="bg-gradient-to-r from-[var(--green)] to-[var(--accent)] text-white p-6 rounded-3xl shadow-xl text-center border border-white/10"
        >
          <p className="text-sm sm:text-lg font-display font-black italic uppercase tracking-wider leading-relaxed">
            “{quote}”
          </p>
        </motion.div>
      </AnimatePresence>

      {workoutQuote && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-[var(--red)] to-orange-500 text-white p-5 rounded-2xl shadow-lg text-center border border-white/10"
        >
          <p className="text-sm font-black uppercase tracking-widest italic animate-pulse">
            {workoutQuote}
          </p>
        </motion.div>
      )}
    </div>
  );
}
