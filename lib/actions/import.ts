'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface LegacySection {
  name: string;
  concept?: { what?: string; why?: string };
  summary?: string; // formato pré-Fase-1, anterior a "concept"
  code?: string;
  useCases?: string;
  antiPatterns?: string;
  commonMistakes?: string;
  exercise?: { prompt?: string; solution?: string };
  pitch?: string;
  cards?: Array<{
    question: string;
    options: string[];
    correct: number;
    explanation?: string;
    analogy?: string;
  }>;
  discursive?: Array<{ question: string; modelAnswer?: string }>;
}

export async function importLegacyJson(raw: string): Promise<{ imported: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  let parsed: { sections?: LegacySection[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Arquivo não é um JSON válido.');
  }

  const sections = parsed.sections ?? [];
  if (!Array.isArray(sections) || !sections.length) {
    throw new Error('Nenhuma seção encontrada no arquivo.');
  }

  // O import legado não tem noção de seções (Fase 7) — tudo cai numa seção
  // "Programação" padrão, reaproveitando a mesma se já existir.
  const { data: existingSection } = await supabase
    .from('sections')
    .select('id')
    .eq('user_id', user.id)
    .eq('kind', 'programming')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  let sectionId = existingSection?.id as string | undefined;
  if (!sectionId) {
    const { data: newSection, error: sectionError } = await supabase
      .from('sections')
      .insert({ user_id: user.id, name: 'Programação', kind: 'programming' })
      .select('id')
      .single();
    if (sectionError || !newSection) throw new Error(sectionError?.message ?? 'Falha ao criar seção padrão.');
    sectionId = newSection.id;
  }

  let imported = 0;
  for (const section of sections) {
    if (!section?.name) continue;

    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .insert({
        user_id: user.id,
        section_id: sectionId,
        name: section.name,
        concept_what: section.concept?.what ?? section.summary ?? '',
        concept_why: section.concept?.why ?? '',
        code: section.code ?? '',
        use_cases: section.useCases ?? '',
        anti_patterns: section.antiPatterns ?? '',
        common_mistakes: section.commonMistakes ?? '',
        exercise_prompt: section.exercise?.prompt ?? '',
        exercise_solution: section.exercise?.solution ?? '',
        pitch: section.pitch ?? '',
      })
      .select('id')
      .single();

    if (topicError || !topic) continue;

    const cards = (section.cards ?? []).map((c, idx) => ({
      topic_id: topic.id,
      question: c.question ?? '',
      options: c.options ?? ['', '', '', ''],
      correct: c.correct ?? 0,
      explanation: c.explanation ?? '',
      analogy: c.analogy ?? '',
      position: idx,
    }));
    if (cards.length) await supabase.from('cards').insert(cards);

    const discursive = (section.discursive ?? []).map((d, idx) => ({
      topic_id: topic.id,
      question: d.question ?? '',
      model_answer: d.modelAnswer ?? '',
      position: idx,
    }));
    if (discursive.length) await supabase.from('discursive_questions').insert(discursive);

    imported++;
  }

  revalidatePath(`/sections/${sectionId}`);
  return { imported };
}
