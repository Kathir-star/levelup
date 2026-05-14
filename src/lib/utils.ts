import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateStreak(data: Record<string, any[]>) {
  let streak = 0;
  const today = new Date();
  
  // Check from today or yesterday
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Some apps use localeDateString('en-CA'), let's be robust
    const altDateStr = d.toLocaleDateString('en-CA');
    
    if (data[dateStr] || data[altDateStr]) {
      streak++;
    } else {
       // Only break if it's not today (allow 1 day gap if today workout not done yet)
       if (i === 0) continue;
       break;
    }
  }
  return streak;
}
