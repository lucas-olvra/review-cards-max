import { getTokens } from '@/lib/actions/tokens';
import { TokensManager } from '@/components/TokensManager';

export default async function TokensPage() {
  const tokens = await getTokens();

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '30px 26px 80px' }}>
      <h1 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 34, letterSpacing: '-.025em', margin: '0 0 6px' }}>
        Tokens de acesso
      </h1>
      <p style={{ fontSize: 15, color: '#6B6862', margin: '0 0 30px' }}>
        Use um token para autenticar o servidor MCP (ou qualquer outra integração) contra a sua
        conta, sem precisar de e-mail e senha.
      </p>
      <TokensManager tokens={tokens} />
    </div>
  );
}
