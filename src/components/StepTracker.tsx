import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Footprints, TrendingUp, AlertCircle } from 'lucide-react';

interface StepTrackerProps {
  initialSteps: number;
  onStepsChange: (steps: number) => void;
}

export default function StepTracker({ initialSteps, onStepsChange }: StepTrackerProps) {
  const [steps, setSteps] = useState(initialSteps);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  
  // Step detection logic
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const threshold = 12; // Sensitivity threshold
  const lastStepTime = useRef(0);

  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          startTracking();
        } else {
          setError('Permission denied for motion sensors.');
        }
      } catch (err) {
        setError('Error requesting permission.');
      }
    } else {
      // Non-iOS devices
      startTracking();
    }
  };

  const startTracking = () => {
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
      setIsTracking(true);
      setError(null);
    } else {
      setError('Motion sensors not supported on this device.');
    }
  };

  const stopTracking = () => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsTracking(false);
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const { x, y, z } = acceleration;
    if (x === null || y === null || z === null) return;

    const deltaX = Math.abs(lastAcceleration.current.x - x);
    const deltaY = Math.abs(lastAcceleration.current.y - y);
    const deltaZ = Math.abs(lastAcceleration.current.z - z);

    const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    const now = Date.now();

    if (magnitude > threshold && now - lastStepTime.current > 300) {
      setSteps(prev => {
        const newSteps = prev + 1;
        onStepsChange(newSteps);
        return newSteps;
      });
      lastStepTime.current = now;
    }

    lastAcceleration.current = { x, y, z };
  };

  const addSteps = (amount: number) => {
    const newSteps = steps + amount;
    setSteps(newSteps);
    onStepsChange(newSteps);
  };

  const handleCustomAdd = () => {
    const amt = parseInt(customAmount);
    if (!isNaN(amt) && amt > 0) {
      addSteps(amt);
      setCustomAmount('');
    }
  };

  const progress = Math.min(100, (steps / 10000) * 100);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--sub)]">
          <div 
            className="h-full bg-[var(--yellow)] transition-all duration-500" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        
        <h3 className="font-display text-2xl text-[var(--red)] tracking-wider mb-6 flex items-center justify-center gap-2">
          <Footprints size={24} />
          Daily Steps
        </h3>
        
        <div className="text-6xl font-extrabold font-display text-[var(--yellow)] mb-2 tabular-nums">
          {steps.toLocaleString()}
        </div>
        <div className="text-[var(--muted)] text-sm font-bold uppercase tracking-widest">Goal: 10,000 steps</div>
        
        <div className="mt-8 space-y-4">
          <div className="h-4 bg-[var(--sub)] rounded-full overflow-hidden border border-[var(--border)]">
            <div 
              className="h-full bg-[var(--yellow)] shadow-[0_0_15px_rgba(255,204,0,0.4)] transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          
          <p className="text-sm italic text-[var(--muted)] min-h-[20px]">
            {steps >= 10000 ? "Goal completed 🎉" : steps >= 7000 ? "Almost there 🚀" : steps >= 3000 ? "Keep going 🔥" : "Good start 💪"}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {!isTracking ? (
            <button 
              onClick={requestPermission}
              className="w-full p-3 rounded-xl bg-[var(--red)] text-white font-display text-lg tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp size={20} />
              START AUTO-TRACKING
            </button>
          ) : (
            <button 
              onClick={stopTracking}
              className="w-full p-3 rounded-xl bg-[var(--sub)] border border-[var(--red)] text-[var(--red)] font-display text-lg tracking-wider hover:bg-[var(--red)]/10 transition-all"
            >
              STOP TRACKING
            </button>
          )}
          
          {error && (
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--red)] font-bold uppercase tracking-wider">
              <AlertCircle size={12} />
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-4">Manual Entry</h4>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={() => addSteps(500)} className="p-2 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-xs font-bold hover:border-[var(--red)] transition-all">+500</button>
          <button onClick={() => addSteps(1000)} className="p-2 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-xs font-bold hover:border-[var(--red)] transition-all">+1000</button>
          <button onClick={() => addSteps(2000)} className="p-2 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-xs font-bold hover:border-[var(--red)] transition-all">+2000</button>
        </div>
        <div className="flex gap-2">
          <input 
            type="number" 
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Custom amount..." 
            className="flex-1 p-3 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-white text-sm outline-none focus:border-[var(--red)] transition-colors"
          />
          <button 
            onClick={handleCustomAdd}
            className="px-6 rounded-xl bg-[var(--red)] text-white font-display text-sm tracking-wider hover:brightness-110 transition-all"
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}
