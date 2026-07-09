import { authenticateRequest, unauthorized } from '@/lib/api/auth';
import { errorResponse } from '@/lib/api/errors';
import { addCard, type CardInput } from '@/lib/mcp/service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await params;

  let body: CardInput;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Corpo da requisição precisa ser JSON válido.' }, { status: 400 });
  }

  try {
    const { id: cardId } = await addCard(auth.userId, id, body);
    return Response.json({ id: cardId }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
