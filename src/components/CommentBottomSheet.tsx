import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { User } from 'firebase/auth';
import { Comments } from './Comments';
import { Rating } from './Rating';

interface CommentBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: string;
  user: User | null;
  onRestrictedAction: () => void;
}

export function CommentBottomSheet({ isOpen, onClose, movieId, user, onRestrictedAction }: CommentBottomSheetProps) {
  const [commentCount, setCommentCount] = useState(0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '10%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-[10%] bg-[#1A1525] rounded-t-[2rem] z-50 flex flex-col overflow-hidden"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1A1525]/80 backdrop-blur-md">
              <h2 className="text-xl font-bold tracking-tight">Comments ({commentCount})</h2>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="bg-white/5 p-5 rounded-3xl border border-white/5 shadow-inner">
                <Rating movieId={movieId} user={user} onRestrictedAction={onRestrictedAction} />
              </div>
              
              <div className="h-px bg-white/10" />
              
              <Comments movieId={movieId} user={user} onRestrictedAction={onRestrictedAction} onCountChange={setCommentCount} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
