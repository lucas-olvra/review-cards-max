import { authenticateRequest, unauthorized } from '@/lib/api/auth';
import { errorResponse } from '@/lib/api/errors';
import { listContrasts, setTopicContrast, type ContrastInput } from '@/lib/mcp/service';

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();

  const contrasts = await listContrasts(auth.userId);
  return Response.json({ contrasts });
}

// PUT (e não POST) porque a operação é idempotente por par de tópicos: o par
// tem índice único e a gravação é um upsert, então repetir a chamada com o
// mesmo topic_a/topic_b substitui em vez de duplicar.
export async function PUT(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();

  let body: ContrastInput;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Corpo da requisição precisa ser JSON válido.' }, { status: 400 });
  }

  try {
    const result = await setTopicContrast(auth.userId, body);
    return Response.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
