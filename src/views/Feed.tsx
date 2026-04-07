import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SearchX, Clapperboard, MessageSquare, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User } from 'firebase/auth';
import { CommentBottomSheet } from '../components/CommentBottomSheet';
import { LoginModal } from '../components/LoginModal';
import { FeedSkeleton } from '../components/ui/FeedSkeleton';

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

export function Feed({ user, setActiveMovieId }: { user: User | null, setActiveMovieId: (id: string | null) => void }) {
  const [movies, setMovies] = useState<MovieEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const navigate = useNavigate();

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

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
    return <FeedSkeleton />;
  }

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery) || 
    movie.authorName.toLowerCase().includes(searchQuery) ||
    (movie.releaseYear && movie.releaseYear.includes(searchQuery))
  );

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-4xl font-heading font-extrabold tracking-tight mb-2 text-foreground">
          {searchQuery ? `Search: ${searchParams.get('search')}` : 'Community Feed'}
        </h2>
        <p className="text-muted-foreground text-base font-medium">
          {searchQuery ? `Found ${filteredMovies.length} results` : 'Discover cinematic title cards curated by Cinephile.'}
        </p>
      </div>

      {filteredMovies.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white rounded-xl border-2 border-foreground shadow-pop"
        >
          <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={2.5} />
          <p className="text-muted-foreground font-medium">
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
              className="bg-white rounded-xl p-5 border-2 border-foreground shadow-pop hover:shadow-pop-hover transition-all group"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-foreground font-bold text-sm overflow-hidden shadow-pop border-2 border-foreground">
                    {movie.authorName.toLowerCase().includes('diljith') || movie.authorName.toLowerCase().includes('cinephile') || movie.authorName.toLowerCase() === 'admin' ? (
                      <Clapperboard className="w-5 h-5 text-foreground" strokeWidth={2.5} />
                    ) : (
                      movie.authorName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">@{movie.authorName.toLowerCase().includes('diljith') || movie.authorName.toLowerCase().includes('cinephile') || movie.authorName.toLowerCase() === 'admin' ? 'cinephile' : movie.authorName.toLowerCase().replace(/\s+/g, '_')}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      {formatDistanceToNow(new Date(movie.createdAt)).toUpperCase()} AGO
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveMovieId(movie.id)}
                  className="p-2 bg-white rounded-full border-2 border-transparent hover:border-foreground hover:shadow-pop active:shadow-pop-active transition-all"
                >
                  <MessageSquare className="w-5 h-5 text-foreground" strokeWidth={2.5} />
                </button>
              </div>

              {/* Image */}
              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-muted mb-5 cursor-pointer border-2 border-foreground" onClick={() => navigate(`/movie/${movie.id}`)}>
                {movie.image ? (
                  <>
                    <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(movie.image!, `${movie.title}.jpg`);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white border-2 border-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-pop hover:shadow-pop-hover active:shadow-pop-active"
                    >
                      <Download className="w-5 h-5 text-foreground" strokeWidth={2.5} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">No Image</div>
                )}
              </div>

              {/* Details */}
              <div onClick={() => navigate(`/movie/${movie.id}`)} className="cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-heading font-extrabold uppercase tracking-wide text-foreground">{movie.title}</h3>
                  {movie.releaseYear && (
                    <span className="px-3 py-1 bg-white text-foreground text-xs font-bold rounded-full border-2 border-foreground shadow-pop">
                      {movie.releaseYear}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground leading-relaxed">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title card at</span>
                    <span className="bg-accent text-white px-3 py-1 rounded-full font-black text-base shadow-pop border-2 border-foreground">
                      {movie.titleCardTime}
                    </span>
                  </div>
                  {movie.totalDuration && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duration</span>
                      <span className="text-foreground font-bold bg-white px-2 py-0.5 rounded-full border-2 border-foreground">{movie.totalDuration}</span>
                    </div>
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
