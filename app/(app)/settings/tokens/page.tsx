import { getTokens } from '@/lib/actions/tokens';
import { TokensManager } from '@/components/TokensManager';

export default async function TokensPage() {
  const tokens = await getTokens();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Tokens de Acesso</h1>
      <p className="mb-6 text-slate-400">
        Use um token para autenticar o servidor MCP (ou qualquer outra integração) contra a sua
        conta, sem precisar de e-mail e senha.
      </p>
      <TokensManager tokens={tokens} />
    </div>
  );
}
