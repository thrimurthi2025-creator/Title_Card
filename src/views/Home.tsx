import { useEffect, useState } from 'react';
import { Play, Star, Ticket, Loader2, Trash2, Clock, Clapperboard, X } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { LoginModal } from '../components/LoginModal';

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
  titleCardTime?: string;
}

function SafeImage({ src, alt, className }: { src?: string, alt: string, className?: string }) {
  const [error, setError] = useState(false);

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

export function Home({ user, isAdmin }: { user: User | null, isAdmin?: boolean }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const onRestrictedAction = () => setIsLoginModalOpen(true);

  const heroMovies = movies.slice(0, 5);
  const spotlightMovies = movies.slice(0, 3);

  const [heroIndex, setHeroIndex] = useState(0);

  // Auto-play for Hero
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const handleHeroDragEnd = (_: any, info: any) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      setHeroIndex(prev => (prev - 1 + heroMovies.length) % heroMovies.length);
    } else if (info.offset.x < -threshold) {
      setHeroIndex(prev => (prev + 1) % heroMovies.length);
    }
  };

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
          image: data.image,
          titleCardTime: data.titleCardTime
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

  return (
    <div className="p-4 space-y-12 sm:p-8 lg:p-12">
      {/* Intro Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center space-y-6 py-8 sm:py-12"
      >
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/20">
          Never Miss a <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Title Card</span> Again.
        </h1>
        <p className="text-white/50 text-base sm:text-lg font-medium leading-relaxed max-w-xl mx-auto">
          Lumiere tracks and notifies you exactly when movie title cards are released. 
          The ultimate companion for cinephiles and collectors.
        </p>
      </motion.div>

      {/* Hero Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase">Featured Premieres</p>
          <div className="flex gap-1.5">
            {heroMovies.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  heroIndex === idx ? "bg-white w-4" : "bg-white/20"
                )}
              />
            ))}
          </div>
        </div>
        
        <div className="relative aspect-[2/3] sm:aspect-[16/9] rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl bg-[#1A1525]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={heroMovies[heroIndex].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleHeroDragEnd}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <SafeImage 
                src={heroMovies[heroIndex].posterImage} 
                alt={heroMovies[heroIndex].title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0914] via-transparent to-transparent opacity-80" />
              
              {/* Title Card Time Badge */}
              {heroMovies[heroIndex].titleCardTime && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.5, 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20 
                  }}
                  className="absolute top-6 left-6 z-20"
                >
                  <div className="relative group/time">
                    <div className="absolute inset-0 bg-pink-500/30 blur-xl rounded-full animate-pulse"></div>
                    <div className="relative flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-violet-500/20 backdrop-blur-xl border border-white/30 px-5 py-2.5 rounded-full shadow-[0_8px_32px_rgba(236,72,153,0.2)]">
                      <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">Title Card</span>
                      <span className="text-sm font-black text-white tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                        {heroMovies[heroIndex].titleCardTime}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0B0914] via-[#0B0914]/70 to-transparent pt-40">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase">{heroMovies[heroIndex].genre}</p>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{heroMovies[heroIndex].duration}</p>
                    </div>
                    <h3 className="text-3xl font-black leading-tight mb-3 tracking-tight drop-shadow-lg">{heroMovies[heroIndex].title}</h3>
                    {heroMovies[heroIndex].description && (
                      <p className="text-white/70 text-sm leading-relaxed mb-6 font-medium max-h-24 overflow-y-auto pr-2 custom-scrollbar drop-shadow-md">
                        {heroMovies[heroIndex].description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3 pb-1">
                    <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-sm font-black border border-white/10">
                      <Star className="w-4 h-4 fill-white text-white" />
                      {heroMovies[heroIndex].rating}
                    </div>
                    {isAdmin && (
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(heroMovies[heroIndex].id);
                        }}
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Recent Spotlights */}
      {spotlightMovies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold">Now in Theaters</h3>
            <button 
              onClick={() => navigate('/feed')}
              className="text-white/40 text-xs font-bold tracking-widest uppercase hover:text-white transition-colors"
            >
              See All
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar scroll-smooth scroll-px-4 -mx-4 px-4">
            {spotlightMovies.map((movie, idx) => (
              <motion.div 
                key={movie.id} 
                className="min-w-[280px] sm:min-w-[350px] lg:min-w-[400px] snap-start group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + Math.min(idx, 5) * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-4 shadow-2xl border border-white/5">
                  <SafeImage 
                    src={movie.image} 
                    alt={movie.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0914] via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                  
                  {/* Title Card Time Badge */}
                  {movie.titleCardTime && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0, y: 5 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 0.8 + idx * 0.1, 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20 
                      }}
                      className="absolute top-4 left-4 z-20"
                    >
                      <div className="relative group/time">
                        <div className="absolute inset-0 bg-pink-500/20 blur-lg rounded-full animate-pulse"></div>
                        <div className="relative flex items-center gap-1.5 bg-gradient-to-r from-pink-500/10 to-violet-500/10 backdrop-blur-xl border border-white/20 px-3.5 py-2 rounded-full shadow-[0_4px_16px_rgba(236,72,153,0.15)]">
                          <span className="text-[7px] font-black text-white/60 uppercase tracking-widest">Title Card</span>
                          <span className="text-[11px] font-black text-white tracking-wider">
                            {movie.titleCardTime}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-white text-[#0B0914] px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {movie.rating}
                      </div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{movie.genre}</p>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{movie.duration}</p>
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
