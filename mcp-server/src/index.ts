#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { api } from './api.js';

const server = new McpServer({
  name: 'review-cards-mcp',
  version: '1.0.0',
});

const cardShape = {
  question: z.string().describe('Enunciado da pergunta de múltipla escolha'),
  options: z
    .array(z.string())
    .length(4)
    .optional()
    .describe('Exatamente 4 alternativas (A, B, C, D nessa ordem)'),
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
  async (input) => {
    const { id } = await api.createTopic(input);
    return {
      content: [{ type: 'text', text: `Tópico criado com sucesso. id=${id}` }],
    };
  }
);

server.registerTool(
  'list_topics',
  {
    title: 'Listar tópicos',
    description: 'Lista os tópicos de estudo já existentes na conta (id e nome).',
    inputSchema: {},
  },
  async () => {
    const { topics } = await api.listTopics();
    return { content: [{ type: 'text', text: JSON.stringify(topics, null, 2) }] };
  }
);

server.registerTool(
  'get_topic',
  {
    title: 'Ver detalhes de um tópico',
    description: 'Retorna todos os campos de um tópico, incluindo cartões e perguntas discursivas.',
    inputSchema: { topic_id: z.string().describe('ID do tópico') },
  },
  async ({ topic_id }) => {
    const topic = await api.getTopic(topic_id);
    return { content: [{ type: 'text', text: JSON.stringify(topic, null, 2) }] };
  }
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
  async ({ topic_id, ...fields }) => {
    await api.updateTopic(topic_id, fields);
    return { content: [{ type: 'text', text: 'Tópico atualizado.' }] };
  }
);

server.registerTool(
  'add_card',
  {
    title: 'Adicionar cartão a um tópico',
    description: 'Adiciona um cartão de múltipla escolha a um tópico já existente.',
    inputSchema: { topic_id: z.string().describe('ID do tópico'), ...cardShape },
  },
  async ({ topic_id, ...card }) => {
    const { id } = await api.addCard(topic_id, card);
    return { content: [{ type: 'text', text: `Cartão criado. id=${id}` }] };
  }
);

server.registerTool(
  'add_discursive_question',
  {
    title: 'Adicionar pergunta discursiva a um tópico',
    description: 'Adiciona uma pergunta discursiva/aberta a um tópico já existente.',
    inputSchema: { topic_id: z.string().describe('ID do tópico'), ...discursiveShape },
  },
  async ({ topic_id, ...item }) => {
    const { id } = await api.addDiscursive(topic_id, item);
    return { content: [{ type: 'text', text: `Pergunta discursiva criada. id=${id}` }] };
  }
);

server.registerTool(
  'delete_topic',
  {
    title: 'Excluir um tópico',
    description: 'Exclui permanentemente um tópico e todo o seu conteúdo (cartões e discursivas).',
    inputSchema: { topic_id: z.string().describe('ID do tópico') },
  },
  async ({ topic_id }) => {
    await api.deleteTopic(topic_id);
    return { content: [{ type: 'text', text: 'Tópico excluído.' }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
