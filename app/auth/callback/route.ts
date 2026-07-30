import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Retorno do OAuth (Google) e do link de confirmação de e-mail. O Supabase
// volta pra cá com `?code=`, que só vira sessão trocando pelo par guardado no
// cookie de PKCE — por isso a troca tem que acontecer no servidor, com o mesmo
// cookie store que iniciou o fluxo.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/sections';
  // Só destino interno: `next` vem da URL e não pode virar redirect aberto.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/sections';

  // Atrás do proxy da Vercel o `origin` do request é o host interno; o host
  // que o usuário realmente está usando vem no x-forwarded-host.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const baseUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

  // O provedor pode recusar antes mesmo de gerar código (usuário cancelou a
  // tela do Google, app não autorizado, etc.).
  const providerError = searchParams.get('error_description') ?? searchParams.get('error');
  if (providerError) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent('Login com o Google cancelado ou não autorizado.')}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${safeNext}`);
    }
  }

  return NextResponse.redirect(
    `${baseUrl}/login?error=${encodeURIComponent('Não foi possível concluir o login. Tente novamente.')}`
  );
}
