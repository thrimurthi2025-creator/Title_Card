import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { ArrowLeft, Star, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Comments } from '../components/Comments';
import { Rating } from '../components/Rating';
import { MovieDetailsSkeleton } from '../components/ui/MovieDetailsSkeleton';
import { LoginModal } from '../components/LoginModal';

interface Movie {
  id: string;
  title: string;
  image?: string;
  releaseYear?: string;
  totalDuration?: string;
  titleCardTime: string;
}

export function MovieDetails({ user }: { user: User | null }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;
    const fetchMovie = async () => {
      const docRef = doc(db, 'movies', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMovie({ id: docSnap.id, ...docSnap.data() } as Movie);
      }
      setLoading(false);
    };
    fetchMovie();
  }, [id]);

  if (loading) return <MovieDetailsSkeleton />;
  if (!movie) return <div className="text-foreground text-center py-12 font-bold">Movie not found</div>;

  return (
    <>
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-24 left-6 z-50 p-2 bg-white border-2 border-foreground rounded-full shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all"
      >
        <ArrowLeft className="w-6 h-6 text-foreground" strokeWidth={2.5} />
      </button>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="min-h-screen bg-transparent text-foreground pb-24"
      >
        <div className="relative aspect-[16/9] w-full bg-muted border-b-2 border-foreground">
          {movie.image ? (
            <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">No Image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="px-6 -mt-16 relative z-10">
          <h1 className="text-3xl font-heading font-extrabold mb-3 text-foreground leading-tight">{movie.title}</h1>
          <div className="flex gap-3 text-muted-foreground text-xs mb-6 font-bold">
            {movie.releaseYear && <span className="bg-white px-3 py-1 rounded-full border-2 border-foreground">{movie.releaseYear}</span>}
            {movie.totalDuration && <span className="bg-white px-3 py-1 rounded-full border-2 border-foreground">{movie.totalDuration}</span>}
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-foreground shadow-pop mb-6">
            <h2 className="text-2xl font-heading font-bold mb-4 text-foreground">Rating</h2>
            <Rating movieId={movie.id} user={user} onRestrictedAction={() => setIsLoginModalOpen(true)} />
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-foreground shadow-pop">
            <Comments movieId={movie.id} user={user} onRestrictedAction={() => setIsLoginModalOpen(true)} />
          </div>
        </div>

        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </motion.div>
    </>
  );
}
