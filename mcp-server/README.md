# Review Cards MCP Server

Servidor MCP local que expõe o ciclo de aprendizado do [Review Cards Pro](../README.md)
como *tools* para um cliente de IA (Claude Desktop, Claude Code, etc). Permite pedir para a
IA criar um tópico de estudo inteiro — conceito, código, onde usar, onde não usar, erros
comuns, exercício, cartões e perguntas discursivas — numa única chamada, em vez de preencher
cada campo manualmente pela interface.

> **Não quer instalar nada localmente?** A própria aplicação expõe um servidor MCP remoto em
> `/api/mcp` (transporte HTTP, sem precisar clonar/buildar este pacote) — veja a seção "Como
> conectar" na página **Tokens & MCP** da aplicação (`/settings/tokens`) para o comando pronto
> do Claude Code e a config do Claude Desktop via `mcp-remote`. O guia abaixo é para quem
> prefere rodar o servidor localmente via stdio.

## 1. Gerar um token de acesso

Na aplicação, logado na sua conta: **Tokens** (menu superior) → **+ Novo Token** → copie o
valor mostrado (só aparece uma vez).

## 2. Instalar e buildar

```bash
cd mcp-server
npm install
npm run build
```

Isso gera `dist/index.js`.

## 3. Configurar no cliente de IA

No arquivo de configuração de MCP do seu cliente (ex: `claude_desktop_config.json` do Claude
Desktop, ou o equivalente no Claude Code), adicione:

```json
{
  "mcpServers": {
    "review-cards": {
      "command": "node",
      "args": ["/caminho/completo/para/mcp-server/dist/index.js"],
      "env": {
        "REVIEW_CARDS_API_URL": "https://sua-app.vercel.app",
        "REVIEW_CARDS_API_TOKEN": "rcp_..."
      }
    }
  }
}
```

- `REVIEW_CARDS_API_URL`: a URL da sua aplicação implantada (ou `http://localhost:3000`
  durante desenvolvimento local).
- `REVIEW_CARDS_API_TOKEN`: o token gerado no passo 1.
- `OBSIDIAN_VAULT_PATH` (opcional): caminho absoluto pra pasta do seu vault do Obsidian.
  Só necessário se você quiser usar a tool `export_topic_to_obsidian` — sem essa variável,
  as outras tools funcionam normalmente.

Reinicie o cliente de IA depois de salvar a configuração.

## Tools disponíveis

| Tool | O que faz |
| --- | --- |
| `list_sections` | Lista as seções existentes |
| `create_section` | Cria uma seção (contêiner de tópicos por assunto) |
| `create_topic` | Cria um tópico completo (todos os campos + cartões + discursivas) numa chamada |
| `list_topics` | Lista os tópicos existentes |
| `get_topic` | Detalhes completos de um tópico |
| `update_topic` | Atualiza campos de um tópico existente |
| `set_topic_analogy` | Gera/substitui a analogia visual (diagrama) de um tópico |
| `add_card` | Adiciona um cartão de múltipla escolha a um tópico |
| `add_discursive_question` | Adiciona uma pergunta discursiva a um tópico |
| `export_topic_to_obsidian` | Exporta o tópico como nota Markdown pro seu vault do Obsidian, linkada a outros tópicos parecidos (requer `OBSIDIAN_VAULT_PATH`) |
| `delete_topic` | Exclui um tópico |

## Exemplo de fluxo completo

Um prompt bem escrito pode acionar o ciclo inteiro numa mensagem só — da criação
da seção até os "gatilhos" que ajudam a fixar e conectar o conteúdo:

```
Crie uma seção "Java" e um tópico "Polimorfismo em Java" com conceito, por que
existe, código, onde usar, onde não usar e erros comuns. Se já existir um
tópico sobre Herança, relacione os dois. Depois exporte para o meu vault do
Obsidian.
```

O que cada parte aciona:

1. **"Crie uma seção..."** → `create_section` (ou reaproveita uma existente,
   se você só passar `section_name` na criação do tópico).
2. **"...um tópico... com conceito, por que existe, código..."** → `create_topic`,
   preenchendo o ciclo de aprendizado completo numa chamada.
3. **"Se já existir um tópico sobre Herança, relacione os dois"** → a IA roda
   `list_topics` pra conferir, e guarda o nome pra usar no passo seguinte.
4. **"...exporte para o meu vault do Obsidian"** → `export_topic_to_obsidian`,
   com `related_topic_names: ["Herança em Java"]` — cria o link `[[Herança em
   Java]]` na nota, mesmo que essa outra nota ainda não tenha sido exportada.

## Revogando acesso

Se o token vazar ou você não precisar mais dessa integração, revogue em **Tokens** na
aplicação — o acesso é bloqueado imediatamente.
