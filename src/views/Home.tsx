import React, { useEffect, useState } from 'react';
import { Play, Star, Ticket, Trash2, Clock, Clapperboard, X } from 'lucide-react';
import { MovieLoader } from '../components/MovieLoader';
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
      <div className={cn("bg-muted border-2 border-foreground shadow-pop flex items-center justify-center p-6 text-center", className)}>
        <div className="flex flex-col items-center gap-3 max-w-[80%]">
          <Clapperboard className="w-10 h-10 text-muted-foreground" strokeWidth={2.5} />
          <div className="space-y-1">
            <span className="block text-muted-foreground font-bold text-sm uppercase tracking-widest">{alt}</span>
            {error && (
              <span className="block text-secondary text-[10px] italic leading-tight font-bold">
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

export const Home = React.memo(function Home({ user, isAdmin }: { user: User | null, isAdmin?: boolean }) {
  const [movies, setMovies] = useState<Movie[]>(() => {
    const cached = localStorage.getItem('homeMovies');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(() => {
    const cached = localStorage.getItem('homeMovies');
    return cached ? false : true;
  });
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
    if (!localStorage.getItem('homeMovies')) {
      setLoading(true);
    }
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
      localStorage.setItem('homeMovies', JSON.stringify(featuredMovies));
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
        <MovieLoader className="w-16 h-16 text-accent" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">Loading Featured Movies...</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-foreground shadow-pop">
          <Ticket className="w-10 h-10 text-tertiary" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-heading font-bold text-foreground">No Featured Movies</h2>
        <p className="text-muted-foreground max-w-xs">The admin hasn't featured any movies on the home screen yet.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 p-4 space-y-12 sm:p-8 lg:p-12">
        {/* Compact Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", type: "spring", stiffness: 200, damping: 20 }}
          className="max-w-2xl mx-auto text-center space-y-4 py-4 sm:py-8 relative"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-tertiary rounded-full -z-10 mix-blend-multiply opacity-50 blur-3xl"></div>
          <h1 className="relative text-4xl sm:text-6xl font-heading font-extrabold tracking-tighter leading-[1.1] text-foreground">
            Never Miss a<br />
            <span className="text-accent relative inline-block">
              Title Card
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 Q25,20 50,10 T100,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span> Again
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg font-medium tracking-wide mt-4">
            Lumiere helps you never miss iconic movie title cards. Discover, track, and capture cinematic moments.
          </p>
        </motion.div>

        {/* Hero Section (Featured) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-foreground text-[10px] font-bold tracking-widest uppercase">Featured Premieres</p>
            <div className="flex gap-1.5">
              {heroMovies.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300 border border-foreground",
                    heroIndex === idx ? "bg-accent w-6" : "bg-white"
                  )}
                />
              ))}
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative aspect-[2/3] sm:aspect-[16/9] blob-radius overflow-hidden shadow-pop bg-white border-2 border-foreground"
            style={{ willChange: 'transform, opacity' }}
          >
            <AnimatePresence>
              <motion.div 
                key={heroMovies[heroIndex].id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "linear" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleHeroDragEnd}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{ willChange: 'opacity' }}
              >
                <SafeImage 
                  src={heroMovies[heroIndex].posterImage} 
                  alt={heroMovies[heroIndex].title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent opacity-90" />
                
                {/* Title Card Time Badge */}
                {heroMovies[heroIndex].titleCardTime && (
                  <div className="absolute top-6 left-6 z-20">
                    <div className="relative flex items-center gap-2 bg-white border-2 border-foreground px-5 py-2.5 rounded-full shadow-pop">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Title Card</span>
                      <span className="text-sm font-black text-accent tracking-wider">
                        {heroMovies[heroIndex].titleCardTime}
                      </span>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white to-transparent pt-40">
                  <div className="flex justify-between items-end mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-accent text-[10px] font-black tracking-[0.3em] uppercase">{heroMovies[heroIndex].genre}</p>
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{heroMovies[heroIndex].duration}</p>
                      </div>
                      <h3 className="text-3xl font-heading font-extrabold leading-tight mb-3 tracking-tight text-foreground">{heroMovies[heroIndex].title}</h3>
                      {heroMovies[heroIndex].description && (
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium line-clamp-3 pr-2">
                          {heroMovies[heroIndex].description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3 pb-1">
                      <div className="flex items-center gap-1.5 bg-tertiary text-foreground px-4 py-2 rounded-full text-sm font-black border-2 border-foreground shadow-pop">
                        <Star className="w-4 h-4 fill-foreground text-foreground" strokeWidth={2.5} />
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
                          className="p-3 bg-white text-secondary rounded-full border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all"
                        >
                          <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <motion.a 
                      whileHover={{ scale: 1.02, x: -2, y: -2 }}
                      whileTap={{ scale: 0.98, x: 2, y: 2 }}
                      href={`https://in.bookmyshow.com/explore/movies`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-accent text-white py-5 rounded-full font-black text-base flex items-center justify-center gap-3 border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all group/btn"
                    >
                      <div className="bg-white rounded-full p-1 border-2 border-foreground">
                        <Ticket className="w-5 h-5 text-accent transition-transform group-hover/btn:rotate-12" strokeWidth={2.5} />
                      </div>
                      GET TICKETS NOW
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

      {/* Recent Spotlights */}
      {spotlightMovies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-heading font-bold text-foreground">Now in Theaters</h3>
            <button 
              onClick={() => navigate('/feed')}
              className="text-muted-foreground text-xs font-bold tracking-widest uppercase hover:text-foreground transition-colors"
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
                whileHover={{ y: -4 }}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-pop-soft border-2 border-foreground bg-white">
                  <SafeImage 
                    src={movie.image} 
                    alt={movie.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                  
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
                        <div className="relative flex items-center gap-1.5 bg-white border-2 border-foreground px-3.5 py-2 rounded-full shadow-pop">
                          <span className="text-[11px] font-black text-secondary tracking-wider">
                            {movie.titleCardTime}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="font-heading font-extrabold text-lg text-foreground leading-tight line-clamp-1 mt-2 bg-white inline-block px-2 py-1 border-2 border-foreground rounded-lg shadow-pop">{movie.title}</h4>
                  </div>

                  {isAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(movie.id);
                      }}
                      className="absolute top-4 right-4 p-2.5 bg-white text-secondary rounded-full border-2 border-foreground opacity-0 group-hover:opacity-100 transition-all shadow-pop hover:shadow-pop-hover active:shadow-pop-active"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    </motion.button>
                  )}
                </div>
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
          whileHover={{ scale: 1.02, x: -2, y: -2 }}
          whileTap={{ scale: 0.98, x: 2, y: 2 }}
          href="https://in.bookmyshow.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block w-full bg-white border-2 border-foreground rounded-xl p-6 shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all group relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-secondary opacity-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-2xl font-heading font-extrabold text-secondary mb-1">BookMyShow</h3>
              <p className="text-muted-foreground text-sm font-medium">Book tickets for your favorite movies instantly</p>
            </div>
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center border-2 border-foreground shadow-pop group-hover:scale-110 transition-transform shrink-0">
              <Ticket className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </motion.a>
      </motion.div>
      </div>
    </div>
  );
});
