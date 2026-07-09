import { authenticateRequest, unauthorized } from '@/lib/api/auth';
import { errorResponse } from '@/lib/api/errors';
import { deleteTopic, getTopic, updateTopic } from '@/lib/mcp/service';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await params;

  try {
    const topic = await getTopic(auth.userId, id);
    return Response.json(topic);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Corpo da requisição precisa ser JSON válido.' }, { status: 400 });
  }

  try {
    await updateTopic(auth.userId, id, body);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await params;

  try {
    await deleteTopic(auth.userId, id);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
