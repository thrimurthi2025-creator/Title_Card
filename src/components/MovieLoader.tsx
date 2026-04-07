import { Clapperboard } from 'lucide-react';
import { motion } from 'motion/react';

export function MovieLoader({ className }: { className?: string }) {
  return (
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className={className || "p-4"}
    >
      <Clapperboard className="w-full h-full text-accent" strokeWidth={2.5} />
    </motion.div>
  );
}
