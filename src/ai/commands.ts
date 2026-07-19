import { MuscleGroup } from '../types';

export type CommandIntentType = 
  | 'START_WORKOUT'
  | 'TRACK_CALORIES'
  | 'ADD_WATER'
  | 'SHOW_PROGRESS'
  | 'SET_REMINDER'
  | 'GO_TO_TAB'
  | 'MOTIVATION'
  | 'GREETING'
  | 'DIET_PLAN'
  | 'WORKOUT_SPLIT'
  | 'UNKNOWN';

export interface ParsedCommand {
  intent: CommandIntentType;
  confidence: number;
  extractedData?: {
    muscle?: MuscleGroup;
    calories?: number;
    waterMl?: number;
    time?: string; // e.g. "06:00" or "6 AM"
    tabId?: string; // e.g. "logs", "stats", "charts", "planner", "sessions"
    phrase?: string;
  };
}

export function parseCommand(text: string): ParsedCommand {
  const cleanText = text.toLowerCase().trim();

  // 1. GREETING INTENT
  if (/^(hello|hi|hey|jarvis|wake up|yo|good morning|good afternoon|good evening)/.test(cleanText)) {
    return {
      intent: 'GREETING',
      confidence: 0.95,
      extractedData: { phrase: text }
    };
  }

  // 2. MOTIVATION INTENT
  if (/\b(motivation|motivate|inspire|quote|encourag|beast|hard|lazy|tired|give up|energy)\b/.test(cleanText)) {
    return {
      intent: 'MOTIVATION',
      confidence: 0.9,
      extractedData: { phrase: text }
    };
  }

  // 3. START WORKOUT INTENT
  // Match "start [muscle] workout" or "workout [muscle]" or "train [muscle]" or "exercise [muscle]"
  const workoutMatch = cleanText.match(/\b(start|begin|do|train|exercise|go|launch)\b.*\b(chest|back|legs|biceps|triceps|shoulder|abs|cardio|full body|glutes|hamstrings|quadriceps)\b/i);
  const directMuscleMatch = cleanText.match(/\b(chest|back|legs|biceps|triceps|shoulder|abs|cardio|full body|glutes|hamstrings|quadriceps)\s+(workout|session|training|day)\b/i);
  
  if (workoutMatch || directMuscleMatch) {
    const muscleName = (workoutMatch ? workoutMatch[2] : directMuscleMatch ? directMuscleMatch[1] : 'Chest') as string;
    // Capitalize first letter of each word to match MuscleGroup
    const muscle = (muscleName.charAt(0).toUpperCase() + muscleName.slice(1)) as MuscleGroup;
    return {
      intent: 'START_WORKOUT',
      confidence: 0.9,
      extractedData: { muscle }
    };
  }

  if (/\b(start workout|begin training|go to gym|exercise)\b/.test(cleanText)) {
    return {
      intent: 'START_WORKOUT',
      confidence: 0.8,
      extractedData: { muscle: 'Full Body' }
    };
  }

  // 4. TRACK CALORIES INTENT
  // Match "track 500 calories" or "add 300 calories" or "burned 400 calories"
  const calorieMatch = cleanText.match(/\b(track|add|log|burned|record|eat|ate)\b.*\b(\d+)\s*(calories|cal|cals)\b/);
  const directCalMatch = cleanText.match(/\b(\d+)\s*(calories|cal|cals)\b/);
  if (calorieMatch || directCalMatch) {
    const caloriesVal = parseInt(calorieMatch ? calorieMatch[2] : directCalMatch ? directCalMatch[1] : '0');
    if (caloriesVal > 0) {
      return {
        intent: 'TRACK_CALORIES',
        confidence: 0.95,
        extractedData: { calories: caloriesVal }
      };
    }
  }

  // 5. ADD WATER INTENT
  // Match "add 500ml water" or "log 250 ml" or "drank 300ml"
  const waterMatch = cleanText.match(/\b(track|add|log|drank|drink|water)\b.*\b(\d+)\s*(ml|milliliters|ounces|oz)?\b/);
  const directWaterMatch = cleanText.match(/\b(\d+)\s*(ml|milliliters)\b/);
  if (waterMatch || directWaterMatch) {
    const waterVal = parseInt(waterMatch ? waterMatch[2] : directWaterMatch ? directWaterMatch[1] : '250');
    if (waterVal > 0) {
      return {
        intent: 'ADD_WATER',
        confidence: 0.9,
        extractedData: { waterMl: waterVal }
      };
    }
  }

  // 6. SHOW PROGRESS INTENT
  if (/\b(show|open|view|display)\b.*\b(progress|chart|growth|trend|history|earn|bmi|records)\b/.test(cleanText) ||
      /\b(progress|charts|trends)\b/.test(cleanText)) {
    return {
      intent: 'SHOW_PROGRESS',
      confidence: 0.9
    };
  }

  // 7. GO TO TAB INTENT
  if (/\b(go to|open|show|switch to|navigate to)\b.*\b(dashboard|logs|history|mastery|planner|sessions|growth|earn|charts)\b/.test(cleanText)) {
    let tabId = 'stats';
    if (cleanText.includes('dashboard') || cleanText.includes('stats')) tabId = 'stats';
    else if (cleanText.includes('log') || cleanText.includes('history')) tabId = 'logs';
    else if (cleanText.includes('mastery') || cleanText.includes('self-mastery')) tabId = 'mastery';
    else if (cleanText.includes('session') || cleanText.includes('workout list')) tabId = 'sessions';
    else if (cleanText.includes('planner') || cleanText.includes('plan')) tabId = 'planner';
    else if (cleanText.includes('growth') || cleanText.includes('earn') || cleanText.includes('chart')) tabId = 'charts';
    
    return {
      intent: 'GO_TO_TAB',
      confidence: 0.9,
      extractedData: { tabId }
    };
  }

  // 8. SET REMINDER INTENT
  // Match "remind me at 6 AM" or "set reminder for 18:00" or "reminder at 8 PM"
  const reminderMatch = cleanText.match(/\b(remind|reminder|alert|schedule)\b.*\b(\d{1,2}(:\d{2})?\s*(am|pm|am\b|pm\b)?)\b/);
  if (reminderMatch) {
    const timeVal = reminderMatch[2].toUpperCase();
    return {
      intent: 'SET_REMINDER',
      confidence: 0.9,
      extractedData: { time: timeVal }
    };
  }

  return {
    intent: 'UNKNOWN',
    confidence: 0.1,
    extractedData: { phrase: text }
  };
}
