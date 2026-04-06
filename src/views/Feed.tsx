import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SearchX, Clapperboard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';

interface MovieEntry {
  id: string;
  title: string;
  titleCardTime: string;
  totalDuration?: string;
  image?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  releaseYear?: string;
}

export function Feed() {
  const [movies, setMovies] = useState<MovieEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const movieData: MovieEntry[] = [];
      snapshot.forEach((doc) => {
        movieData.push({ id: doc.id, ...doc.data() } as MovieEntry);
      });
      setMovies(movieData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching movies:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery) || 
    movie.authorName.toLowerCase().includes(searchQuery) ||
    (movie.releaseYear && movie.releaseYear.includes(searchQuery))
  );

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1">
          {searchQuery ? `Search: ${searchParams.get('search')}` : 'Community Feed'}
        </h2>
        <p className="text-white/50 text-sm">
          {searchQuery ? `Found ${filteredMovies.length} results` : 'Discover cinematic title cards curated by Cinephile.'}
        </p>
      </div>

      {filteredMovies.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/10"
        >
          <SearchX className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">
            {searchQuery ? 'No title cards found for your search.' : 'No title cards shared yet.'}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {filteredMovies.map((movie) => (
            <motion.div 
              key={movie.id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="bg-[#1A1525] rounded-[2rem] p-5 border border-white/5 shadow-xl hover:border-white/10 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-lg border border-white/10">
                    {movie.authorName.toLowerCase().includes('diljith') || movie.authorName.toLowerCase().includes('cinephile') || movie.authorName.toLowerCase() === 'admin' ? (
                      <Clapperboard className="w-5 h-5 text-white/90" />
                    ) : (
                      movie.authorName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm">@{movie.authorName.toLowerCase().includes('diljith') || movie.authorName.toLowerCase().includes('cinephile') || movie.authorName.toLowerCase() === 'admin' ? 'cinephile' : movie.authorName.toLowerCase().replace(/\s+/g, '_')}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">
                      {formatDistanceToNow(new Date(movie.createdAt)).toUpperCase()} AGO
                    </p>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black mb-5 group">
                {movie.image ? (
                  <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">No Image</div>
                )}
              </div>

              {/* Details */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold uppercase tracking-wide">{movie.title}</h3>
                  {movie.releaseYear && (
                    <span className="px-3 py-1 bg-white/5 text-white/60 text-xs font-mono rounded-full border border-white/5">
                      {movie.releaseYear}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-white/60 leading-relaxed">
                  <p>
                    Title card: <span className="bg-white/10 text-white px-2 py-0.5 rounded font-bold ml-1">{movie.titleCardTime}</span>
                  </p>
                  {movie.totalDuration && (
                    <p>
                      Duration: <span className="text-white font-mono">{movie.totalDuration}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
