import { signIn } from '@/lib/actions/auth';
import { accent, buttonPrimaryClass, inputClass } from '@/lib/ui';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="rcp-auth-grid">
      <AuthBrandPanel />

      <div style={{ display: 'grid', placeItems: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <p
            style={{
              font: `600 13px var(--font-body)`,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: accent,
              margin: '0 0 8px',
            }}
          >
            Bem-vindo de volta
          </p>
          <h1
            className="rcp-font-display"
            style={{ fontWeight: 700, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 6px' }}
          >
            Entrar
          </h1>
          <p style={{ fontSize: 15, color: '#6B6862', margin: '0 0 26px' }}>
            Acesse seus tópicos de estudo.
          </p>

          {params.message && (
            <p
              style={{
                marginBottom: 16,
                borderRadius: 12,
                background: '#E1FAEF',
                color: '#0E7A4E',
                padding: 12,
                fontSize: 14,
              }}
            >
              {params.message}
            </p>
          )}
          {params.error && (
            <p
              style={{
                marginBottom: 16,
                borderRadius: 12,
                background: '#FDECEA',
                color: '#B42318',
                padding: 12,
                fontSize: 14,
              }}
            >
              {params.error}
            </p>
          )}

          <form action={signIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', font: '500 13px var(--font-body)', color: '#55524B', marginBottom: 6 }}>
                E-mail
              </span>
              <input name="email" type="email" required placeholder="voce@email.com" className={inputClass} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', font: '500 13px var(--font-body)', color: '#55524B', marginBottom: 6 }}>
                Senha
              </span>
              <input name="password" type="password" required placeholder="••••••••" className={inputClass} />
            </label>
            <button type="submit" className={buttonPrimaryClass} style={{ marginTop: 4 }}>
              Entrar
            </button>
          </form>

          <p style={{ fontSize: 14, color: '#6B6862', margin: '22px 0 0' }}>
            Não tem conta? <a href="/signup" style={{ fontWeight: 600 }}>Criar conta</a>
          </p>
        </div>
      </div>
    </div>
  );
}
