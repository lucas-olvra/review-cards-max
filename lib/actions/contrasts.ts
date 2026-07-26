'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ContrastFromHere, ContrastScenario, Topic, TopicContrast } from '@/lib/types';

// O par é guardado em ordem canônica (topic_a < topic_b) com índice único, pra
// que "final × enum" e "enum × final" nunca virem duas linhas. `swapped` diz se
// a ordem pedida foi invertida — quem chama usa isso pra mapear os campos
// "deste lado"/"do outro lado" para choose_a_when/choose_b_when.
function canonicalPair(x: string, y: string) {
  return x < y
    ? { topic_a: x, topic_b: y, swapped: false }
    : { topic_a: y, topic_b: x, swapped: true };
}

async function topicNames(ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.from('topics').select('id, name').in('id', ids);
  return new Map((data ?? []).map((t) => [t.id as string, t.name as string]));
}

// Vira a linha canônica pra perspectiva do tópico que está sendo exibido, pra
// que o painel sempre leia "escolha <este> quando…" independentemente de qual
// lado do par ele ocupa no banco.
function fromPerspective(
  row: TopicContrast,
  topicId: string,
  names: Map<string, string>
): ContrastFromHere {
  const isA = row.topic_a === topicId;
  const otherId = isA ? row.topic_b : row.topic_a;
  return {
    id: row.id,
    thisTopicId: topicId,
    thisTopicName: names.get(topicId) ?? '',
    otherTopicId: otherId,
    otherTopicName: names.get(otherId) ?? '',
    confusion: row.confusion,
    decisive_question: row.decisive_question,
    chooseThisWhen: isA ? row.choose_a_when : row.choose_b_when,
    chooseOtherWhen: isA ? row.choose_b_when : row.choose_a_when,
    scenarios: (row.scenarios ?? []).map((s) => {
      const answerTopicId = s.answer === 'a' ? row.topic_a : row.topic_b;
      return {
        situation: s.situation,
        why: s.why ?? '',
        answerTopicId,
        answerName: names.get(answerTopicId) ?? '',
      };
    }),
  };
}

