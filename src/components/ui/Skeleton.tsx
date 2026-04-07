import { motion } from 'motion/react';

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
      className={`bg-muted rounded-lg ${className}`}
    />
  );
}
