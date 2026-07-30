'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { translateAuthError } from '@/lib/auth-errors';

// A URL pública do app não é fixa (localhost em dev, domínio + alias de branch
// na Vercel), e o OAuth do Google precisa dela para saber pra onde voltar.
// Deriva do request em vez de hardcodar: `x-forwarded-*` é o que o proxy da
// Vercel preenche, `host` é o que o dev server local entrega.
async function siteOrigin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(translateAuthError(error.message))}`);
  }
  redirect('/sections');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/callback` },
  });
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(translateAuthError(error.message))}`);
  }

  // Com "Confirm email" ligado, o Supabase NÃO devolve erro para um e-mail que
  // já tem conta — devolve sucesso com um usuário fabricado e `identities`
  // vazio, de propósito, pra não revelar quem está cadastrado. Sem checar isso,
  // o cadastro duplicado parecia ter dado certo ("Conta criada!") e só falhava
  // depois, no login. `identities` vazio é o único sinal confiável aqui.
  const identities = data.user?.identities ?? [];
  if (!data.user || identities.length === 0) {
    redirect(
      `/signup?error=${encodeURIComponent(
        'Já existe uma conta com esse e-mail. Faça login — ou entre com o Google, se foi assim que você criou a conta.'
      )}`
    );
  }

  // Sessão já criada = confirmação de e-mail desligada no projeto: não faz
  // sentido mandar pro login pedindo pra entrar de novo.
  if (data.session) {
    redirect('/sections');
  }

  redirect(
    `/login?message=${encodeURIComponent(
      'Conta criada! Confirme pelo link que enviamos no seu e-mail para poder entrar.'
    )}`
  );
}

// O fluxo do Google é OAuth: o Supabase devolve a URL de consentimento e o
// retorno cai em /auth/callback, que troca o `code` pela sessão. Serve tanto
// pra criar conta quanto pra entrar — quem já tem conta Google só entra.
export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${await siteOrigin()}/auth/callback?next=/sections` },
  });

  if (error || !data?.url) {
    redirect(
      `/login?error=${encodeURIComponent(
        error ? translateAuthError(error.message) : 'Não foi possível iniciar o login com o Google.'
      )}`
    );
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Volta pra home, não pro login: quem saiu não necessariamente quer entrar
  // de novo agora, e a home é a página que apresenta o app. O botão "Entrar"
  // fica lá no topo pra quem só trocou de conta.
  redirect('/');
}
