import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MovieEntry } from '../views/Feed';
import { cn } from '../lib/utils';

interface FloatingTrackerProps {
  isRunning: boolean;
  time: number; // in seconds
  selectedMovie: MovieEntry | null;
}

export function FloatingTracker({ isRunning, time, selectedMovie }: FloatingTrackerProps) {
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTitleCardTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const hoursMatch = timeStr.match(/(\d+)h/);
    const minsMatch = timeStr.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const mins = minsMatch ? parseInt(minsMatch[1]) : 0;
    return hours * 60 + mins;
  };

  const targetMinutes = selectedMovie ? parseTitleCardTime(selectedMovie.titleCardTime) : 0;
  const targetSeconds = targetMinutes * 60;

  // Alert logic
  let alertClass = "";
  if (time >= targetSeconds) {
    alertClass = "bg-accent text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] border-accent"; // highlight
  } else if (time >= targetSeconds - 60) {
    alertClass = "bg-foreground text-background shadow-[0_0_15px_rgba(0,0,0,0.5)] animate-pulse border-foreground"; // stronger pulse
  } else if (time >= targetSeconds - 120) {
    alertClass = "bg-foreground/90 text-background shadow-[0_0_10px_rgba(0,0,0,0.3)] border-foreground/90"; // subtle glow
  } else {
    alertClass = "bg-foreground/80 text-background border-foreground/50"; // default dark glassmorphism
  }

  return (
    <AnimatePresence>
      {isRunning && selectedMovie && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]"
        >
          <button
            onClick={() => navigate('/tracker')}
            className={cn(
              "flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-md border-2 transition-all duration-300",
              alertClass
            )}
          >
            <span className="font-mono font-black text-lg tracking-tight">
              ⏱️ {formatTime(time)}
            </span>
            <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
            <span className="font-heading font-bold text-sm truncate max-w-[120px]">
              {selectedMovie.title}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