export async function getContrastsForTopic(topicId: string): Promise<ContrastFromHere[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('topic_contrasts')
    .select('*')
    .or(`topic_a.eq.${topicId},topic_b.eq.${topicId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as TopicContrast[];
  const names = await topicNames([topicId, ...rows.map((r) => (r.topic_a === topicId ? r.topic_b : r.topic_a))]);
  return rows.map((r) => fromPerspective(r, topicId, names));
}

export interface ContrastDrillQuestion {
  contrastId: string;
  situation: string;
  why: string;
  decisive_question: string;
  // Alternativas já embaralhadas no servidor: sortear no cliente daria
  // divergência de hidratação, e sortear na renderização reembaralharia a cada
  // re-render (a resposta mudaria de lado depois de clicada).
  options: [string, string];
  correctIndex: 0 | 1;
}

// Monta o treino de discriminação da seção: todos os cenários de todos os
// contrastes que tocam algum tópico dela, embaralhados. É embaralhado de
// propósito — o valor do exercício é a pergunta chegar sem etiqueta de tópico,
// que é justamente o que a revisão dentro de um tópico não consegue fazer.
export async function getSectionDrill(sectionId: string): Promise<ContrastDrillQuestion[]> {
  const supabase = await createClient();

  const { data: topics } = await supabase.from('topics').select('id').eq('section_id', sectionId);
  const ids = (topics ?? []).map((t) => t.id as string);
  if (!ids.length) return [];

  const list = ids.join(',');
  const { data, error } = await supabase
    .from('topic_contrasts')
    .select('*')
    .or(`topic_a.in.(${list}),topic_b.in.(${list})`);
  if (error) throw error;

  const rows = (data ?? []) as TopicContrast[];
  if (!rows.length) return [];

  const names = await topicNames(rows.flatMap((r) => [r.topic_a, r.topic_b]));

  const questions: ContrastDrillQuestion[] = [];
  for (const row of rows) {
    for (const s of row.scenarios ?? []) {
      if (!s.situation?.trim()) continue;
      const correctId = s.answer === 'a' ? row.topic_a : row.topic_b;
      const otherId = s.answer === 'a' ? row.topic_b : row.topic_a;
      const correctName = names.get(correctId) ?? '';
      const otherName = names.get(otherId) ?? '';
      const correctFirst = Math.random() < 0.5;
      questions.push({
        contrastId: row.id,
        situation: s.situation,
        why: s.why ?? '',
        decisive_question: row.decisive_question,
        options: correctFirst ? [correctName, otherName] : [otherName, correctName],
        correctIndex: correctFirst ? 0 : 1,
      });
    }
  }

  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions;
}

export async function countSectionDrill(sectionId: string): Promise<number> {
  return (await getSectionDrill(sectionId)).length;
}

// Tópicos que podem entrar num contraste, agrupados por seção pro <optgroup>.
// A seção atual vem primeiro porque é de onde vem a maioria das confusões,
// mas as outras continuam disponíveis — "Array × ArrayList" atravessa seção.
export async function getContrastCandidates(
  topicId: string,
  sectionId: string
): Promise<{ sectionName: string; topics: { id: string; name: string }[] }[]> {
  const supabase = await createClient();
  const { data: topics } = await supabase.from('topics').select('id, name, section_id');
  const { data: sections } = await supabase.from('sections').select('id, name').eq('kind', 'programming');

  const sectionNames = new Map((sections ?? []).map((s) => [s.id as string, s.name as string]));
  const grouped = new Map<string, { id: string; name: string }[]>();

  for (const t of (topics ?? []) as Pick<Topic, 'id' | 'name' | 'section_id'>[]) {
    if (t.id === topicId) continue;
    if (!sectionNames.has(t.section_id)) continue;
    const list = grouped.get(t.section_id) ?? [];
    list.push({ id: t.id, name: t.name });
    grouped.set(t.section_id, list);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => (a === sectionId ? -1 : b === sectionId ? 1 : 0))
    .map(([id, list]) => ({ sectionName: sectionNames.get(id) ?? '', topics: list }));
}

export interface ContrastInput {
  otherTopicId: string;
  confusion: string;
  decisive_question: string;
  chooseThisWhen: string;
  chooseOtherWhen: string;
}

export async function saveContrast(thisTopicId: string, input: ContrastInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  if (!input.otherTopicId) throw new Error('Escolha o tópico com que este se confunde');

  const { topic_a, topic_b, swapped } = canonicalPair(thisTopicId, input.otherTopicId);

  // `swapped` = true significa que "este tópico" caiu no lado B, então o que o
  // formulário chamou de "escolha este quando" pertence a choose_b_when.
  const { error } = await supabase.from('topic_contrasts').upsert(
    {
      user_id: user.id,
      topic_a,
      topic_b,
      confusion: input.confusion,
      decisive_question: input.decisive_question,
      choose_a_when: swapped ? input.chooseOtherWhen : input.chooseThisWhen,
      choose_b_when: swapped ? input.chooseThisWhen : input.chooseOtherWhen,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'topic_a,topic_b' }
  );
  if (error) throw error;

  revalidatePath(`/topics/${thisTopicId}`);
  revalidatePath(`/topics/${input.otherTopicId}`);
}

export async function deleteContrast(id: string, thisTopicId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('topic_contrasts').delete().eq('id', id);
  if (error) throw error;
  revalidatePath(`/topics/${thisTopicId}`);
}

export async function addScenario(
  contrastId: string,
  thisTopicId: string,
  scenario: { situation: string; answerTopicId: string; why: string }
) {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from('topic_contrasts')
    .select('*')
    .eq('id', contrastId)
    .single();
  if (!row) throw new Error('Contraste não encontrado');

  const current = ((row as TopicContrast).scenarios ?? []) as ContrastScenario[];
  const next: ContrastScenario[] = [
    ...current,
    {
      situation: scenario.situation,
      answer: scenario.answerTopicId === (row as TopicContrast).topic_a ? 'a' : 'b',
      why: scenario.why,
    },
  ];

  const { error } = await supabase
    .from('topic_contrasts')
    .update({ scenarios: next, updated_at: new Date().toISOString() })
    .eq('id', contrastId);
  if (error) throw error;

  revalidatePath(`/topics/${thisTopicId}`);
}

export async function removeScenario(contrastId: string, thisTopicId: string, index: number) {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from('topic_contrasts')
    .select('scenarios')
    .eq('id', contrastId)
    .single();
  if (!row) throw new Error('Contraste não encontrado');

  const next = ((row.scenarios ?? []) as ContrastScenario[]).filter((_, i) => i !== index);
  const { error } = await supabase
    .from('topic_contrasts')
    .update({ scenarios: next, updated_at: new Date().toISOString() })
    .eq('id', contrastId);
  if (error) throw error;

  revalidatePath(`/topics/${thisTopicId}`);
}
