import { useEffect, useState } from 'react';
import { Play, Star, Ticket, Loader2, Trash2 } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: string;
  rating: number;
  description: string;
  posterImage?: string;
  backdropImage?: string;
  image?: string;
}

function SafeImage({ src, alt, className }: { src?: string, alt: string, className?: string }) {
  const [error, setError] = useState(false);

  // If src is empty or has error, we try to show nothing or a placeholder
  // But the user wants the poster to appear. 
  // If the URL is invalid, we can't do much except show the alt text.
  
  if (!src || error) {
    const isShareLink = src?.includes('share.google') || src?.includes('photos.app.goo.gl');
    const isBookMyShow = src?.includes('bookmyshow.com');
    
    return (
      <div className={cn("bg-[#1A1A1A] flex items-center justify-center p-6 text-center", className)}>
        <div className="flex flex-col items-center gap-3 max-w-[80%]">
          <Clapperboard className="w-10 h-10 text-white/10" />
          <div className="space-y-1">
            <span className="block text-white/40 font-bold text-sm uppercase tracking-widest">{alt}</span>
            {error && (
              <span className="block text-red-400/60 text-[10px] italic leading-tight">
                {isShareLink 
                  ? "Google Share links are not direct images. Please use a direct link." 
                  : isBookMyShow
                  ? "BookMyShow page links are not direct images. Please use a direct image link."
                  : "Image failed to load. Check the URL."}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => {
        console.error(`Failed to load image: ${src}`);
        setError(true);
      }}
      referrerPolicy="no-referrer"
    />
  );
}

import { Clapperboard } from 'lucide-react';

export function Home({ isAdmin }: { isAdmin?: boolean }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      await deleteDoc(doc(db, 'movies', id));
    } catch (err) {
      console.error("Error deleting movie from home:", err);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'movies'), 
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const featuredMovies: Movie[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        featuredMovies.push({
          id: doc.id,
          title: data.title,
          genre: data.genre || 'Drama',
          duration: data.totalDuration || '2h',
          rating: data.rating || 0,
          description: data.description || '',
          posterImage: data.posterImage || data.image,
          backdropImage: data.backdropImage || data.image,
          image: data.image
        });
      });
      
      setMovies(featuredMovies);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching featured movies:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (movies.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(3, movies.length));
    }, 5000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
        <p className="text-white/60 font-bold tracking-widest uppercase text-xs animate-pulse">Loading Featured Movies...</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
          <Ticket className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-bold text-white/80">No Featured Movies</h2>
        <p className="text-white/40 max-w-xs">The admin hasn't featured any movies on the home screen yet.</p>
      </div>
    );
  }

  const heroMovies = movies.slice(0, 3);
  const spotlightMovies = movies.slice(3);
  const currentHero = heroMovies[heroIndex];

  return (
    <div className="p-4 space-y-8">
      {/* Hero Section */}
      <AnimatePresence mode="wait">
        {currentHero && (
          <motion.div 
            key={currentHero.title}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">Premiering Now</p>
              <h2 className="text-4xl font-bold tracking-tight line-clamp-1">{currentHero.title}</h2>
            </div>
            <div className="flex gap-1.5">
              {heroMovies.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    idx === heroIndex ? "w-6 bg-white" : "w-2 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="relative w-full aspect-[2/3] sm:aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 group">
            <SafeImage 
              key={currentHero.title} // Force re-render for animation
              src={currentHero.posterImage} 
              alt={currentHero.title} 
              className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0914] via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-60"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0B0914] via-[#0B0914]/70 to-transparent pt-40">
              <div className="flex justify-between items-end mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase">{currentHero.genre}</p>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{currentHero.duration}</p>
                  </div>
                  <h3 className="text-3xl font-black leading-tight mb-3 tracking-tight drop-shadow-lg">{currentHero.title}</h3>
                  {currentHero.description && (
                    <p className="text-white/70 text-sm leading-relaxed mb-6 font-medium max-h-24 overflow-y-auto pr-2 custom-scrollbar drop-shadow-md">
                      {currentHero.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3 pb-1">
                  <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-sm font-black border border-white/10">
                    <Star className="w-4 h-4 fill-white text-white" />
                    {currentHero.rating}
                  </div>
                  {isAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(currentHero.id)}
                      className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <motion.a 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://in.bookmyshow.com/explore/movies`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white text-[#0B0914] py-5 rounded-[2rem] font-black text-base flex items-center justify-center gap-3 shadow-xl hover:bg-gray-100 transition-all group/btn"
                >
                  <Ticket className="w-6 h-6 transition-transform group-hover/btn:rotate-12" />
                  GET TICKETS NOW
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Recent Spotlights */}
      {spotlightMovies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold">Now in Theaters</h3>
            <button className="text-white/40 text-xs font-bold tracking-widest uppercase hover:text-white transition-colors">See All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {spotlightMovies.map((movie, idx) => (
              <motion.div 
                key={movie.id} 
                className="min-w-[300px] snap-start group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-4 shadow-2xl border border-white/5">
                  <SafeImage 
                    src={movie.image} 
                    alt={movie.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0914] via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-white text-[#0B0914] px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {movie.rating}
                      </div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{movie.genre}</p>
                    </div>
                    <h4 className="font-black text-lg text-white leading-tight line-clamp-1">{movie.title}</h4>
                  </div>

                  {isAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(movie.id);
                      }}
                      className="absolute top-4 right-4 p-2.5 bg-red-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
                {movie.description && (
                  <p className="text-white/40 text-[11px] leading-relaxed line-clamp-2 px-1 group-hover:text-white/60 transition-colors">
                    {movie.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* BookMyShow Direct Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.a 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="https://in.bookmyshow.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block w-full bg-gradient-to-r from-[#F84464]/20 to-[#F84464]/5 border border-[#F84464]/20 rounded-[2rem] p-6 hover:from-[#F84464]/30 transition-all group relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F84464]/20 to-transparent"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-2xl font-bold text-[#F84464] mb-1">BookMyShow</h3>
              <p className="text-white/60 text-sm">Book tickets for your favorite movies instantly</p>
            </div>
            <div className="w-12 h-12 bg-[#F84464] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(248,68,100,0.4)] shrink-0">
              <Ticket className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.a>
      </motion.div>
    </div>
  );
}
