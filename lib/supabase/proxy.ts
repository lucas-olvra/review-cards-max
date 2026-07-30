import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Rotas app/api/v1/** usam autenticação por token (Authorization: Bearer),
  // não sessão de cookie do Supabase — deixa passar direto para o handler,
  // que resolve o próprio 401 se o token faltar ou for inválido.
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next({ request });
  }

  // Um `code` do Supabase pode cair na home em vez de /auth/callback: quando o
  // `redirect_to` não está nas Redirect URLs do projeto, o Supabase descarta o
  // destino pedido e usa o Site URL — e os links de confirmação de e-mail usam
  // o Site URL por padrão. Sem isso a home simplesmente ignora o código e o
  // login parece ter falhado sem motivo. Só o pathname muda, então o `code`
  // segue junto na query.
  if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.has('code')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Não adicionar lógica entre createServerClient e getUser() — isso pode
  // quebrar a sincronização de sessão de forma difícil de depurar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /auth/callback é o retorno do OAuth e do link de confirmação de e-mail:
  // chega sem sessão por definição (a sessão só nasce quando o handler troca o
  // `code`), então não pode cair na regra de "sem usuário → /login".
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/');

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup');

  // A home é a única rota pública: é a página que apresenta o app pra quem
  // ainda não tem conta. Quem já está logado também pode abri-la (o CTA muda
  // para "Ir para meus estudos") — só não cai nela por padrão, porque o login
  // e o logo do header mandam direto pra /sections.
  const isPublicRoute = request.nextUrl.pathname === '/';

  if (!user && !isAuthRoute && !isPublicRoute && !isAuthCallback) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/sections';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
