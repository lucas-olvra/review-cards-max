import { NotFoundError, ValidationError } from '@/lib/mcp/service';

export function errorResponse(err: unknown) {
  if (err instanceof NotFoundError) return Response.json({ error: err.message }, { status: 404 });
  if (err instanceof ValidationError) return Response.json({ error: err.message }, { status: 400 });
  return Response.json({ error: err instanceof Error ? err.message : 'Erro desconhecido.' }, { status: 500 });
}
