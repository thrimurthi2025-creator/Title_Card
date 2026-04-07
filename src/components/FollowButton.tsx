import { useState, useEffect } from 'react';
import { collection, query, where, addDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';

export function FollowButton({ followerId, followingId }: { followerId: string, followingId: string }) {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'follows'), where('followerId', '==', followerId), where('followingId', '==', followingId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsFollowing(!snapshot.empty);
    });
    return () => unsubscribe();
  }, [followerId, followingId]);

  const toggleFollow = async () => {
    if (isFollowing) {
      const q = query(collection(db, 'follows'), where('followerId', '==', followerId), where('followingId', '==', followingId));
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => deleteDoc(doc.ref));
    } else {
      await addDoc(collection(db, 'follows'), {
        followerId,
        followingId,
        createdAt: new Date()
      });
    }
  };

  return (
    <button 
      onClick={toggleFollow}
      className={`px-6 py-2 rounded-full font-bold ${isFollowing ? 'bg-white/10 text-white' : 'bg-pink-500 text-white'}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
