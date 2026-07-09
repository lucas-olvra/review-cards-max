import { authenticateRequest, unauthorized } from '@/lib/api/auth';
import { errorResponse } from '@/lib/api/errors';
import { addDiscursive, type DiscursiveInput } from '@/lib/mcp/service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await params;

  let body: DiscursiveInput;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Corpo da requisição precisa ser JSON válido.' }, { status: 400 });
  }

  try {
    const { id: questionId } = await addDiscursive(auth.userId, id, body);
    return Response.json({ id: questionId }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
