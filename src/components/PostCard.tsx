import { useState } from 'react';
import { doc, updateDoc, increment, deleteDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Heart, Trash2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';

export function PostCard({ post, user }: { post: any, user: User | null }) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    await updateDoc(postRef, { likesCount: increment(isLiked ? -1 : 1) });
    setIsLiked(!isLiked);
  };

  const handleDelete = async () => {
    if (!user || user.uid !== post.userId) return;
    await deleteDoc(doc(db, 'posts', post.id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1A1525] p-6 rounded-[2rem] border border-white/5 shadow-xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={post.userPhoto} alt={post.userName} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-bold">{post.userName}</p>
            <p className="text-xs text-white/50">{formatDistanceToNow(new Date(post.createdAt.toDate()))} ago</p>
          </div>
        </div>
        {user?.uid === post.userId && (
          <button onClick={handleDelete} className="text-red-500 hover:text-red-400">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
      <p className="text-white/80">{post.caption}</p>
      {post.image && (
        <div className="rounded-2xl overflow-hidden">
          <img src={post.image} alt="Post media" className="w-full" />
        </div>
      )}
      <div className="flex items-center gap-4 pt-2">
        <button onClick={handleLike} className={`flex items-center gap-2 ${isLiked ? 'text-pink-500' : 'text-white/50'}`}>
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-pink-500' : ''}`} />
          {post.likesCount || 0}
        </button>
        <button className="text-white/50">
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
}
