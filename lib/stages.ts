// Ciclo de aprendizado de um tópico, na ordem em que aparece no "mapa do ciclo"
// e nos painéis da página do tópico. Portado do `stageDefs` do design
// "Review Cards Pro" (Claude Design).
export type StageDef = {
  key: 'concept_what' | 'concept_why' | 'code' | 'use_cases' | 'anti_patterns' | 'common_mistakes' | 'exercise_prompt';
  title: string;
  short: string;
  icon: string;
  color: string;
  tint: string;
  isCode?: boolean;
};

export const STAGE_DEFS: StageDef[] = [
  { key: 'concept_what', title: 'O que é', short: 'Conceito', icon: 'ph-fill ph-brain', color: '#2C4BE0', tint: '#E9ECFF' },
  { key: 'concept_why', title: 'Por que existe', short: 'Por quê', icon: 'ph-fill ph-question', color: '#2C4BE0', tint: '#E9ECFF' },
  { key: 'code', title: 'Código', short: 'Código', icon: 'ph-fill ph-code', color: '#7C3AED', tint: '#F1E9FE', isCode: true },
  { key: 'use_cases', title: 'Onde usar', short: 'Onde usar', icon: 'ph-fill ph-check-circle', color: '#0E9F6E', tint: '#E1FAEF' },
  { key: 'anti_patterns', title: 'Onde não usar', short: 'Não usar', icon: 'ph-fill ph-prohibit', color: '#EF4444', tint: '#FEECEA' },
  { key: 'common_mistakes', title: 'Erros comuns', short: 'Erros', icon: 'ph-fill ph-warning', color: '#D97706', tint: '#FDF0DC' },
  { key: 'exercise_prompt', title: 'Prática', short: 'Prática', icon: 'ph-fill ph-barbell', color: '#E5387E', tint: '#FCE7F1' },
];

// Os 6 primeiros estágios renderizam como painéis simples (um campo de texto ou
// código); "Prática" (exercise_prompt) é tratado à parte pois tem dois campos
// (enunciado + gabarito).
export const SIMPLE_STAGE_DEFS = STAGE_DEFS.filter((s) => s.key !== 'exercise_prompt');
export const PRACTICE_STAGE_DEF = STAGE_DEFS.find((s) => s.key === 'exercise_prompt')!;

// Subconjunto usado no formulário de novo tópico (sem código nem prática —
// esses são adicionados depois, na página do tópico). Rótulos/placeholders
// portados do `newFields` do design.
export const NEW_TOPIC_FIELDS = [
  { key: 'concept_what', label: 'O que é (conceito)', ph: 'A ideia central, em uma ou duas frases…', icon: 'ph-fill ph-brain', color: '#2C4BE0', tint: '#E9ECFF' },
  { key: 'concept_why', label: 'Por que existe', ph: 'Que problema isso resolve…', icon: 'ph-fill ph-question', color: '#2C4BE0', tint: '#E9ECFF' },
  { key: 'use_cases', label: 'Onde usar — casos reais', ph: 'Situações concretas…', icon: 'ph-fill ph-check-circle', color: '#0E9F6E', tint: '#E1FAEF' },
  { key: 'anti_patterns', label: 'Onde não usar — trade-offs', ph: 'Limitações e alternativas…', icon: 'ph-fill ph-prohibit', color: '#EF4444', tint: '#FEECEA' },
  { key: 'common_mistakes', label: 'Erros comuns', ph: 'Armadilhas frequentes…', icon: 'ph-fill ph-warning', color: '#D97706', tint: '#FDF0DC' },
] as const;
