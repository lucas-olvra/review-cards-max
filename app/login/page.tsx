import { signIn } from '@/lib/actions/auth';
import { accent, buttonPrimaryClass, inputClass } from '@/lib/ui';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';
import { PasswordInput } from '@/components/PasswordInput';
import { SubmitButton } from '@/components/SubmitButton';
import { AuthDivider, GoogleAuthButton } from '@/components/GoogleAuthButton';
import { safeInternalHref } from '@/lib/nav';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string; expired?: string }>;
}) {
  const params = await searchParams;
  // O destino é validado aqui e não só na action: ele vira o `value` de um
  // campo do formulário, e um `next` externo aqui já seria um link de saída.
  const next = safeInternalHref(params.next, '/sections');
  const hasNext = next !== '/sections';
  const expired = params.expired === '1';

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

          {/* Sessão que morreu não é erro do usuário — daí o tom âmbar, e não
              o vermelho de credencial inválida. */}
          {expired && (
            <p
              style={{
                marginBottom: 16,
                borderRadius: 12,
                background: '#FDF0DC',
                color: '#8A5B08',
                padding: 12,
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              <i className="ph-fill ph-clock-counter-clockwise" /> Sua sessão expirou. Entre de novo
              — você volta direto pra onde estava.
            </p>
          )}
          {!expired && hasNext && (
            <p
              style={{
                marginBottom: 16,
                borderRadius: 12,
                background: '#E9ECFF',
                color: '#2C4BE0',
                padding: 12,
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              <i className="ph-fill ph-sign-in" /> Entre para continuar — você volta direto pra onde
              estava.
            </p>
          )}
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

          <GoogleAuthButton label="Entrar com o Google" next={hasNext ? next : undefined} />
          <AuthDivider />

          <form action={signIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {hasNext && <input type="hidden" name="next" value={next} />}
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
              <PasswordInput name="password" placeholder="••••••••" />
            </label>
            <SubmitButton pendingText="Entrando…" className={buttonPrimaryClass} style={{ marginTop: 4 }}>
              Entrar
            </SubmitButton>
          </form>

          <p style={{ fontSize: 14, color: '#6B6862', margin: '22px 0 0' }}>
            Não tem conta? <a href="/signup" style={{ fontWeight: 600 }}>Criar conta</a>
          </p>
        </div>
      </div>
    </div>
  );
}
