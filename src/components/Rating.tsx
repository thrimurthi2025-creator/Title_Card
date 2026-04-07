import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Star } from 'lucide-react';

export function Rating({ movieId, user, onRestrictedAction }: { movieId: string, user: User | null, onRestrictedAction: () => void }) {
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (user) {
      const ratingRef = doc(db, 'ratings', `${user.uid}_${movieId}`);
      getDoc(ratingRef).then((docSnap) => {
        if (docSnap.exists()) {
          setRating(docSnap.data().rating);
        }
      });
    }
    
    const q = query(collection(db, 'ratings'), where('movieId', '==', movieId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.forEach((doc) => total += doc.data().rating);
      setAverageRating(snapshot.size > 0 ? total / snapshot.size : 0);
    });
    return () => unsubscribe();
  }, [movieId, user]);

  const handleRate = async (newRating: number) => {
    if (!user) {
      onRestrictedAction();
      return;
    }
    await setDoc(doc(db, 'ratings', `${user.uid}_${movieId}`), {
      userId: user.uid,
      movieId,
      rating: newRating,
      createdAt: new Date().toISOString()
    });
    setRating(newRating);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
            onClick={() => handleRate(star)}
          />
        ))}
      </div>
      <p className="font-bold text-lg">{averageRating.toFixed(1)} ⭐</p>
    </div>
  );
}
