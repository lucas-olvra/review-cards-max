import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Assunto do tópico usado pra montar a nota — mesmos campos de
// `topicFieldsShape` em index.ts, só os narráveis/legíveis (sem exercício,
// pitch ou analogia, que não fazem sentido numa nota de referência rápida).
export interface ObsidianTopic {
  id: string;
  name: string;
  concept_what?: string;
  concept_why?: string;
  code?: string;
  use_cases?: string;
  anti_patterns?: string;
  common_mistakes?: string;
}

const VAULT_SUBFOLDER = 'Review Cards';

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '').trim();
  return cleaned || 'Tópico sem nome';
}

function section(title: string, value: string | undefined): string {
  if (!value || !value.trim()) return '';
  return `## ${title}\n\n${value.trim()}\n\n`;
}

function buildMarkdown(topic: ObsidianTopic, relatedTopicNames: string[]): string {
  const frontmatterLines = ['---', 'tags: [review-cards]', `created: ${new Date().toISOString()}`, `topic_id: ${topic.id}`, '---', ''];

  let body = `# ${topic.name}\n\n`;
  body += section('O que é', topic.concept_what);
  body += section('Por que existe', topic.concept_why);
  if (topic.code && topic.code.trim()) {
    body += `## Código\n\n\`\`\`\n${topic.code.trim()}\n\`\`\`\n\n`;
  }
  body += section('Onde usar', topic.use_cases);
  body += section('Onde não usar', topic.anti_patterns);
  body += section('Erros comuns', topic.common_mistakes);

  if (relatedTopicNames.length > 0) {
    body += '## Conexões\n\n';
    for (const name of relatedTopicNames) {
      body += `- [[${name}]]\n`;
    }
    body += '\n';
  }

  return `${frontmatterLines.join('\n')}\n${body.trimEnd()}\n`;
}

// Exporta um tópico como nota do Obsidian em `<vault>/Review Cards/<nome>.md`.
// Links `[[assim]]` pra tópicos relacionados funcionam mesmo que a nota de
// destino ainda não exista — o Obsidian mostra como link "não resolvido" e
// resolve sozinho quando essa outra nota for criada, então não é preciso
// criar arquivos "placeholder" aqui.
export async function exportTopicToObsidian(topic: ObsidianTopic, relatedTopicNames: string[] = []): Promise<string> {
  const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
  if (!vaultPath) {
    throw new Error(
      'OBSIDIAN_VAULT_PATH não foi definida. Configure o caminho do seu vault do Obsidian no `env` do servidor MCP (veja mcp-server/README.md).'
    );
  }

  const folder = path.resolve(vaultPath, VAULT_SUBFOLDER);
  await mkdir(folder, { recursive: true });

  const filePath = path.resolve(folder, `${sanitizeFileName(topic.name)}.md`);
  const relative = path.relative(folder, filePath);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error('Nome de tópico inválido para exportação.');
  }

  await writeFile(filePath, buildMarkdown(topic, relatedTopicNames), 'utf-8');

  return filePath;
}
