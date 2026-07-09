import { createClient } from '@supabase/supabase-js';

// Cliente com a service role key — bypassa RLS. Só usar dentro de Route
// Handlers de app/api/v1/** e na verificação de token, nunca em código
// que roda no browser. Toda query feita com este cliente precisa filtrar
// manualmente por user_id (ver lib/api/auth.ts).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
