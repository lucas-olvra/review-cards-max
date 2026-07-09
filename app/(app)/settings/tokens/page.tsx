import { getTokens } from '@/lib/actions/tokens';
import { TokensManager } from '@/components/TokensManager';
import { accent } from '@/lib/ui';

const MCP_TOOLS: { tool: string; does: string }[] = [
  { tool: 'create_topic', does: 'Cria um tópico completo (todos os campos + cartões + discursivas) numa única chamada' },
  { tool: 'list_topics', does: 'Lista os tópicos existentes' },
  { tool: 'get_topic', does: 'Mostra os detalhes completos de um tópico' },
  { tool: 'update_topic', does: 'Atualiza campos de um tópico existente' },
  { tool: 'add_card', does: 'Adiciona um cartão de múltipla escolha a um tópico' },
  { tool: 'add_discursive_question', does: 'Adiciona uma pergunta discursiva a um tópico' },
  { tool: 'delete_topic', does: 'Exclui um tópico' },
];

export default async function TokensPage() {
  const tokens = await getTokens();

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '30px 26px 80px' }}>
      <h1 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 34, letterSpacing: '-.025em', margin: '0 0 6px' }}>
        Tokens de acesso
      </h1>
      <p style={{ fontSize: 15, color: '#6B6862', margin: '0 0 24px' }}>
        Use um token para autenticar o servidor MCP (ou qualquer outra integração) contra a sua
        conta, sem precisar de e-mail e senha.
      </p>

      <div className="rcp-card" style={{ borderRadius: 22, padding: 26, marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              background: '#E9ECFF',
              flexShrink: 0,
            }}
          >
            <i className="ph-fill ph-robot" style={{ color: accent, fontSize: 18 }} />
          </div>
          <h2 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 18, margin: 0 }}>
            O que é o MCP e pra que serve
          </h2>
        </div>
        <p style={{ fontSize: 14.5, color: '#55524B', lineHeight: 1.65, margin: '0 0 18px' }}>
          MCP (Model Context Protocol) é o que deixa uma IA — Claude Desktop, Claude Code, etc —
          conversar diretamente com a sua conta do Review Cards Pro. Em vez de preencher cada
          campo manualmente pela interface, você pede pra IA e ela cria (ou edita) o tópico
          inteiro por você: conceito, código, onde usar, onde não usar, erros comuns, prática,
          cartões e perguntas discursivas.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          {[
            { n: '1', title: 'Gere um token aqui embaixo', text: 'Dê um nome pra ele (ex: "Claude Desktop") e copie o valor — ele só aparece uma vez.' },
            { n: '2', title: 'Configure o servidor MCP no seu cliente de IA', text: 'Aponte o cliente (Claude Desktop, Claude Code, etc) para o servidor do Review Cards com esse token — instruções completas em mcp-server/README.md.' },
            { n: '3', title: 'Peça pra IA criar seus tópicos', text: 'Ex: "crie um tópico sobre closures em JavaScript, com 5 cartões de revisão". Pronto — aparece direto na sua lista de tópicos.' },
          ].map((step) => (
            <div key={step.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: accent,
                  color: '#fff',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  font: '700 12px var(--font-body)',
                }}
              >
                {step.n}
              </span>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                <strong>{step.title}.</strong> <span style={{ color: '#6B6862' }}>{step.text}</span>
              </p>
            </div>
          ))}
        </div>

        <details>
          <summary style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: accent }}>
            Ver as ações que a IA pode fazer
          </summary>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MCP_TOOLS.map((t) => (
              <div key={t.tool} style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                <code className="rcp-font-code" style={{ background: '#F1F0EC', padding: '2px 6px', borderRadius: 6, fontSize: 12.5 }}>
                  {t.tool}
                </code>{' '}
                <span style={{ color: '#6B6862' }}>— {t.does}</span>
              </div>
            ))}
          </div>
        </details>
      </div>

      <TokensManager tokens={tokens} />
    </div>
  );
}
