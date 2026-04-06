import { useEffect, useState } from 'react';
import { Play, Star, Ticket, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Movie {
  title: string;
  genre: string;
  duration: string;
  rating: number;
  description: string;
  posterUrl?: string;
  backdropUrl?: string;
}

let cachedMoviesV4: Movie[] | null = null;

function SafeImage({ src, alt, className }: { src?: string, alt: string, className?: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={cn("bg-gradient-to-br from-[#2A2438] to-[#1A1525] flex items-center justify-center p-4 text-center", className)}>
        <span className="text-white/50 font-bold text-lg">{alt}</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
}

export function Home() {
  const [movies, setMovies] = useState<Movie[]>(cachedMoviesV4 || []);
  const [loading, setLoading] = useState(!cachedMoviesV4);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (cachedMoviesV4) return;

    async function fetchLatestMovies() {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        // Create a promise that rejects after 8 seconds
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Request timed out")), 8000)
        );

        const fetchPromise = ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Search Google for 6 latest popular Malayalam movies currently playing in theaters right now or very recently released (Current Date: ${currentDate}). Return a JSON array of objects with title, genre, duration (e.g., "2h 15m"), rating (number out of 10), description, posterUrl (MUST be a valid, direct image URL to the official movie poster, e.g., from Wikipedia or IMDB. Ensure it ends in .jpg or .png), and backdropUrl (A valid direct image URL to a landscape scene or backdrop from the movie).`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  rating: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  posterUrl: { type: Type.STRING },
                  backdropUrl: { type: Type.STRING }
                },
                required: ["title", "genre", "duration", "rating", "description"]
              }
            }
          }
        });

        // Race the fetch against the timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]) as any;

        let text = response.text || '[]';
        text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const data = JSON.parse(text);
        if (data && data.length > 0) {
          cachedMoviesV4 = data;
          setMovies(data);
        } else {
          throw new Error("No data returned");
        }
      } catch (error) {
        console.error("Failed to fetch movies:", error);
        // Fallback data if API fails or rate limits
        const fallbackData = [
          { title: "Aavesham", genre: "Action/Comedy", duration: "2h 38m", rating: 8.9, description: "Three college students seek help from a local gangster.", posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/62/Aavesham_poster.jpg", backdropUrl: "https://www.nowrunning.com/content/movie/2023/aaves-29003/bg-aavesham.jpg" },
          { title: "Manjummel Boys", genre: "Survival Thriller", duration: "2h 15m", rating: 8.6, description: "A group of friends face a crisis at Guna Caves.", posterUrl: "https://upload.wikimedia.org/wikipedia/en/e/e0/Manjummel_Boys_poster.jpg", backdropUrl: "https://m.media-amazon.com/images/M/MV5BMTgzYjE1YTMtOTFmOC00NmQ0LWE2M2MtYjYyODQxZmQxN2M4XkEyXkFqcGdeQXVyMjkxNzQ1NDI@._V1_.jpg" },
          { title: "Premalu", genre: "Rom-Com", duration: "2h 36m", rating: 8.3, description: "A young man's journey of love and self-discovery in Hyderabad.", posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/1e/Premalu_film_poster.jpg", backdropUrl: "https://m.media-amazon.com/images/M/MV5BOGJjMzE0NjItN2M4OC00N2MwLWEwN2ItM2Q0YjFjY2RkM2Q4XkEyXkFqcGdeQXVyMjkxNzQ1NDI@._V1_.jpg" },
          { title: "Bramayugam", genre: "Horror/Thriller", duration: "2h 19m", rating: 8.5, description: "A singer escapes slavery only to stumble upon a mysterious mansion.", posterUrl: "https://upload.wikimedia.org/wikipedia/en/7/78/Bramayugam_poster.jpg", backdropUrl: "https://upload.wikimedia.org/wikipedia/en/7/78/Bramayugam_poster.jpg" },
          { title: "Aadujeevitham", genre: "Drama/Survival", duration: "2h 52m", rating: 8.8, description: "An Indian migrant worker is forced into slavery as a goatherd in Saudi Arabia.", posterUrl: "https://upload.wikimedia.org/wikipedia/en/df/Aadujeevitham_poster.jpg", backdropUrl: "https://upload.wikimedia.org/wikipedia/en/df/Aadujeevitham_poster.jpg" },
          { title: "Turbo", genre: "Action/Comedy", duration: "2h 35m", rating: 7.5, description: "Jose, a jeep driver, gets into trouble and is forced to relocate to Chennai.", posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/1f/Turbo_2024_poster.jpg", backdropUrl: "https://upload.wikimedia.org/wikipedia/en/1/1f/Turbo_2024_poster.jpg" }
        ];
        cachedMoviesV4 = fallbackData;
        setMovies(fallbackData);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLatestMovies();
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
        <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
        <p className="text-[#00E5FF] font-bold tracking-widest uppercase text-xs animate-pulse">Fetching Latest Movies...</p>
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
              <p className="text-[#00E5FF] text-xs font-bold tracking-widest uppercase mb-1">Premiering Now</p>
              <h2 className="text-4xl font-bold tracking-tight line-clamp-1">{currentHero.title}</h2>
            </div>
            <div className="flex gap-1.5">
              {heroMovies.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    idx === heroIndex ? "w-6 bg-[#00E5FF]" : "w-2 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500">
            <SafeImage 
              key={currentHero.title} // Force re-render for animation
              src={currentHero.posterUrl} 
              alt={currentHero.title} 
              className="w-full h-full object-cover animate-in fade-in duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0914] via-[#0B0914]/40 to-transparent opacity-90"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#1A1525]/80 backdrop-blur-xl m-4 rounded-[2rem] border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white/60 text-xs mb-1">{currentHero.genre} • {currentHero.duration}</p>
                  <h3 className="text-xl font-bold line-clamp-1">{currentHero.title}</h3>
                </div>
                <div className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-bold shrink-0">
                  <Star className="w-3 h-3 fill-current" />
                  {currentHero.rating}
                </div>
              </div>
              <div className="flex gap-3">
                <motion.a 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href={`https://in.bookmyshow.com/explore/movies`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#00E5FF] text-[#0B0914] py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#00E5FF]/90 transition-colors"
                >
                  <Ticket className="w-5 h-5" />
                  Book Tickets
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
            <button className="text-[#00E5FF] text-xs font-bold tracking-widest uppercase hover:text-white transition-colors">See All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {spotlightMovies.map((movie, idx) => (
              <motion.div 
                key={idx} 
                className="min-w-[280px] snap-start"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="relative aspect-video rounded-3xl overflow-hidden mb-3 shadow-lg">
                  <SafeImage 
                    src={movie.backdropUrl || movie.posterUrl} 
                    alt={movie.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute bottom-3 left-3 bg-[#2A2438]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#00E5FF] border border-white/10 uppercase tracking-wider">
                    New Release
                  </div>
                </div>
                <h4 className="font-bold text-sm line-clamp-1 mt-1">{movie.title}</h4>
                <p className="text-xs text-white/50">{movie.genre} • {movie.rating}/10</p>
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
