import { headers } from 'next/headers';
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
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const protocol = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const mcpUrl = `${protocol}://${host}/api/mcp`;

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

        <p
          style={{
            fontSize: 13,
            color: '#92620C',
            background: '#FDF3E3',
            border: '1.5px solid #F5D9A8',
            borderRadius: 10,
            padding: '10px 12px',
            margin: '0 0 18px',
            lineHeight: 1.5,
          }}
        >
          <i className="ph-bold ph-info" style={{ marginRight: 4 }} /> Isso <strong>não</strong> é
          algo que você cola numa mensagem de chat — é uma conexão que você configura nas
          preferências do seu cliente de IA (Claude Code, Claude Desktop, etc), igual a um
          &quot;Connector&quot;. O token identifica sua conta; ele não funciona sozinho sem essa
          configuração.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          {[
            { n: '1', title: 'Gere um token aqui embaixo', text: 'Dê um nome pra ele (ex: "Claude Code") e copie o valor — ele só aparece uma vez.' },
            { n: '2', title: 'Adicione o Review Cards como servidor MCP no seu cliente', text: 'Cole a URL do servidor + o token nas configurações do cliente — comandos prontos logo abaixo.' },
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

        <h3 style={{ font: '600 13.5px var(--font-body)', margin: '0 0 10px' }}>Como conectar</h3>

        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 13.5, fontWeight: 600, margin: '0 0 6px' }}>Claude Code (recomendado — 1 comando)</p>
          <code
            className="rcp-font-code"
            style={{
              display: 'block',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              background: '#161616',
              color: '#7FE3B4',
              borderRadius: 10,
              padding: 12,
              fontSize: 12.5,
            }}
          >
            {`claude mcp add --transport http review-cards ${mcpUrl} --header "Authorization: Bearer SEU_TOKEN"`}
          </code>
        </div>

        <details style={{ marginBottom: 8 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: accent }}>
            Claude Desktop
          </summary>
          <p style={{ fontSize: 13, color: '#6B6862', margin: '10px 0 8px', lineHeight: 1.55 }}>
            O Claude Desktop ainda não conecta em servidores HTTP remotos com token direto no
            arquivo de config — o caminho que funciona hoje é a ponte{' '}
            <code className="rcp-font-code" style={{ fontSize: 12 }}>mcp-remote</code>. Adicione
            isto ao <code className="rcp-font-code" style={{ fontSize: 12 }}>claude_desktop_config.json</code>:
          </p>
          <code
            className="rcp-font-code"
            style={{
              display: 'block',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              background: '#161616',
              color: '#7FE3B4',
              borderRadius: 10,
              padding: 12,
              fontSize: 12.5,
            }}
          >
            {`{
  "mcpServers": {
    "review-cards": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote", "${mcpUrl}",
        "--transport", "http-only",
        "--header", "Authorization: Bearer SEU_TOKEN"
      ]
    }
  }
}`}
          </code>
          <p style={{ fontSize: 12.5, color: '#9A968E', margin: '8px 0 0' }}>
            Exige Node.js instalado (o <code className="rcp-font-code" style={{ fontSize: 11.5 }}>npx</code> baixa o mcp-remote na hora). Reinicie o Claude Desktop depois de salvar.
          </p>
        </details>

        <details>
          <summary style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: accent }}>
            Rodar localmente, sem depender do servidor remoto (avançado)
          </summary>
          <p style={{ fontSize: 13, color: '#6B6862', margin: '10px 0 0', lineHeight: 1.55 }}>
            Também existe uma versão do servidor MCP que roda no seu computador via stdio, em vez
            de se conectar remotamente — instruções completas em{' '}
            <code className="rcp-font-code" style={{ fontSize: 12 }}>mcp-server/README.md</code> no
            repositório do projeto.
          </p>
        </details>

        <details style={{ marginTop: 8 }}>
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

      <TokensManager tokens={tokens} mcpUrl={mcpUrl} />
    </div>
  );
}
