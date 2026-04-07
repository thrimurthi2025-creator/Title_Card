import { motion, AnimatePresence } from 'motion/react';
import { X, Mail } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export function LoginModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white border-2 border-foreground p-8 rounded-xl shadow-pop w-full max-w-sm"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <h2 className="text-3xl font-heading font-extrabold text-foreground mb-2">Login</h2>
            <p className="text-muted-foreground font-medium mb-8">Login to interact with the community</p>
            <button
              onClick={async () => {
                await signInWithGoogle();
                onClose();
              }}
              className="w-full bg-accent text-white py-4 rounded-full font-bold flex items-center justify-center gap-3 border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all"
            >
              <Mail className="w-5 h-5" strokeWidth={2.5} />
              Sign in with Google
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
