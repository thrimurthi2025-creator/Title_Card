import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { ArrowLeft, Star, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Comments } from '../components/Comments';
import { Rating } from '../components/Rating';
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

  if (loading) return <div className="flex justify-center py-12 text-white">Loading...</div>;
  if (!movie) return <div className="text-white text-center py-12">Movie not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-[#0B0914] text-white pb-24"
    >
      <button 
        onClick={() => navigate(-1)} 
        className="fixed top-6 left-6 z-50 p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="relative aspect-[16/9] w-full bg-black">
        {movie.image ? (
          <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">No Image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0914] via-transparent to-transparent" />
      </div>

      <div className="px-6 -mt-16 relative z-10">
        <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
        <div className="flex gap-4 text-white/60 text-sm mb-6">
          {movie.releaseYear && <span>{movie.releaseYear}</span>}
          {movie.totalDuration && <span>{movie.totalDuration}</span>}
        </div>

        <div className="bg-[#1A1525] p-6 rounded-[2rem] border border-white/5 mb-6">
          <h2 className="text-xl font-bold mb-4">Rating</h2>
          <Rating movieId={movie.id} user={user} onRestrictedAction={() => setIsLoginModalOpen(true)} />
        </div>

        <div className="bg-[#1A1525] p-6 rounded-[2rem] border border-white/5">
          <Comments movieId={movie.id} user={user} onRestrictedAction={() => setIsLoginModalOpen(true)} />
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </motion.div>
  );
}
