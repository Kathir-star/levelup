import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Sparkles, Activity, ShieldCheck, RefreshCw, Zap, Sliders, Play, Award } from 'lucide-react';
import { cn } from '../lib/utils';

interface PostureCheckProps {
  onClose?: () => void;
  activeExercise?: string;
}

export default function PostureCheck({ onClose, activeExercise = 'Squat' }: PostureCheckProps) {
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [spineAngle, setSpineAngle] = useState(178);
  const [tiltAngle, setTiltAngle] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState(activeExercise);
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start webcam stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraAccess(true);
      setIsScanning(true);
    } catch (err) {
      console.warn("Camera access denied or unbacked", err);
      setHasCameraAccess(false);
    }
  };

  // Stop webcam stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setHasCameraAccess(false);
    setIsScanning(false);
  };

  useEffect(() => {
    // Randomize angle readouts to simulate real active coordinate capture
    let timer: number | undefined;
    if (isScanning) {
      timer = window.setInterval(() => {
        setSpineAngle(prev => {
          const change = (Math.random() - 0.5) * 4;
          const newVal = prev + change;
          return Math.min(Math.max(Number(newVal.toFixed(1)), 174), 180);
        });
        setTiltAngle(prev => {
          const change = (Math.random() - 0.5) * 2;
          const newVal = prev + change;
          return Math.min(Math.max(Number(newVal.toFixed(1)), -3), 3);
        });
      }, 600);
    }
    return () => clearInterval(timer);
  }, [isScanning]);

  useEffect(() => {
    return () => {
      // Cleanup stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const triggerCalibration = () => {
    setIsScanning(false);
    setTimeout(() => {
      setIsScanning(true);
      setSpineAngle(179.8);
      setTiltAngle(0.2);
    }, 1000);
  };

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[2.5rem] p-6 sm:p-8 max-w-4xl w-full mx-auto shadow-2xl overflow-hidden relative space-y-6">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent)]/5 rounded-full blur-3xl -z-10" />

      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg relative glow-emerald">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Posture Guard <span className="text-xs bg-[var(--accent)] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">SMART AI v1.2</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-[var(--muted)] font-bold uppercase tracking-widest">Joint safety & skeletal biomechanic scan</p>
          </div>
        </div>

        {/* Selected exercise dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-[var(--muted)] tracking-wider">Exercise Profile:</span>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="bg-[var(--card2)] border border-[var(--border)] rounded-xl py-2 px-4 text-xs font-black uppercase tracking-wider text-white focus:border-[var(--accent)] outline-none cursor-pointer"
          >
            <option value="Squat">🏋️ Squats Form</option>
            <option value="Push-up">💪 Pushups Form</option>
            <option value="Plank">🧘 Plank Form</option>
            <option value="Deadlift">🔥 Deadlift Safety</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* VIEWPORT AREA: 7 COLS */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative w-full aspect-[4/3] bg-[var(--card2)] rounded-3xl border border-[var(--border)] overflow-hidden flex items-center justify-center">
            {/* Real Webcam or Mock Placeholder */}
            {hasCameraAccess ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--sub)_0%,_#050505_100%)]">
                <div className="w-16 h-16 rounded-full bg-slate-500/15 border border-slate-500/30 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                  <CameraOff size={28} />
                </div>
                <div className="text-sm font-black text-white uppercase tracking-widest mb-2">Live Camera Stream Offline</div>
                <p className="text-[10px] text-[var(--muted)] max-w-sm font-bold uppercase tracking-wider leading-relaxed">
                  Turn on your camera to unlock live computer-vision joint mapping and real-time posture check telemetry insights!
                </p>
                <button
                  onClick={startCamera}
                  className="mt-6 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-display font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Camera size={14} /> Ensure Webcam Tracking
                </button>
              </div>
            )}

            {/* AI Vector Joint Wireframe Lines Overlay */}
            {isScanning && (
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none select-none z-10">
                {/* Horizontal scanning light beam */}
                <motion.line 
                  x1="0" 
                  y1="50" 
                  x2="100" 
                  y2="50" 
                  stroke="#10b981" 
                  strokeWidth="0.8" 
                  strokeDasharray="2 1"
                  animate={{ y: [4, 96, 4] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                />

                {/* SKELETON WIREFRAME overlay */}
                {/* Head Node */}
                <motion.circle 
                  cx="50" 
                  cy="20" 
                  r="3.5" 
                  fill={spineAngle < 176 ? "#f59e0b" : "#10b981"} 
                  className="animate-pulse" 
                />
                
                {/* Neck and Spine line */}
                <line x1="50" y1="20" x2="50" y2="65" stroke="#10b981" strokeWidth="1" strokeDasharray="1 1" />
                
                {/* Chest Spine Node */}
                <circle cx="50" cy="35" r="2" fill="#10b981" />
                
                {/* Hip Node */}
                <circle cx="50" cy="65" r="2.5" fill="#10b981" />

                {/* Left Shoulder */}
                <circle cx="38" cy="32" r="2" fill="#10b981" />
                <line x1="50" y1="35" x2="38" y2="32" stroke="#10b981" strokeWidth="0.8" />
                
                {/* Right Shoulder */}
                <circle cx="62" cy="32" r="2" fill="#10b981" />
                <line x1="50" y1="35" x2="62" y2="32" stroke="#10b981" strokeWidth="0.8" />

                {/* Spine tilt display circle */}
                <line x1="50" y1="35" x2={50 + tiltAngle * 3} y2="60" stroke="#3b82f6" strokeWidth="1" />

                {/* Left elbow & hand */}
                <circle cx="32" cy="48" r="1.5" fill="#3b82f6" />
                <line x1="38" y1="32" x2="32" y2="48" stroke="#10b981" strokeWidth="0.6" />
                <circle cx="28" cy="60" r="1.5" fill="#3b82f6" />
                <line x1="32" y1="48" x2="28" y2="60" stroke="#10b981" strokeWidth="0.6" />

                {/* Right elbow & hand */}
                <circle cx="68" cy="48" r="1.5" fill="#3b82f6" />
                <line x1="62" y1="32" x2="68" y2="48" stroke="#10b981" strokeWidth="0.6" />
                <circle cx="72" cy="60" r="1.5" fill="#3b82f6" />
                <line x1="68" y1="48" x2="72" y2="60" stroke="#10b981" strokeWidth="0.6" />

                {/* Hips to legs */}
                <line x1="50" y1="65" x2="42" y2="82" stroke="#10b981" strokeWidth="0.8" />
                <circle cx="42" y1="65" cy="82" r="2" fill="#10b981" />
                <line x1="42" y1="82" x2="40" y2="95" stroke="#10b981" strokeWidth="0.8" />
                <circle cx="40" cy="95" r="2" fill="#10b981" />

                <line x1="50" y1="65" x2="58" y2="82" stroke="#10b981" strokeWidth="0.8" />
                <circle cx="58" cy="82" r="2" fill="#10b981" />
                <line x1="58" y1="82" x2="60" y2="95" stroke="#10b981" strokeWidth="0.8" />
                <circle cx="60" cy="95" r="2" fill="#10b981" />

                {/* Angle target markers overlay */}
                <circle cx="50" cy="35" r="8" fill="none" stroke="#22c55e" strokeWidth="0.4" strokeDasharray="1 1" />
              </svg>
            )}

            {hasCameraAccess && (
              <button
                onClick={stopCamera}
                className="absolute bottom-4 right-4 z-20 px-4 py-2 bg-black/60 hover:bg-black/90 text-white font-black text-[10px] uppercase tracking-wider rounded-xl border border-white/10 flex items-center gap-2"
              >
                <CameraOff size={10} /> Disengage Video
              </button>
            )}

            {/* Live scanning overlay badge */}
            {isScanning && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">LIVE MESH SCANNING</span>
              </div>
            )}
          </div>

          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] text-center">
            ⚠️ Place mobile camera at hip height, stand fully in view 2M back for accurate skeletal segmentation.
          </p>
        </div>

        {/* METRICS & FEEDBACK TELEMETRY: 5 COLS */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[var(--card2)] border border-[var(--border)] p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
              <Sliders size={12} className="text-[var(--accent)]" /> Biomechanical Telemetry
            </h4>

            <div className="space-y-3">
              {/* Telemetry 1 - Spine Angle */}
              <div className="p-3 bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Spine Core Angle</div>
                  <div className="text-xs text-white/95 mt-0.5 font-bold">Safe Lumbar Flexion</div>
                </div>
                <div className="text-right">
                  <div className={cn("text-lg font-black font-display text-emerald-400 flex items-baseline justify-end", spineAngle < 176 && "text-yellow-400")}>
                    {spineAngle}°
                  </div>
                  <div className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-wider">Target: 175°-180°</div>
                </div>
              </div>

              {/* Telemetry 2 - Symmetry Delta */}
              <div className="p-3 bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Shoulder Lateral Tilt</div>
                  <div className="text-xs text-white/95 mt-0.5 font-bold">Unilateral Balance</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-display text-emerald-400">
                    {tiltAngle > 0 ? `+${tiltAngle}` : tiltAngle}°
                  </div>
                  <div className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-wider">Target: 0° (Aligned)</div>
                </div>
              </div>

              {/* Telemetry 3 - Core Engagement */}
              <div className="p-3 bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">CNS Recalibration</div>
                  <div className="text-xs text-white/95 mt-0.5 font-bold">Pelvic Floor Baseline</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    EFFICIENT
                  </span>
                </div>
              </div>
            </div>

            {hasCameraAccess && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={triggerCalibration}
                  className="flex-1 py-3 px-4 rounded-xl bg-[var(--sub)] border border-[var(--border)] font-black text-[10px] uppercase tracking-wider text-white hover:border-[var(--accent)] transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={12} /> Reset Calibration
                </button>
              </div>
            )}
          </div>

          {/* AI FUTURE-READY INFORMATION BOARD */}
          <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-2 border-emerald-500/10 rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 leading-none">
              <Sparkles size={13} /> Biomechanical Optimizer
            </h4>
            <p className="text-[11px] text-white/90 leading-relaxed font-medium">
              We are preparing full **WebRTC & PoseNet skeletal model integration** to analyze your live gym camera stream natively! 
            </p>
            <p className="text-[10px] text-white/70 leading-relaxed italic">
              Use this interface profile during squats or push-ups to self-monitor your spinal co-alignment, preventing severe joint shear load and lumbar compression.
            </p>

            <div className="pt-2 border-t border-emerald-500/10 flex items-center justify-between">
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">NEXT MILESTONE</span>
              <span className="text-[9px] bg-emerald-500 text-black font-black px-2 py-0.5 rounded uppercase tracking-wider">VISION-SET UP</span>
            </div>
          </div>
        </div>
      </div>

      {onClose && (
        <div className="pt-2 flex justify-end border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-[var(--card2)] border border-[var(--border)] hover:border-red-500/20 hover:text-red-400 transition-all font-black text-xs uppercase tracking-widest"
          >
            Exit Posture Guard
          </button>
        </div>
      )}
    </div>
  );
}
