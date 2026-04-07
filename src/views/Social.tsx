import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { User } from 'firebase/auth';
import { CreatePost } from '../components/CreatePost';
import { PostCard } from '../components/PostCard';

export function Social({ user }: { user: User | null }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Get following list
    const followsQ = query(collection(db, 'follows'), where('followerId', '==', user.uid));
    const unsubscribeFollows = onSnapshot(followsQ, (snapshot) => {
      const followingIds = snapshot.docs.map(doc => doc.data().followingId);
      
      // 2. Fetch posts from these users
      if (followingIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }
      
      // Firestore 'in' query limit is 30
      const postsQ = query(collection(db, 'posts'), where('userId', 'in', followingIds), orderBy('createdAt', 'desc'));
      const unsubscribePosts = onSnapshot(postsQ, (snapshot) => {
        const postData: any[] = [];
        snapshot.forEach((doc) => {
          postData.push({ id: doc.id, ...doc.data() });
        });
        setPosts(postData);
        setLoading(false);
      });
      
      return () => unsubscribePosts();
    });
    
    return () => unsubscribeFollows();
  }, [user]);

  return (
    <div className="p-4 space-y-8">
      {user && <CreatePost user={user} />}
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1">Social Feed</h2>
        <p className="text-white/50 text-sm">Connect with other cinema lovers.</p>
      </div>

      <div className="space-y-6">
        {posts.map(post => <PostCard key={post.id} post={post} user={user} />)}
      </div>
    </div>
  );
}
