'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

// Transição de entrada só (sem exit via AnimatePresence): em App Router o RSC
// troca o conteúdo assim que o novo payload chega, o que costuma dessincronizar
// animações de saída. Uma entrada simples, disparada por trocar a `key` a cada
// pathname, já dá a sensação de fluidez sem essa fragilidade.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
