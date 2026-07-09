import { signIn } from '@/lib/actions/auth';
import { buttonPrimaryClass, cardClass, inputClass } from '@/lib/ui';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className={`w-full max-w-sm ${cardClass}`}>
        <h1 className="mb-1 text-2xl font-bold text-white">📚 Review Cards Pro</h1>
        <p className="mb-6 text-sm text-slate-400">Entre para acessar seus tópicos de estudo.</p>

        {params.message && (
          <p className="mb-4 rounded-md bg-emerald-950 p-3 text-sm text-emerald-300">
            {params.message}
          </p>
        )}
        {params.error && (
          <p className="mb-4 rounded-md bg-red-950 p-3 text-sm text-red-300">{params.error}</p>
        )}

        <form action={signIn} className="space-y-4">
          <input name="email" type="email" required placeholder="E-mail" className={inputClass} />
          <input
            name="password"
            type="password"
            required
            placeholder="Senha"
            className={inputClass}
          />
          <button type="submit" className={`w-full ${buttonPrimaryClass}`}>
            Entrar
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-400">
          Não tem conta?{' '}
          <a href="/signup" className="text-indigo-400 hover:underline">
            Criar conta
          </a>
        </p>
      </div>
    </div>
  );
}
