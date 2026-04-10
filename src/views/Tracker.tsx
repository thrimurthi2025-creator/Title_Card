import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Clapperboard, AlertCircle } from 'lucide-react';
import { MovieEntry } from './Feed';

export function Tracker({ selectedMovie, time, toggleTimer, resetTimer, isRunning }: { selectedMovie: MovieEntry | null, time: number, toggleTimer: () => void, resetTimer: () => void, isRunning: boolean }) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTitleCardTime = (timeStr: string) => {
    if (!timeStr) return 0;
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':').map(Number);
      if (parts.length === 3) {
        return (parts[0] * 3600) + (parts[1] * 60) + (parts[2] || 0);
      } else if (parts.length === 2) {
        return (parts[0] * 60) + (parts[1] || 0);
      }
    }
    const hoursMatch = timeStr.match(/(\d+)h/);
    const minsMatch = timeStr.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const mins = minsMatch ? parseInt(minsMatch[1]) : 0;
    return (hours * 3600) + (mins * 60);
  };

  const targetSeconds = selectedMovie ? parseTitleCardTime(selectedMovie.titleCardTime) : 0;
  const progressPercentage = targetSeconds > 0 ? Math.min((time / targetSeconds) * 100, 100) : 0;

  const getAlert = () => {
    if (!selectedMovie) return null;
    if (time >= targetSeconds + 60) return "🎬 Title card moment passed";
    if (time >= targetSeconds) return "🔥 TITLE CARD!";
    if (time >= targetSeconds - 30) return "📱 Get your camera ready";
    if (time >= targetSeconds - 120) return "Get ready… 🎬";
    return null;
  };

  const alert = getAlert();

  if (!selectedMovie) {
    return (
      <div className="p-6 space-y-8 max-w-md mx-auto min-h-screen flex flex-col items-center justify-center text-center">
        <Clapperboard className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-heading font-extrabold text-foreground">Select a movie from Feed to start tracking</h1>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-md mx-auto min-h-screen">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-heading font-extrabold text-foreground">Title Card Tracker</h1>
        <p className="text-muted-foreground text-sm">Start your movie and track the perfect title card moment</p>
      </div>

      <div className="bg-white border-2 border-foreground rounded-2xl p-6 shadow-pop space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-tertiary rounded-xl flex items-center justify-center border-2 border-foreground shadow-pop">
            <Clapperboard className="w-8 h-8 text-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-extrabold text-foreground">{selectedMovie.title}</h2>
            <p className="text-muted-foreground font-bold text-sm">{selectedMovie.releaseYear} • Title Card: {selectedMovie.titleCardTime}</p>
          </div>
        </div>
      </div>

      <div className="text-center py-8">
        <div className="text-7xl font-mono font-black text-foreground tracking-tighter mb-6">
          {formatTime(time)}
        </div>
        
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden border-2 border-foreground shadow-inner relative">
          <motion.div 
            className={cn(
              "h-full rounded-full origin-left",
              progressPercentage >= 100 ? "bg-accent" : "bg-foreground"
            )}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progressPercentage / 100 }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs font-bold text-muted-foreground">
          <span>00:00</span>
          <span>{selectedMovie.titleCardTime}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={toggleTimer}
          className={cn(
            "flex items-center gap-2 px-8 py-4 rounded-full font-black text-white border-2 border-foreground shadow-pop transition-all",
            isRunning ? "bg-secondary" : "bg-accent"
          )}
        >
          {isRunning ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Start Watching</>}
        </button>
        <button 
          onClick={resetTimer}
          className="flex items-center gap-2 px-6 py-4 rounded-full font-black text-foreground bg-white border-2 border-foreground shadow-pop transition-all hover:bg-muted"
        >
          <RotateCcw className="w-5 h-5" /> Reset
        </button>
      </div>

      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white border-2 border-accent p-6 rounded-2xl shadow-pop text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-accent/10 animate-pulse"></div>
            <div className="relative z-10 flex items-center justify-center gap-3 text-accent font-black text-lg">
              <AlertCircle className="w-6 h-6" />
              {alert}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
