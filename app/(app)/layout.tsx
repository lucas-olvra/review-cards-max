import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';
import { PageTransition } from '@/components/PageTransition';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 py-4 backdrop-blur-md">
        <Link href="/topics" className="text-lg font-bold transition-opacity hover:opacity-80">
          📚 Review Cards Pro
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/settings/tokens"
            className="rounded-md px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800"
          >
            Tokens
          </Link>
          <Link
            href="/import"
            className="rounded-md px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800"
          >
            Importar dados antigos
          </Link>
          <Link
            href="/topics/new"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm shadow-indigo-950/50 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-[0.98]"
          >
            + Novo Tópico
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800"
            >
              Sair
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
