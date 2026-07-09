import { createHash } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Autentica uma requisição HTTP de app/api/v1/** via header
 * `Authorization: Bearer <token>`. Retorna o userId dono do token, ou
 * null se ausente/inválido — o caller deve responder 401 nesse caso.
 */
export async function authenticateRequest(request: Request): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('api_tokens')
    .select('id, user_id')
    .eq('token_hash', hashToken(token))
    .single();

  if (error || !data) return null;

  // Best-effort, não bloqueia a resposta.
  void supabase
    .from('api_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
    .then(
      () => {},
      () => {}
    );

  return { userId: data.user_id };
}

export function unauthorized() {
  return Response.json({ error: 'Token ausente ou inválido' }, { status: 401 });
}
