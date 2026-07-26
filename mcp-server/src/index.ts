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

// Diagrama estruturado (não SVG bruto) — o app renderiza essas formas como
// elementos <svg> de verdade em vez de aceitar markup arbitrário da IA.
const analogyShapeShape = z.object({
  id: z.string().describe('Identificador único da forma dentro do diagrama, ex: "a"'),
  type: z.enum(['box', 'circle', 'text']).describe('Tipo da forma'),
  x: z.number().describe('Posição X num plano de 400x240'),
  y: z.number().describe('Posição Y num plano de 400x240'),
  w: z.number().optional().describe('Largura (box) ou diâmetro (circle)'),
  h: z.number().optional().describe('Altura (só para box)'),
  text: z.string().optional().describe('Rótulo exibido dentro/ao lado da forma'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{3,8}$/)
    .optional()
    .describe('Cor em hex, ex: "#2C4BE0"'),
});

const analogyArrowShape = z.object({
  from: z.string().describe('id da forma de origem'),
  to: z.string().describe('id da forma de destino'),
  label: z.string().optional().describe('Rótulo da seta'),
});

const analogyFieldsShape = {
  analogy_caption: z.string().optional().describe('Legenda curta explicando a analogia visual'),
  analogy_diagram: z
    .object({
      shapes: z.array(analogyShapeShape).optional().describe('Formas do diagrama'),
      arrows: z.array(analogyArrowShape).optional().describe('Setas conectando formas pelo id'),
    })
    .optional()
    .describe('Diagrama estruturado da analogia visual — plano de 400x240'),
};

// Seção onde o tópico deve entrar — por id (se a IA já sabe qual) ou por nome
// (cria a seção se ainda não existir, sem a IA precisar saber IDs). Se nenhum
// dos dois for informado, cai na única seção "programming" do usuário (ou
// pede pra desambiguar se houver mais de uma).
const sectionFieldsShape = {
  section_id: z.string().optional().describe('ID de uma seção já existente onde este tópico deve entrar'),
  section_name: z
    .string()
    .optional()
    .describe('Nome de uma seção — cria automaticamente se não existir ainda. Alternativa ao section_id.'),
};

// Item de uma seção de idioma. "frame" é um molde de frase com um espaço em
// branco (o formato que o app treina); "word" é uma palavra ou expressão do
// núcleo de alta frequência.
const languageItemShape = z.object({
  kind: z
    .enum(['word', 'frame'])
    .describe('"frame" para molde de frase com ___ no lugar variável; "word" para palavra/expressão'),
  term: z.string().describe('O molde ("I need to ___") ou a palavra ("deadline")'),
  meaning: z.string().optional().describe('Tradução ou significado em português'),
  examples: z
    .array(z.string())
    .optional()
    .describe('Exemplos preenchendo o molde — use preenchimentos bem diferentes entre si, não variações da mesma frase'),
  category: z.string().optional().describe('Grupo temático, ex: "Trabalho", "Viagem", "Verbos"'),
});

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
  ...analogyFieldsShape,
  ...sectionFieldsShape,
};

server.registerTool(
  'list_sections',
  {
    title: 'Listar seções',
    description: 'Lista as seções da conta (id, nome, tipo e idioma) — cada seção agrupa tópicos ou lições relacionadas.',
    inputSchema: {},
  },
  async () => {
    const { sections } = await api.listSections();
    return { content: [{ type: 'text', text: JSON.stringify(sections, null, 2) }] };
  }
);

server.registerTool(
  'create_section',
  {
    title: 'Criar seção',
    description:
      'Cria uma seção — um contêiner que agrupa tópicos relacionados (ex: "Java", "Python") ou, ' +
      'para idiomas, um contêiner de vocabulário/gramática de um idioma específico. Use antes de ' +
      'criar tópicos quando o usuário quiser começar um assunto/idioma novo separado dos demais.',
    inputSchema: {
      name: z.string().describe('Nome da seção, ex: "Java", "Inglês"'),
      kind: z
        .enum(['programming', 'language'])
        .optional()
        .describe('Tipo de conteúdo da seção (padrão: "programming")'),
      language: z
        .enum(['en', 'es', 'fr', 'it', 'de'])
        .optional()
        .describe('Obrigatório quando kind="language": inglês/espanhol/francês/italiano/alemão'),
    },
  },
  async (input) => {
    const { id } = await api.createSection(input);
    return { content: [{ type: 'text', text: `Seção criada com sucesso. id=${id}` }] };
  }
);

server.registerTool(
  'add_language_items',
  {
    title: 'Adicionar moldes e palavras a uma seção de idioma',
    description:
      'Adiciona moldes de frase e/ou palavras a uma seção kind="language". O método do app é ' +
      'frequência e reutilização: prefira moldes com um espaço variável ("I need to ___", ' +
      '"How do I get to ___?") e palavras de alta frequência que servem de encaixe nesses ' +
      'moldes — verbos, conectores, tempo e lugar antes de substantivo específico. Evite ' +
      'vocabulário aleatório e evite explicar regra de gramática por nome; o usuário aprende ' +
      'a estrutura pelo uso.',
    inputSchema: {
      section_id: z.string().describe('ID de uma seção do tipo "language" (use list_sections para achar)'),
      items: z.array(languageItemShape).describe('Itens a adicionar de uma vez'),
    },
  },
  async ({ section_id, items }) => {
    const { inserted } = await api.addLanguageItems(section_id, items);
    return { content: [{ type: 'text', text: `${inserted} item(ns) adicionado(s) à seção de idioma.` }] };
  }
);

