import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';
import { Send, Bot, User, Mic, MicOff, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AICoachProps {
  userName: string;
  userProfile: any;
  workoutData?: any;
}

export default function AICoach({ userName, userProfile, workoutData }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `vanakkam ${userName}! I'm your **LEVELUP** AI elite coach. I've analyzed your ${userProfile.gender || 'male'} profile. Let's optimize your ${userProfile.goal || 'fitness'} journey! How can I help you today? ⚡` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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
5. Always address the user as ${userName}.
6. Use professional formatting: bold headings, tables for workouts/diet, and bullet points.
7. Tone: High-energy, knowledgeable, motivating, and disciplined.${tamilConstraint}

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
        message: userMsg
      });
      
      const text = result.text;
      setMessages(prev => [...prev, { role: 'assistant', content: text || "Mission accomplished! Keep the fire burning!" }]);
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
    <div className="max-w-4xl mx-auto flex flex-col h-[700px] glass-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* AI Header */}
      <div className="p-6 border-b border-[var(--border)] bg-[var(--card2)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-glow)] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[var(--accent-glow)]/40 relative group">
            <BrainCircuit size={28} className="group-hover:rotate-12 transition-transform" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--green)] rounded-full border-2 border-black" />
          </div>
          <div>
            <h3 className="tab-heading text-lg leading-none">LEVELUP AI Core</h3>
            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <Sparkles size={10} className="text-[var(--yellow)] animate-pulse" />
              Elite Personalized Intelligence
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--sub)] rounded-full border border-[var(--border)]">
           <div className="w-2 h-2 bg-[var(--green)] rounded-full animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-widest">Neural Link Active</span>
        </div>
      </div>

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
            onClick={() => {
               const tamil = document.documentElement.dataset.tamil === 'true';
               handleSend(tamil ? 'Enakku oru nalla personalized workout plan kodu.' : 'Generate a personalized workout plan based on my profile.');
            }}
            className="px-4 py-2 bg-[var(--card)] border border-[var(--accent)] text-[var(--accent)] text-[11px] font-bold uppercase tracking-wider rounded-full hover:bg-[var(--accent)] hover:text-white transition-all shadow-sm"
          >
            Workout Plan
          </button>
          <button 
            onClick={() => {
               const tamil = document.documentElement.dataset.tamil === 'true';
               handleSend(tamil ? 'Oru high-protein Indian diet plan suggest pannu.' : 'Suggest a high-protein Indian diet plan.');
            }}
            className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] text-[11px] font-bold uppercase tracking-wider rounded-full hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm"
          >
            Diet Plan
          </button>
        </div>
      )}

      {/* Input Zone */}
      <div className="p-6 bg-[var(--card2)] border-t border-[var(--border)]">
        <div className="flex gap-3 items-center max-w-3xl mx-auto">
          <button 
            onClick={toggleVoiceChat}
            className={cn(
              "w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all group",
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
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
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
    </div>
  );
}
