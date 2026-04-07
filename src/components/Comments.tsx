import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Trash2, Send } from 'lucide-react';
import { MovieLoader } from './MovieLoader';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto: string;
  createdAt: any;
}

export function Comments({ movieId, user, onRestrictedAction, onCountChange }: { movieId: string, user: User | null, onRestrictedAction: () => void, onCountChange?: (count: number) => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const MAX_CHARS = 280;

  useEffect(() => {
    const q = query(collection(db, 'movies', movieId, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Comment[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Comment));
      setComments(data);
      if (onCountChange) onCountChange(data.length);
    });
    return () => unsubscribe();
  }, [movieId, onCountChange]);

  const handlePostComment = async () => {
    if (!user) {
      onRestrictedAction();
      return;
    }
    if (!newComment.trim() || newComment.length > MAX_CHARS || isPosting) return;

    setIsPosting(true);
    try {
      await addDoc(collection(db, 'movies', movieId, 'comments'), {
        text: newComment,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteDoc(doc(db, 'movies', movieId, 'comments', commentId));
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="relative">
        <div className="flex gap-3 items-center">
          {user?.photoURL && (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full border border-white/10" />
          )}
          <div className="flex-1 relative">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Share your thoughts..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-sm text-white outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
            />
            <button 
              onClick={handlePostComment} 
              disabled={isPosting || !newComment.trim()}
              className="absolute right-2 top-2 p-1.5 bg-[#00E5FF] text-black rounded-full hover:bg-white transition-colors disabled:opacity-50"
            >
              {isPosting ? <MovieLoader className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="text-right text-[10px] text-white/40 mt-1 pr-4">
          {newComment.length}/{MAX_CHARS}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {comments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-white/40"
            >
              <p className="text-lg">No comments yet 🎬</p>
              <p className="text-sm">Be the first to share your thoughts.</p>
            </motion.div>
          ) : (
            comments.map((comment) => (
              <motion.div 
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 bg-white/5 p-4 rounded-2xl border border-white/5"
              >
                <img src={comment.userPhoto} alt={comment.userName} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-sm">{comment.userName}</p>
                    <p className="text-[10px] text-white/40">{comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate()) + ' ago' : ''}</p>
                  </div>
                  <p className="text-sm text-white/80">{comment.text}</p>
                </div>
                {user?.uid === comment.userId && (
                  <button onClick={() => handleDeleteComment(comment.id)} className="text-red-400 hover:text-red-300 self-start">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
