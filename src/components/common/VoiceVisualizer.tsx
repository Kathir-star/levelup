import { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  state: 'idle' | 'listening' | 'speaking' | 'thinking';
  isListening: boolean;
  width?: number;
  height?: number;
}

export default function VoiceVisualizer({
  state,
  isListening,
  width = 300,
  height = 140
}: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Setup Audio Context when isListening becomes true
    if (isListening) {
      const initAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;

          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;

          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64; // Smaller for cleaner display
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          dataArrayRef.current = dataArray;
        } catch (err) {
          console.warn("Microphone access denied or unsupported, using fluid simulator:", err);
          cleanupAudio();
        }
      };
      initAudio();
    } else {
      cleanupAudio();
    }

    return () => {
      cleanupAudio();
    };
  }, [isListening]);

  const cleanupAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(e => console.log('AudioContext close error:', e));
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localPhase = 0;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Get real data or synthesize it
      let data: number[] = [];
      const isRealData = analyserRef.current && dataArrayRef.current;

      if (isRealData && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        data = Array.from(dataArrayRef.current);
      } else {
        // Synthesize dynamic data depending on the state
        const dataLength = 32;
        localPhase += state === 'listening' ? 0.25 : state === 'speaking' ? 0.15 : state === 'thinking' ? 0.35 : 0.05;
        
        for (let i = 0; i < dataLength; i++) {
          let value = 0;
          if (state === 'listening') {
            value = 40 + Math.sin(i * 0.4 + localPhase) * 35 + Math.cos(i * 0.9 - localPhase) * 20;
          } else if (state === 'speaking') {
            value = 30 + Math.sin(i * 0.3 + localPhase) * 25 + Math.cos(i * 0.7 + localPhase) * 15;
          } else if (state === 'thinking') {
            value = 15 + Math.sin(i * 0.8 + localPhase) * 10;
          } else {
            // Idle
            value = 8 + Math.sin(i * 0.2 + localPhase) * 4;
          }
          data.push(value);
        }
      }

      // Render futuristic glowing audio visualizer spectrum
      ctx.save();
      
      const barsCount = data.length;
      const barWidth = (w / barsCount) * 0.7;
      const gap = (w / barsCount) * 0.3;
      
      // Setup neon glow
      ctx.shadowBlur = 12;
      
      if (state === 'listening') {
        ctx.strokeStyle = '#ef4444'; // Hot red
        ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
      } else if (state === 'speaking') {
        ctx.strokeStyle = '#10b981'; // Emerald green
        ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
      } else if (state === 'thinking') {
        ctx.strokeStyle = '#6366f1'; // Indigo
        ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
        ctx.fillStyle = 'rgba(99, 102, 241, 0.45)';
      } else {
        ctx.strokeStyle = '#06b6d4'; // Cyan
        ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
      }

      // Draw mirrored wave lines or bars
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();

      for (let i = 0; i < barsCount; i++) {
        // Normalize value to a fraction
        const val = isRealData ? (data[i] / 255) * h * 0.85 : (data[i] / 100) * h * 0.85;
        const x = i * (barWidth + gap) + gap / 2;
        const centerY = h / 2;
        
        // Draw vertical center-symmetric bars
        ctx.moveTo(x, centerY - val / 2 - 2);
        ctx.lineTo(x, centerY + val / 2 + 2);
      }
      ctx.stroke();

      // Add a subtle particle ambient line across center
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      ctx.restore();
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state, isListening]);

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-black/40 border border-white/5 rounded-2xl w-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full max-w-full block"
      />
    </div>
  );
}
