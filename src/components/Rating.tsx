import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

export function Rating({ movieId, user, onRestrictedAction }: { movieId: string, user: User | null, onRestrictedAction: () => void }) {
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

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
      setTotalRatings(snapshot.size);
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition-colors duration-200 ${
                star <= (hoverRating || rating) 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-white/20'
              }`}
            />
          </motion.button>
        ))}
      </div>
      <p className="text-sm text-white/60 font-medium">
        ⭐ {averageRating.toFixed(1)} • {totalRatings > 0 ? `${totalRatings} ratings` : 'No ratings yet'}
      </p>
    </div>
  );
}
