import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
    if (!newComment.trim() || newComment.length > MAX_CHARS) return;

    await addDoc(collection(db, 'movies', movieId, 'comments'), {
      text: newComment,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userPhoto: user.photoURL || '',
      createdAt: serverTimestamp()
    });
    setNewComment('');
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteDoc(doc(db, 'movies', movieId, 'comments', commentId));
  };

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-bold">Comments</h3>
      <div className="relative">
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Write a comment..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full py-2 px-4 text-sm text-white outline-none focus:border-[#00E5FF]"
          />
          <button onClick={handlePostComment} className="p-2 bg-[#00E5FF] text-black rounded-full hover:bg-white transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-right text-[10px] text-white/40 mt-1 pr-12">
          {newComment.length}/{MAX_CHARS}
        </div>
      </div>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 bg-white/5 p-3 rounded-2xl">
            <img src={comment.userPhoto} alt={comment.userName} className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-bold text-sm">{comment.userName}</p>
                <p className="text-[10px] text-white/40">{comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate()) + ' ago' : ''}</p>
              </div>
              <p className="text-sm text-white/80">{comment.text}</p>
            </div>
            {user?.uid === comment.userId && (
              <button onClick={() => handleDeleteComment(comment.id)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
