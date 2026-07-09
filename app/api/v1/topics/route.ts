import { authenticateRequest, unauthorized } from '@/lib/api/auth';
import { errorResponse } from '@/lib/api/errors';
import { createTopic, listTopics, type CreateTopicInput } from '@/lib/mcp/service';

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();

  const topics = await listTopics(auth.userId);
  return Response.json({ topics });
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();

  let body: CreateTopicInput;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Corpo da requisição precisa ser JSON válido.' }, { status: 400 });
  }

  try {
    const { id } = await createTopic(auth.userId, body);
    return Response.json({ id }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
