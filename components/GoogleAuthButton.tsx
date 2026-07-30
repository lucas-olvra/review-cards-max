import { signInWithGoogle } from '@/lib/actions/auth';
import { SubmitButton } from '@/components/SubmitButton';

// Logo do Google inline: as folhas de ícone do app (Phosphor) não têm a marca,
// e um <img> externo aqui atrasaria a primeira tela de login.
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

// Um único botão serve pra entrar e pra criar conta: no OAuth do Google os dois
// são o mesmo fluxo — o Supabase cria a conta na primeira vez e só autentica
// nas seguintes. Por isso o rótulo muda, mas a ação é a mesma.
export function GoogleAuthButton({ label }: { label: string }) {
  return (
    <form action={signInWithGoogle}>
      <SubmitButton
        pendingText="Abrindo o Google…"
        className="rcp-btn-google"
        style={{ width: '100%' }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <GoogleMark />
          {label}
        </span>
      </SubmitButton>
    </form>
  );
}

export function AuthDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
      <span style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.1)' }} />
      <span style={{ font: '500 12.5px var(--font-body)', color: '#9A968E' }}>ou</span>
      <span style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.1)' }} />
    </div>
  );
}
