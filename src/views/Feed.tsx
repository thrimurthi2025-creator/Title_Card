import React, { useEffect, useState, useCallback } from 'react';
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
import { ErrorState } from '../components/ui/ErrorState';
import { MovieCard } from '../components/MovieCard';

export interface MovieEntry {
  id: string;
  title: string;
  titleCardTime: string;
  totalDuration?: string;
  image?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  releaseYear?: string;
  description?: string;
  whySpecial?: string;
}

export const Feed = React.memo(function Feed({ user, setActiveMovieId, onSelectMovie }: { user: User | null, setActiveMovieId: (id: string | null) => void, onSelectMovie: (movie: MovieEntry) => void }) {
  const [movies, setMovies] = useState<MovieEntry[]>(() => {
    const cached = localStorage.getItem('feedMovies');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(() => {
    const cached = localStorage.getItem('feedMovies');
    return cached ? false : true;
  });
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const navigate = useNavigate();

  const downloadImage = useCallback(async (url: string, filename: string) => {
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
  }, []);

  const fetchMovies = () => {
    if (!localStorage.getItem('feedMovies')) {
      setLoading(true);
    }
    setError(null);
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const movieData: MovieEntry[] = [];
      snapshot.forEach((doc) => {
        movieData.push({ id: doc.id, ...doc.data() } as MovieEntry);
      });
      setMovies(movieData);
      localStorage.setItem('feedMovies', JSON.stringify(movieData));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching movies:", error);
      setError("Failed to load movies. Please try again.");
      setLoading(false);
    });
  };

  useEffect(() => {
    const unsubscribe = fetchMovies();
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <FeedSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={fetchMovies} />;
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredMovies.map((movie) => (
            <MovieCard 
              key={movie.id}
              movie={movie}
              onSelectMovie={onSelectMovie}
              setActiveMovieId={setActiveMovieId}
              navigate={navigate}
              downloadImage={downloadImage}
            />
          ))}
        </div>
      )}
    </div>
  );
});
