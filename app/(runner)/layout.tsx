import { PageTransition } from '@/components/PageTransition';

// Telas de execução (quiz, discursivas, pitch) ficam sem o header do app —
// portado do `showChrome` do design "Review Cards Pro", que esconde a barra
// superior nessas três telas para um modo de estudo sem distração.
export default function RunnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
