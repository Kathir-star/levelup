// Text-to-Speech using browser SpeechSynthesis API

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  pitch?: number;
  rate?: number;
  voiceName?: string;
}

export function speak(text: string, options: SpeakOptions = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech synthesis is not supported in this browser.");
    options.onEnd?.();
    return;
  }

  // Cancel any ongoing speaking first
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = options.pitch ?? 1.1; // Slightly higher pitch for friendly coach
  utterance.rate = options.rate ?? 1.0; // Normal rate

  // Try to find a nice English voice
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Look for preferred voices like Google US English, Microsoft Zira, etc.
    const preferredVoice = voices.find(
      v => v.name.includes('Google US English') || 
           v.name.includes('Samantha') || 
           v.name.includes('Zira') || 
           v.lang.startsWith('en-US')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.error("Speech synthesis error:", e);
    options.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
