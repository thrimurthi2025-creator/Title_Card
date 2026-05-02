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
    <div className="p-6 space-y-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center space-y-1">
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-foreground">Title Card Tracker</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Start your movie and track the perfect title card moment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="bg-white border-2 border-foreground rounded-2xl p-6 shadow-pop space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-tertiary rounded-xl flex items-center justify-center border-2 border-foreground shadow-pop shrink-0">
                <Clapperboard className="w-10 h-10 text-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-extrabold text-foreground leading-tight">{selectedMovie.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-white border-2 border-foreground text-[10px] font-black uppercase tracking-widest rounded-full">{selectedMovie.releaseYear}</span>
                  <span className="px-3 py-1 bg-white border-2 border-foreground text-[10px] font-black uppercase tracking-widest rounded-full">{selectedMovie.totalDuration}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Expected Title Card At</p>
              <p className="text-4xl font-black text-accent tracking-tighter">{selectedMovie.titleCardTime}</p>
            </div>

            {selectedMovie.image && (
              <div className="aspect-video rounded-xl border-2 border-foreground overflow-hidden shadow-pop">
                <img src={selectedMovie.image} alt={selectedMovie.title} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <AnimatePresence>
            {alert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border-2 border-accent p-8 rounded-2xl shadow-pop text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-accent/10 animate-pulse"></div>
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-center gap-3 text-accent font-black text-2xl uppercase tracking-tighter">
                    <AlertCircle className="w-8 h-8" />
                    {alert}
                  </div>
                  <p className="text-accent/70 text-xs font-bold uppercase tracking-widest">Get Ready!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white border-2 border-foreground rounded-2xl p-8 lg:p-12 shadow-pop space-y-12">
          <div className="text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4">Elapsed Time</p>
            <div className="text-8xl lg:text-9xl font-mono font-black text-foreground tracking-tighter tabular-nums mb-8 leading-none">
              {formatTime(time)}
            </div>
            
            <div className="w-full h-6 bg-muted rounded-full overflow-hidden border-2 border-foreground shadow-inner relative">
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
            <div className="flex justify-between mt-3 text-xs font-black text-muted-foreground uppercase tracking-widest">
              <span>00:00</span>
              <span>{selectedMovie.titleCardTime}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={toggleTimer}
              className={cn(
                "flex-1 flex items-center justify-center gap-3 px-10 py-6 rounded-full font-black text-lg text-white border-2 border-foreground shadow-pop transition-all uppercase tracking-widest",
                isRunning ? "bg-secondary" : "bg-accent"
              )}
            >
              {isRunning ? <><Pause className="w-6 h-6" /> Pause</> : <><Play className="w-6 h-6" /> Resume</>}
            </button>
            <button 
              onClick={resetTimer}
              className="flex-1 flex items-center justify-center gap-3 px-10 py-6 rounded-full font-black text-lg text-foreground bg-white border-2 border-foreground shadow-pop transition-all hover:bg-muted uppercase tracking-widest"
            >
              <RotateCcw className="w-6 h-6" /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
