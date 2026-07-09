'use client';

import { motion } from 'motion/react';

// Aceno de boas-vindas: um leve "wiggle" que roda uma vez ao montar.
export function AnimatedEmoji({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      className="inline-block"
      initial={{ rotate: 0 }}
      animate={{ rotate: [0, 20, -10, 20, 0] }}
      transition={{ duration: 1, delay: 0.2, ease: 'easeInOut' }}
    >
      {children}
    </motion.span>
  );
}
