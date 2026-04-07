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
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '10%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-[10%] bg-white border-t-2 border-x-2 border-foreground rounded-t-[2rem] shadow-pop z-50 flex flex-col overflow-hidden"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
          >
            <div className="flex items-center justify-between p-6 border-b-2 border-foreground bg-white">
              <h2 className="text-2xl font-heading font-extrabold tracking-tight text-foreground">Comments ({commentCount})</h2>
              <button onClick={onClose} className="p-2 bg-white border-2 border-foreground rounded-full shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all">
                <X className="w-5 h-5 text-foreground" strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="bg-white p-5 rounded-xl border-2 border-foreground shadow-pop">
                <Rating movieId={movieId} user={user} onRestrictedAction={onRestrictedAction} />
              </div>
              
              <div className="h-0.5 bg-foreground" />
              
              <Comments movieId={movieId} user={user} onRestrictedAction={onRestrictedAction} onCountChange={setCommentCount} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
