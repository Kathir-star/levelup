import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import cron from 'node-cron';
import webpush from 'web-push';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Persistent state storage (JSON files acting as local database)
const STORAGE_DIR = path.join(process.cwd(), 'data');
const REMINDERS_FILE = path.join(STORAGE_DIR, 'reminders.json');
const HABITS_FILE = path.join(STORAGE_DIR, 'habits.json');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Helper functions for storage
function readJSON(file: string, defaultVal: any) {
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return defaultVal;
}

function writeJSON(file: string, data: any) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing to ${file}:`, err);
  }
}

// Generate/Configure VAPID Keys for Web Push
let vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  try {
    const generated = webpush.generateVAPIDKeys();
    vapidKeys = generated;
    console.log("🔐 Generated temporary Web Push VAPID keys for zero-config startup.");
  } catch (err) {
    console.error("VAPID key generation failed:", err);
  }
}

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:support@levelup-coach.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

// ----------------- API ROUTES -----------------

// Public VAPID Key Endpoint
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// 1. REMINDERS ENDPOINT
// Save reminder time and subscription for push notifications
app.post('/api/reminder', (req, res) => {
  const { userId, time, subscription } = req.body;
  
  if (!userId || !time) {
    return res.status(400).json({ error: 'userId and time are required' });
  }

  const reminders = readJSON(REMINDERS_FILE, {});
  
  // Format reminder
  reminders[userId] = {
    userId,
    time: time.trim().toUpperCase(), // e.g. "06:00 AM", "6:00 PM"
    subscription: subscription || reminders[userId]?.subscription || null,
    updatedAt: new Date().toISOString()
  };

  writeJSON(REMINDERS_FILE, reminders);
  console.log(`⏰ Saved reminder for user ${userId} at ${time}`);
  res.json({ success: true, reminder: reminders[userId] });
});

// 2. TRIGGER PUSH ENDPOINT (Manual trigger / test notify)
app.post('/api/notify', async (req, res) => {
  const { userId, title, message } = req.body;
  
  const reminders = readJSON(REMINDERS_FILE, {});
  const userReminder = reminders[userId || 'local-user'] || Object.values(reminders)[0];

  if (!userReminder || !userReminder.subscription) {
    return res.status(404).json({ error: 'No push subscription found for user' });
  }

  try {
    const payload = JSON.stringify({
      title: title || "Jarvis AI Coach",
      body: message || "Time to log your training, Champion! Let's build consistency.",
      icon: "/favicon.ico",
      badge: "/favicon.ico"
    });

    await webpush.sendNotification(userReminder.subscription, payload);
    res.json({ success: true, message: 'Notification dispatched successfully' });
  } catch (err) {
    console.error('Error sending push notification:', err);
    res.status(500).json({ error: 'Push notification failed' });
  }
});

// 3. SMART MEMORY SYSTEM (Habit / preference store)
app.post('/api/memory', (req, res) => {
  const { userId, exercisePreferences, workoutTimes, activityLog } = req.body;
  const uid = userId || 'local-user';

  const habits = readJSON(HABITS_FILE, {});
  
  habits[uid] = {
    ...habits[uid],
    exercisePreferences: exercisePreferences || habits[uid]?.exercisePreferences || [],
    workoutTimes: workoutTimes || habits[uid]?.workoutTimes || [],
    activityLog: activityLog ? [...(habits[uid]?.activityLog || []), activityLog].slice(-50) : (habits[uid]?.activityLog || []),
    updatedAt: new Date().toISOString()
  };

  writeJSON(HABITS_FILE, habits);
  res.json({ success: true, memory: habits[uid] });
});

app.get('/api/memory/:userId', (req, res) => {
  const habits = readJSON(HABITS_FILE, {});
  const userMemory = habits[req.params.userId] || {
    exercisePreferences: [],
    workoutTimes: [],
    activityLog: []
  };
  res.json(userMemory);
});

// 4. JARVIS AI COGNITIVE CMD PARSER
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY missing in environment. JARVIS will use localized commands.");
      return null;
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

app.post('/api/ai', async (req, res) => {
  const { prompt, memory } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      intent: 'UNKNOWN',
      response: "Jarvis AI mainframe is running offline. Standard speech triggers are online.",
      extractedData: {}
    });
  }

  try {
    const systemInstruction = `
      You are "Jarvis", an advanced personal AI workout and fitness coach.
      Analyze the user's spoken or typed command and determine if they want to control their workout logic, input records, or ask for a diet plan or workout split/advice.
      
      User current context: Name is ${memory?.name || 'Champion'}, goal is ${memory?.goal || 'Strength training'}, fitness level is ${memory?.level || 'Intermediate'}.
      
      Respond with a JSON object ONLY. Do not wrap in markdown or code blocks. The JSON must follow this exact format:
      {
        "intent": "START_WORKOUT" | "TRACK_CALORIES" | "ADD_WATER" | "SHOW_PROGRESS" | "SET_REMINDER" | "GO_TO_TAB" | "MOTIVATION" | "GREETING" | "DIET_PLAN" | "WORKOUT_SPLIT" | "UNKNOWN",
        "extractedData": {
          "muscle": "Chest" | "Back" | "Legs" | "Biceps" | "Triceps" | "Shoulder" | "Abs" | "Cardio" | "Full Body",
          "calories": number,
          "waterMl": number,
          "time": "06:00 AM",
          "tabId": "stats" | "logs" | "mastery" | "sessions" | "charts" | "planner"
        },
        "response": "The response text. If the intent is DIET_PLAN, WORKOUT_SPLIT or general advice, write a highly professional, comprehensive, and beautiful markdown response (using bold headings, bullet points, or markdown tables for diets/splits) tailored exactly to the user's profile and request. Keep it motivating!"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            extractedData: {
              type: Type.OBJECT,
              properties: {
                muscle: { type: Type.STRING },
                calories: { type: Type.INTEGER },
                waterMl: { type: Type.INTEGER },
                time: { type: Type.STRING },
                tabId: { type: Type.STRING }
              }
            },
            response: { type: Type.STRING }
          },
          required: ['intent', 'response']
        }
      }
    });

    const parsedResponse = JSON.parse(response.text?.trim() || '{}');
    res.json(parsedResponse);
  } catch (err) {
    console.error("Gemini request failed:", err);
    res.status(500).json({ error: "AI processing error" });
  }
});


// ----------------- BACKEND SCHEDULER (CRON) -----------------
// Check every minute if any reminder matches the current local time
cron.schedule('* * * * *', async () => {
  const now = new Date();
  
  // Format current time into e.g., "06:00 AM" or "06:00 PM"
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const currentFormattedTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

  const reminders = readJSON(REMINDERS_FILE, {});
  
  for (const uid in reminders) {
    const r = reminders[uid];
    if (r.time === currentFormattedTime && r.subscription) {
      console.log(`⏰ Cron Trigger: Sending daily push reminder to user ${uid} at ${r.time}`);
      try {
        const payload = JSON.stringify({
          title: "🏆 LevelUp - Jarvis Reminder",
          body: `Champion! It's ${r.time}. Let's execute today's discipline. Tap to open your workspace!`,
          icon: "/favicon.ico"
        });
        await webpush.sendNotification(r.subscription, payload);
      } catch (err) {
        console.error(`Failed sending cron notification for ${uid}:`, err);
      }
    }
  }
});


// ----------------- VITE & STATIC FILES SERVING -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Jarvis AI Server listening on http://localhost:${PORT}`);
  });
}

startServer();
