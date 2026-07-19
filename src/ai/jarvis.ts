import { VoiceRecognition } from './voice';
import { speak, stopSpeaking } from './speak';
import { parseCommand, CommandIntentType, ParsedCommand } from './commands';
import { MuscleGroup, UserProfile } from '../types';

export interface JarvisHandlers {
  onListeningChange?: (listening: boolean) => void;
  onSpeakingChange?: (speaking: boolean) => void;
  onThinkingChange?: (thinking: boolean) => void;
  onResponse?: (text: string) => void;
  
  // App triggers
  startWorkout?: (muscle: MuscleGroup) => void;
  addCalories?: (amount: number) => void;
  addWater?: (amount: number) => void;
  showTab?: (tabId: string) => void;
  scheduleReminder?: (timeStr: string) => void;
  addToast?: (msg: string, type?: string) => void;
}

export class JarvisController {
  private voice: VoiceRecognition | null = null;
  private handlers: JarvisHandlers;
  private isThinking: boolean = false;
  private isSpeaking: boolean = false;
  private userProfile: UserProfile | null = null;
  private voiceMode: boolean = true;

  constructor(handlers: JarvisHandlers, userProfile?: UserProfile) {
    this.handlers = handlers;
    this.userProfile = userProfile || null;

    this.voice = new VoiceRecognition({
      onStart: () => {
        stopSpeaking();
        this.handlers.onListeningChange?.(true);
      },
      onResult: async (text, isFinal) => {
        if (isFinal) {
          this.handlers.onResponse?.(`"${text}"`);
          await this.handleInput(text);
        }
      },
      onError: (err) => {
        this.handlers.onListeningChange?.(false);
        this.handlers.addToast?.(`Voice Error: ${err}`, 'error');
      },
      onEnd: () => {
        this.handlers.onListeningChange?.(false);
      }
    });
  }

  public setUserProfile(profile: UserProfile) {
    this.userProfile = profile;
  }

  public listen() {
    if (this.voice) {
      this.voice.start();
    } else {
      this.handlers.addToast?.("Speech recognition not initialized", "error");
    }
  }

  public stop() {
    if (this.voice) {
      this.voice.stop();
    }
    stopSpeaking();
  }

  public setVoiceMode(enabled: boolean) {
    this.voiceMode = enabled;
    if (!enabled) {
      stopSpeaking();
      this.isSpeaking = false;
      this.handlers.onSpeakingChange?.(false);
    }
  }

  public async speakResponse(text: string) {
    if (!this.voiceMode) {
      this.isSpeaking = false;
      this.handlers.onSpeakingChange?.(false);
      return;
    }

    this.isSpeaking = true;
    this.handlers.onSpeakingChange?.(true);
    
    // Strip markdown formatting for cleaner speech synthesis
    let cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\|/g, ' ')
      .replace(/[-*]\s+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit length spoken so long nutrition tables aren't gabbled forever
    if (cleanText.length > 300) {
      cleanText = cleanText.substring(0, 280) + "... details are displayed on your screen, Champion!";
    }

    speak(cleanText, {
      onStart: () => {},
      onEnd: () => {
        this.isSpeaking = false;
        this.handlers.onSpeakingChange?.(false);
      }
    });
  }

  private setThinking(state: boolean) {
    this.isThinking = state;
    this.handlers.onThinkingChange?.(state);
  }

  public async handleInput(text: string) {
    this.setThinking(true);
    const parsed = parseCommand(text);

    // If local confidence is high, execute immediately, but we can also use Gemini server-side to enrich the speech!
    if (parsed.confidence >= 0.8) {
      await this.executeIntent(parsed, text);
    } else {
      // Query Gemini AI server side
      await this.queryServerAI(text);
    }
    this.setThinking(false);
  }

