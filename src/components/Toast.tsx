import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export default function Toast({ message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 md:left-auto md:right-5 bg-[#111111] border border-neutral-800 text-white px-5 py-3.5 rounded-xl z-[9999] shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex items-center gap-3 animate-fade-in">
      <span className="text-red-500 text-sm font-bold">●</span>
      <span className="text-xs font-semibold tracking-wider">{message}</span>
    </div>
  );
}
