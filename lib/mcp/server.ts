// Registra as mesmas 7 tools do mcp-server local (stdio), mas ligadas
// diretamente ao service compartilhado — sem round-trip HTTP, já que este
// servidor roda dentro do próprio processo Next.js. Uma instância nova é
// criada por requisição (ver app/api/mcp/route.ts, modo stateless).
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  addCard,
  addDiscursive,
  createTopic,
  deleteTopic,
  getTopic,
  listTopics,
  updateTopic,
} from '@/lib/mcp/service';

type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

async function safeCall(fn: () => Promise<string>): Promise<ToolResult> {
  try {
    return { content: [{ type: 'text', text: await fn() }] };
  } catch (err) {
    return {
      content: [{ type: 'text', text: err instanceof Error ? err.message : 'Erro desconhecido.' }],
      isError: true,
    };
  }
}

const cardShape = {
  question: z.string().describe('Enunciado da pergunta de múltipla escolha'),
  options: z.array(z.string()).length(4).optional().describe('Exatamente 4 alternativas (A, B, C, D nessa ordem)'),
  correct: z.number().int().min(0).max(3).optional().describe('Índice (0-3) da alternativa correta'),
  explanation: z.string().optional().describe('Explicação mostrada após responder'),
  analogy: z.string().optional().describe('Analogia opcional para fixar o conceito'),
};

const discursiveShape = {
  question: z.string().describe('Pergunta discursiva/aberta'),
  model_answer: z.string().optional().describe('O que uma boa resposta deveria cobrir'),
};

const topicFieldsShape = {
  concept_what: z.string().optional().describe('O que é o conceito'),
  concept_why: z.string().optional().describe('Por que esse conceito existe'),
  code: z.string().optional().describe('Exemplo de código (use `````` para blocos destacados)'),
  use_cases: z.string().optional().describe('Onde usar — casos reais (use "- item" para listas)'),
  anti_patterns: z.string().optional().describe('Onde não usar — limitações e trade-offs'),
  common_mistakes: z.string().optional().describe('Erros comuns ao aplicar o conceito'),
  exercise_prompt: z.string().optional().describe('Enunciado de um exercício de prática'),
  exercise_solution: z.string().optional().describe('Gabarito/solução do exercício'),
  pitch: z.string().optional().describe('Resumo de 30 segundos para explicar em voz alta'),
};

export function createReviewCardsMcpServer(userId: string) {
  const server = new McpServer({ name: 'review-cards-mcp', version: '1.0.0' });

  server.registerTool(
    'create_topic',
    {
      title: 'Criar tópico de estudo completo',
      description:
        'Cria um tópico de estudo inteiro de uma vez — conceito, código, onde usar, onde não ' +
        'usar, erros comuns, exercício de prática, cartões de múltipla escolha e perguntas ' +
        'discursivas — em vez de preencher cada campo manualmente pela interface.',
      inputSchema: {
        name: z.string().describe('Nome do tópico, ex: "Closures em JavaScript"'),
        ...topicFieldsShape,
        cards: z.array(z.object(cardShape)).optional().describe('Cartões de múltipla escolha'),
        discursive: z.array(z.object(discursiveShape)).optional().describe('Perguntas discursivas'),
      },
    },
    async (input) =>
      safeCall(async () => {
        const { id } = await createTopic(userId, input);
        return `Tópico criado com sucesso. id=${id}`;
      })
  );

  server.registerTool(
    'list_topics',
    {
      title: 'Listar tópicos',
      description: 'Lista os tópicos de estudo já existentes na conta (id e nome).',
      inputSchema: {},
    },
    async () =>
      safeCall(async () => {
        const topics = await listTopics(userId);
        return JSON.stringify(topics, null, 2);
      })
  );

  server.registerTool(
    'get_topic',
    {
      title: 'Ver detalhes de um tópico',
      description: 'Retorna todos os campos de um tópico, incluindo cartões e perguntas discursivas.',
      inputSchema: { topic_id: z.string().describe('ID do tópico') },
    },
    async ({ topic_id }) =>
      safeCall(async () => {
        const topic = await getTopic(userId, topic_id);
        return JSON.stringify(topic, null, 2);
      })
  );

  server.registerTool(
    'update_topic',
    {
      title: 'Atualizar campos de um tópico',
      description: 'Atualiza um ou mais campos do ciclo de aprendizado de um tópico existente.',
      inputSchema: {
        topic_id: z.string().describe('ID do tópico'),
        name: z.string().optional(),
        ...topicFieldsShape,
      },
    },
    async ({ topic_id, ...fields }) =>
      safeCall(async () => {
        await updateTopic(userId, topic_id, fields);
        return 'Tópico atualizado.';
      })
  );

  server.registerTool(
    'add_card',
    {
      title: 'Adicionar cartão a um tópico',
      description: 'Adiciona um cartão de múltipla escolha a um tópico já existente.',
      inputSchema: { topic_id: z.string().describe('ID do tópico'), ...cardShape },
    },
    async ({ topic_id, ...card }) =>
      safeCall(async () => {
        const { id } = await addCard(userId, topic_id, card);
        return `Cartão criado. id=${id}`;
      })
  );

  server.registerTool(
    'add_discursive_question',
    {
      title: 'Adicionar pergunta discursiva a um tópico',
      description: 'Adiciona uma pergunta discursiva/aberta a um tópico já existente.',
      inputSchema: { topic_id: z.string().describe('ID do tópico'), ...discursiveShape },
    },
    async ({ topic_id, ...item }) =>
      safeCall(async () => {
        const { id } = await addDiscursive(userId, topic_id, item);
        return `Pergunta discursiva criada. id=${id}`;
      })
  );

  server.registerTool(
    'delete_topic',
    {
      title: 'Excluir um tópico',
      description: 'Exclui permanentemente um tópico e todo o seu conteúdo (cartões e discursivas).',
      inputSchema: { topic_id: z.string().describe('ID do tópico') },
    },
    async ({ topic_id }) =>
      safeCall(async () => {
        await deleteTopic(userId, topic_id);
        return 'Tópico excluído.';
      })
  );

  return server;
}
