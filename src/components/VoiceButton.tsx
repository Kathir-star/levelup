import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Brain, Loader2, Sparkles, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import { JarvisController } from '../ai/jarvis';
import { MuscleGroup, UserProfile } from '../types';
import JarvisOrb from './common/JarvisOrb';
import VoiceVisualizer from './common/VoiceVisualizer';
import { cn } from '../lib/utils';

interface VoiceButtonProps {
  userProfile: UserProfile;
  startWorkout: (muscle: MuscleGroup) => void;
  addCalories: (amount: number) => void;
  addWater: (amount: number) => void;
  setActiveTab: (tabId: string) => void;
  addToast: (msg: string, type?: string) => void;
  onDisable: () => void;
}

export default function VoiceButton({
  userProfile,
  startWorkout,
  addCalories,
  addWater,
  setActiveTab,
  addToast,
  onDisable
}: VoiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userSpeech, setUserSpeech] = useState<string>('');
  const [jarvisResponse, setJarvisResponse] = useState<string>('Press the mic and say "Start chest workout" or ask me "Can you make a diet plan?"');
  const [textInput, setTextInput] = useState<string>('');
  const [voiceMode, setVoiceMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lvl_jarvis_voice_mode');
    return saved !== null ? saved === 'true' : true;
  });
  
  const jarvisRef = useRef<JarvisController | null>(null);

  // Sync voiceMode to localStorage
  useEffect(() => {
    localStorage.setItem('lvl_jarvis_voice_mode', String(voiceMode));
    if (jarvisRef.current) {
      jarvisRef.current.setVoiceMode(voiceMode);
    }
  }, [voiceMode]);

  // Initialize Jarvis controller
  useEffect(() => {
    jarvisRef.current = new JarvisController({
      onListeningChange: (listening) => {
        setIsListening(listening);
        if (listening) {
          setUserSpeech('Listening...');
          setIsOpen(true);
        }
      },
      onSpeakingChange: (speaking) => {
        setIsSpeaking(speaking);
      },
      onThinkingChange: (thinking) => {
        setIsThinking(thinking);
      },
      onResponse: (text) => {
        if (text.startsWith('"') && text.endsWith('"')) {
          setUserSpeech(text);
        } else {
          setJarvisResponse(text);
        }
      },
      startWorkout: (muscle) => {
        startWorkout(muscle);
        setIsOpen(false);
      },
      addCalories: (amount) => {
        addCalories(amount);
      },
      addWater: (amount) => {
        addWater(amount);
      },
      showTab: (tabId) => {
        setActiveTab(tabId);
      },
      scheduleReminder: async (timeStr) => {
        // Handle saving reminder to backend db
        try {
          const res = await fetch('/api/reminder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: localStorage.getItem('lv_session_uid') || 'guest',
              time: timeStr
            })
          });
          if (res.ok) {
            addToast(`⏰ Daily reminder scheduled for ${timeStr}`, 'success');
          } else {
            addToast(`⏰ Scheduled reminder locally`, 'success');
          }
        } catch (e) {
          console.error("Failed to sync reminder to backend:", e);
          addToast(`⏰ Saved reminder locally`, 'success');
        }
      },
      addToast: (msg, type) => {
        addToast(msg, type);
      }
    }, userProfile);

    jarvisRef.current.setVoiceMode(voiceMode);

    return () => {
      jarvisRef.current?.stop();
    };
  }, [userProfile, startWorkout, addCalories, addWater, setActiveTab, addToast, voiceMode]);

  const handleMicClick = () => {
    if (isListening) {
      jarvisRef.current?.stop();
    } else {
      // Trigger voice recording and speech synthesis authorization if needed
      jarvisRef.current?.listen();
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    const query = textInput;
    setTextInput('');
    setUserSpeech(`"${query}"`);
    setIsThinking(true);
    if (jarvisRef.current) {
      jarvisRef.current.setUserProfile(userProfile);
      await jarvisRef.current.handleInput(query);
    }
    setIsThinking(false);
  };

  const jarvisState = isListening 
    ? 'listening' 
    : isThinking 
    ? 'thinking' 
    : isSpeaking 
    ? 'speaking' 
    : 'idle';

  return (
    <>
      {/* Floating Jarvis Controller Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[250] w-[345px] max-w-[90vw] glass-card border border-cyan-500/30 p-5 rounded-3xl shadow-2xl shadow-cyan-500/10 flex flex-col gap-4 overflow-hidden"
          >
            {/* Visual Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Sparkles size={14} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Jarvis AI</h3>
                  <span className="text-[9px] text-cyan-400 uppercase tracking-widest font-bold">Online Mainframe</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Voice Mode Toggle */}
                <button
                  onClick={() => setVoiceMode(!voiceMode)}
                  className={cn(
                    "p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1",
                    voiceMode 
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
                      : "bg-neutral-900 border-white/5 text-neutral-400 hover:text-white"
                  )}
                  title={voiceMode ? "Mute Spoken Audio" : "Unmute Spoken Audio"}
                >
                  {voiceMode ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  <span className="text-[8px] font-black uppercase tracking-wider hidden sm:inline">{voiceMode ? 'Voice' : 'Mute'}</span>
                </button>

                {/* Exit AI Button */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onDisable();
                  }}
                  className="px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  title="Disable Jarvis AI Mode"
                >
                  Exit AI
                </button>

                {/* Minimize Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer"
                  title="Minimize Panel"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Futuristic Central Holographic Core */}
            <div className="flex justify-center items-center py-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-indigo-500/5 rounded-full filter blur-xl" />
              <JarvisOrb state={jarvisState} size={150} />
            </div>

            {/* Conversation Bubbles */}
            <div className="space-y-3 min-h-[90px] flex flex-col justify-end">
              {userSpeech && (
                <div className="flex justify-end">
                  <span className="py-1.5 px-3 rounded-2xl rounded-tr-none bg-neutral-800 text-neutral-200 text-xs font-medium max-w-[85%] break-words border border-white/[0.03]">
                    {userSpeech}
                  </span>
                </div>
              )}
              
              <div className="flex justify-start">
                <div className="py-2.5 px-3 rounded-2xl rounded-tl-none bg-cyan-500/10 border border-cyan-500/20 text-white text-xs leading-relaxed w-full break-words shadow-sm overflow-x-auto max-h-[180px] overflow-y-auto custom-scrollbar">
                  <div className="markdown-body text-left space-y-1.5 max-w-full text-[11px]">
                    <Markdown
                      components={{
                        p: ({children}) => <p className="leading-relaxed mb-1">{children}</p>,
                        ul: ({children}) => <ul className="list-disc pl-4 space-y-1 my-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-4 space-y-1 my-1">{children}</ol>,
                        li: ({children}) => <li className="marker:text-cyan-400">{children}</li>,
                        h1: ({children}) => <h4 className="text-cyan-400 font-black uppercase tracking-wider text-[11px] mt-2 mb-1">{children}</h4>,
                        h2: ({children}) => <h4 className="text-cyan-400 font-black uppercase tracking-wider text-[11px] mt-2 mb-1">{children}</h4>,
                        h3: ({children}) => <h4 className="text-cyan-400 font-black uppercase tracking-wider text-[11px] mt-2 mb-1">{children}</h4>,
                        table: ({children}) => <div className="overflow-x-auto my-2 border border-cyan-500/20 rounded-lg"><table className="w-full text-left border-collapse text-[10px]">{children}</table></div>,
                        thead: ({children}) => <thead className="bg-cyan-500/10 text-cyan-300 font-bold">{children}</thead>,
                        tbody: ({children}) => <tbody className="divide-y divide-white/5">{children}</tbody>,
                        tr: ({children}) => <tr className="hover:bg-white/5 transition-colors">{children}</tr>,
                        th: ({children}) => <th className="p-1.5 border-b border-cyan-500/20 font-black uppercase tracking-wider">{children}</th>,
                        td: ({children}) => <td className="p-1.5 font-medium">{children}</td>,
                      }}
                    >
                      {jarvisResponse}
                    </Markdown>
                  </div>
                </div>
              </div>
            </div>

            {/* Web Audio Real-Time Waveform Visualizer Canvas */}
            <VoiceVisualizer state={jarvisState} isListening={isListening} height={40} />

            {/* Typing Text Input Field */}
            <div className="flex gap-2 items-center">
              <input 
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit();
                  }
                }}
                disabled={isThinking || isListening}
                placeholder={isListening ? "Mute mic to type query..." : "Ask diet, workout split, track stats..."}
                className="flex-1 bg-black/40 border border-cyan-500/20 focus:border-cyan-400 rounded-xl px-3 py-2 text-white text-[11px] outline-none font-medium placeholder:text-neutral-600 disabled:opacity-50 transition-all shadow-inner"
              />
              <button 
                onClick={handleTextSubmit}
                disabled={isThinking || isListening || !textInput.trim()}
                className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-neutral-950 disabled:opacity-30 disabled:hover:bg-cyan-500/10 disabled:hover:text-cyan-400 transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                title="Send query"
              >
                <Send size={12} />
              </button>
            </div>

            {/* Visualizer and Live Status Controls */}
            <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2.5">
                {isListening && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                {isThinking && <Loader2 size={15} className="text-cyan-400 animate-spin" />}
                {isSpeaking && <Volume2 size={15} className="text-cyan-400 animate-pulse" />}
                {!isListening && !isThinking && !isSpeaking && <Brain size={15} className="text-neutral-500" />}

                <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                  {isListening ? 'Listening...' : isThinking ? 'Analyzing...' : isSpeaking ? 'Speaking...' : 'Ready'}
                </span>
              </div>
              <button
                onClick={handleMicClick}
                className={`p-2 rounded-xl transition-all cursor-pointer ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'}`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>

            {/* Interactive Hints */}
            <div className="text-[10px] text-neutral-500 space-y-1">
              <span className="font-bold text-neutral-400 uppercase tracking-widest text-[8px] block">Suggested Commands:</span>
              <ul className="list-disc pl-3.5 space-y-0.5 font-medium">
                <li>"Start chest workout" / "Train biceps"</li>
                <li>"Give me a muscle gain workout split"</li>
                <li>"Make a high protein diet plan"</li>
                <li>"Track 500 calories" / "Add 250ml water"</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Jarvis Trigger Button */}
      <div className="fixed bottom-24 right-4 sm:right-6 z-[200] flex flex-col items-center gap-2 group/trigger">
        {/* Small Exit X button on hover/trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
            onDisable();
          }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-black border border-red-500/40 text-red-400 hover:text-white hover:bg-red-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all z-[210] opacity-0 group-hover/trigger:opacity-100"
          title="Exit AI Mode (Disable Jarvis)"
        >
          <X size={10} />
        </button>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              handleMicClick();
            }
          }}
          className={`relative h-14 w-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-2xl active:scale-95 group ${
            isListening 
              ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600' 
              : isSpeaking 
              ? 'bg-cyan-500 shadow-cyan-500/20'
              : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/20'
          }`}
          style={{
            border: isListening ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(6, 182, 212, 0.3)'
          }}
        >
          {/* Animated Aura Glow rings */}
          {(isListening || isSpeaking || isThinking) && (
            <span className="absolute inset-0 rounded-full animate-ping bg-cyan-500/40 opacity-70" style={{ animationDuration: '2s' }} />
          )}

          {isListening ? (
            <Mic size={22} className="text-white animate-pulse" />
          ) : isThinking ? (
            <Loader2 size={22} className="text-white animate-spin" />
          ) : isSpeaking ? (
            <Volume2 size={22} className="text-white animate-bounce" />
          ) : (
            <Mic size={22} className="text-white group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>
    </>
  );
}
