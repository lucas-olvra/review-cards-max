// Supabase Auth retorna mensagens de erro em inglês (`error.message`), sem
// campo de código estável em todas as versões — por isso o mapeamento é por
// texto. Mantemos um fallback genérico em pt-BR para mensagens não mapeadas.
const MESSAGE_MAP: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.',
  'User already registered': 'Já existe uma conta com esse e-mail.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'O formato do e-mail é inválido.',
  'Email rate limit exceeded': 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
  'User not found': 'Não encontramos uma conta com esse e-mail.',
  'Signups not allowed for this instance': 'Novos cadastros estão desativados no momento.',
};

export function translateAuthError(message: string): string {
  return MESSAGE_MAP[message] ?? 'Não foi possível concluir a operação. Verifique os dados e tente novamente.';
}
