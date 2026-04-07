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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#1A1525] border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-sm"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Login</h2>
            <p className="text-white/60 mb-8">Login to interact with the community</p>
            <button
              onClick={async () => {
                await signInWithGoogle();
                onClose();
              }}
              className="w-full bg-white text-[#0B0914] py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
            >
              <Mail className="w-5 h-5" />
              Sign in with Google
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
