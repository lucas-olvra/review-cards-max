import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <Link href="/topics" className="text-lg font-bold">
          📚 Review Cards Pro
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/import"
            className="rounded-md px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Importar dados antigos
          </Link>
          <Link
            href="/topics/new"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + Novo Tópico
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              Sair
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
