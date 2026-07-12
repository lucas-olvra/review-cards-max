'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { translateAuthError } from '@/lib/auth-errors';

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

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(translateAuthError(error.message))}`);
  }
  redirect(
    `/login?message=${encodeURIComponent(
      'Conta criada! Verifique seu e-mail para confirmar (ou faça login direto, se a confirmação estiver desativada no seu projeto Supabase).'
    )}`
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
