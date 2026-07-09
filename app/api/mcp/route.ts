// Servidor MCP remoto: qualquer cliente MCP com suporte a transporte HTTP
// (Claude Code, mcp-remote, etc) pode se conectar aqui direto pela URL do
// deploy, autenticando com o mesmo token de app/(app)/settings/tokens.
// Alternativa sem instalação local ao mcp-server/ (stdio).
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { authenticateRequest, unauthorized } from '@/lib/api/auth';
import { createReviewCardsMcpServer } from '@/lib/mcp/server';

export const runtime = 'nodejs';

async function handle(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();

  const server = createReviewCardsMcpServer(auth.userId);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return transport.handleRequest(request);
}

export { handle as GET, handle as POST, handle as DELETE };
