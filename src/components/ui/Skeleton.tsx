import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
      className={cn("bg-muted rounded-lg relative overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer" />
    </motion.div>
  );
}