  private async executeIntent(parsed: ParsedCommand, rawText: string) {
    let coachSpeech = "";

    switch (parsed.intent) {
      case 'GREETING':
        const name = this.userProfile?.name || "Champion";
        coachSpeech = `Hello ${name}! I'm Jarvis, your AI fitness coach. Let's make today count! Ask me to start a workout, log your steps, track calories, or check your progress.`;
        this.handlers.showTab?.('stats');
        break;

      case 'MOTIVATION':
        const motivations = [
          "Remember why you started. Every rep is a step closer to your best self. Let's go!",
          "No excuses today. Discipline beats motivation. Show me what you've got!",
          "Success isn't given, it's earned. Sweat today, smile tomorrow. Let's crush this workout!",
          "Focus on the work, the results will follow. You are stronger than you think."
        ];
        coachSpeech = motivations[Math.floor(Math.random() * motivations.length)];
        break;

      case 'START_WORKOUT':
        const muscle = parsed.extractedData?.muscle || 'Full Body';
        coachSpeech = `Let's get it! Starting your ${muscle} training session now. Follow my guidance and crush every set!`;
        this.handlers.startWorkout?.(muscle);
        break;

      case 'TRACK_CALORIES':
        const calories = parsed.extractedData?.calories || 0;
        coachSpeech = `Got it! Recorded ${calories} calories to your logs. Keep tracking your energy balance.`;
        this.handlers.addCalories?.(calories);
        break;

      case 'ADD_WATER':
        const water = parsed.extractedData?.waterMl || 250;
        coachSpeech = `Hydration updated! Logged ${water} milliliters of water. Stay hydrated for optimal performance!`;
        this.handlers.addWater?.(water);
        break;

      case 'SHOW_PROGRESS':
        coachSpeech = `Opening your progress dashboard. Your development graphs and historical charts are right here. Let's analyze your gains!`;
        this.handlers.showTab?.('charts');
        break;

      case 'GO_TO_TAB':
        const tabId = parsed.extractedData?.tabId || 'stats';
        coachSpeech = `Opening ${tabId === 'stats' ? 'Dashboard' : tabId}.`;
        this.handlers.showTab?.(tabId);
        break;

      case 'SET_REMINDER':
        const time = parsed.extractedData?.time || '06:00 AM';
        coachSpeech = `Excellent. I have scheduled a daily training reminder for you at ${time}. I will keep you accountable!`;
        this.handlers.scheduleReminder?.(time);
        break;

      default:
        coachSpeech = "I heard you, but let me check with the coach core.";
        await this.queryServerAI(rawText);
        return;
    }

    this.handlers.onResponse?.(coachSpeech);
    await this.speakResponse(coachSpeech);
  }

  private async queryServerAI(rawText: string) {
    try {
      // Gather memory context
      const memory = {
        name: this.userProfile?.name || 'User',
        goal: this.userProfile?.goal || 'Strength',
        level: this.userProfile?.level || 'Intermediate',
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: rawText, memory })
      });

      if (!response.ok) {
        throw new Error("Failed to process command server-side");
      }

      const result = await response.json();
      
      if (result.intent && result.intent !== 'UNKNOWN') {
        if (result.intent === 'DIET_PLAN' || result.intent === 'WORKOUT_SPLIT') {
          const speech = result.response || "Here is your plan, Champion!";
          this.handlers.onResponse?.(speech);
          await this.speakResponse(speech);
        } else {
          // Expose triggers returned from backend
          const parsed: ParsedCommand = {
            intent: result.intent as CommandIntentType,
            confidence: 1.0,
            extractedData: result.extractedData
          };
          await this.executeIntent(parsed, rawText);
        }
      } else {
        const speech = result.response || "I am connected, but wasn't able to map that. Try 'start chest workout' or 'track 500 calories'.";
        this.handlers.onResponse?.(speech);
        await this.speakResponse(speech);
      }
    } catch (e) {
      console.error("Jarvis server-side lookup failed:", e);
      const fallbackSpeech = "Connection lag to coach mainframe. Let's stick to core commands like starting workouts, tracking water, or looking at progress!";
      this.handlers.onResponse?.(fallbackSpeech);
      await this.speakResponse(fallbackSpeech);
    }
  }
}