server.registerTool(
  'list_language_items',
  {
    title: 'Listar moldes e palavras de uma seção de idioma',
    description:
      'Lista o que o usuário já tem numa seção de idioma — use antes de adicionar, pra não repetir ' +
      'moldes ou palavras que já existem. Não inclui o plano curado que já vem no app.',
    inputSchema: { section_id: z.string().describe('ID da seção de idioma') },
  },
  async ({ section_id }) => {
    const { items } = await api.listLanguageItems(section_id);
    return { content: [{ type: 'text', text: JSON.stringify(items, null, 2) }] };
  }
);

server.registerTool(
  'create_topic',
  {
    title: 'Criar tópico de estudo completo',
    description:
      'Cria um tópico de estudo inteiro de uma vez, em vez de o usuário preencher campo a ' +
      'campo pela interface.\n\n' +
      'Preencha TODOS os campos do ciclo, não só os obrigatórios: concept_what, concept_why, ' +
      'code, use_cases, anti_patterns, common_mistakes, exercise_prompt, exercise_solution e ' +
      'pitch. Um tópico com metade dos campos vazios deixa buracos visíveis na interface — se ' +
      'faltar informação pra algum campo, escreva o que der em vez de omitir. Inclua também ' +
      'cartões de múltipla escolha, perguntas discursivas e a analogia visual.\n\n' +
      'Direcione o tópico pra seção certa: se o usuário disse em qual está estudando, passe ' +
      'section_name (cria se não existir) ou section_id. Em "anti_patterns", quando a ' +
      'limitação for "use outra coisa aqui", nomeie a alternativa — e se essa alternativa ' +
      'também for um tópico da conta, considere ligar os dois com set_topic_contrast depois.',
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
  'set_topic_analogy',
  {
    title: 'Gerar analogia visual de um tópico',
    description:
      'Cria ou substitui a analogia visual de um tópico: uma legenda curta e um diagrama ' +
      'estruturado (formas + setas, num plano de 400x240) que o app desenha como SVG. Use ' +
      'quando o usuário pedir uma analogia/desenho para entender melhor o tópico, em vez de ' +
      'só explicar em texto — o painel de analogia também deixa o usuário desenhar por cima.',
    inputSchema: { topic_id: z.string().describe('ID do tópico'), ...analogyFieldsShape },
  },
  async ({ topic_id, ...fields }) => {
    await api.updateTopic(topic_id, fields);
    return { content: [{ type: 'text', text: 'Analogia visual salva.' }] };
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
  'set_topic_contrast',
  {
    title: 'Ligar dois tópicos que se confundem',
    description:
      'Cria ou substitui o contraste entre dois tópicos — o material de "por que este e não ' +
      'aquele". Use quando o usuário disser que sabe o que cada um é mas trava na hora de ' +
      'escolher, ou quando dois tópicos da conta forem alternativas concorrentes.\n\n' +
      'O campo mais importante é "decisive_question": NÃO repita a definição de cada um (o ' +
      'usuário já tem isso nos dois tópicos) — escreva o teste concreto que resolve a escolha ' +
      'na hora, de preferência uma pergunta de sim/não sobre o problema em mãos. Exemplo bom: ' +
      '"esse valor tem irmãos? consigo listar todos e seria bug receber um fora da lista?". ' +
      'Exemplo ruim: "final impede reatribuição e enum define um conjunto fixo".\n\n' +
      'Em "scenarios", escreva situações de código do mundo real onde os dois competem de ' +
      'verdade — cada uma deve ser decidível pela decisive_question, e o conjunto deve cair ' +
      'nos dois lados (não faça todos com a mesma resposta). Escreva a situação sem citar o ' +
      'nome de nenhum dos dois tópicos: elas são exibidas embaralhadas, e citar o nome entrega ' +
      'a resposta.',
    inputSchema: {
      topic_a: z.string().describe('ID de um dos tópicos (use list_topics para achar)'),
      topic_b: z.string().describe('ID do outro tópico'),
      confusion: z
        .string()
        .optional()
        .describe('Por que os dois se confundem — normalmente o traço que fez os dois caírem na mesma gaveta mental'),
      decisive_question: z
        .string()
        .optional()
        .describe('O teste que decide a escolha na hora. É o campo central desta tool — leia a descrição.'),
      choose_a_when: z.string().optional().describe('Quando escolher o tópico informado em topic_a'),
      choose_b_when: z.string().optional().describe('Quando escolher o tópico informado em topic_b'),
      scenarios: z
        .array(
          z.object({
            situation: z.string().describe('A situação concreta, sem citar o nome de nenhum dos dois tópicos'),
            answer_topic: z.string().describe('ID do tópico que vence nessa situação (topic_a ou topic_b)'),
            why: z.string().optional().describe('O que nessa situação decidiu a escolha'),
          })
        )
        .optional()
        .describe('Exercício de discriminação — 4 a 6 cenários, distribuídos entre os dois lados'),
    },
  },
  async (input) => {
    const { id, scenarios } = await api.setContrast(input);
    return {
      content: [{ type: 'text', text: `Contraste salvo com ${scenarios} cenário(s) de treino. id=${id}` }],
    };
  }
);

server.registerTool(
  'list_contrasts',
  {
    title: 'Listar contrastes entre tópicos',
    description:
      'Lista os pares de tópicos que o usuário já marcou como "confundo com", incluindo a ' +
      'pergunta que decide e os cenários de treino. Use antes de criar um contraste novo, pra ' +
      'não sobrescrever o que já existe.',
    inputSchema: {},
  },
  async () => {
    const { contrasts } = await api.listContrasts();
    return { content: [{ type: 'text', text: JSON.stringify(contrasts, null, 2) }] };
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
