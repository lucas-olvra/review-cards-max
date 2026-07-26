export interface AnalogyShape {
  id: string;
  type: 'box' | 'circle' | 'text';
  x: number;
  y: number;
  w?: number;
  h?: number;
  text?: string;
  color?: string;
}

export interface AnalogyArrow {
  from: string;
  to: string;
  label?: string;
}

export interface AnalogyDiagram {
  shapes: AnalogyShape[];
  arrows: AnalogyArrow[];
}

export interface AnalogyStroke {
  points: [number, number][];
  color: string;
  width: number;
}

export type SectionKind = 'programming' | 'language';
export type LanguageCode = 'en' | 'es' | 'fr' | 'it' | 'de';

export interface Section {
  id: string;
  user_id: string;
  name: string;
  kind: SectionKind;
  language: LanguageCode | null;
  created_at: string;
}

export interface Topic {
  id: string;
  user_id: string;
  section_id: string;
  name: string;
  concept_what: string;
  concept_why: string;
  code: string;
  use_cases: string;
  anti_patterns: string;
  common_mistakes: string;
  exercise_prompt: string;
  exercise_solution: string;
  pitch: string;
  analogy_caption: string;
  analogy_diagram: AnalogyDiagram;
  analogy_drawing: AnalogyStroke[];
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  topic_id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  analogy: string;
  position: number;
  created_at: string;
}

export interface DiscursiveQuestion {
  id: string;
  topic_id: string;
  question: string;
  model_answer: string;
  position: number;
  created_at: string;
}

export interface TopicWithChildren extends Topic {
  cards: Card[];
  discursive_questions: DiscursiveQuestion[];
}

export type LanguageItemKind = 'word' | 'frame';

export interface LanguageItem {
  id: string;
  user_id: string;
  section_id: string;
  kind: LanguageItemKind;
  term: string;
  meaning: string;
  examples: string[];
  category: string;
  source: 'manual' | 'mcp';
  created_at: string;
}

export interface NarrationSession {
  id: string;
  user_id: string;
  section_id: string;
  prompt: string;
  duration_seconds: number;
  audio_path: string | null;
  notes: string;
  created_at: string;
}

// Um caso concreto onde os dois tópicos do contraste competem, e qual vence.
// `answer` aponta pro lado canônico (topic_a / topic_b) da linha.
export interface ContrastScenario {
  situation: string;
  answer: 'a' | 'b';
  why: string;
}

export interface TopicContrast {
  id: string;
  user_id: string;
  topic_a: string;
  topic_b: string;
  confusion: string;
  decisive_question: string;
  choose_a_when: string;
  choose_b_when: string;
  scenarios: ContrastScenario[];
  source: 'manual' | 'mcp';
  created_at: string;
  updated_at: string;
}

// O par é guardado em ordem canônica, mas a interface sempre fala da
// perspectiva do tópico que você está olhando: `this` é ele, `other` é o outro.
export interface ContrastFromHere {
  id: string;
  thisTopicId: string;
  thisTopicName: string;
  otherTopicId: string;
  otherTopicName: string;
  confusion: string;
  decisive_question: string;
  chooseThisWhen: string;
  chooseOtherWhen: string;
  scenarios: { situation: string; why: string; answerTopicId: string; answerName: string }[];
}

export interface ChangelogStep {
  title: string;
  text: string;
}

export interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  steps: ChangelogStep[] | null;
  created_at: string;
}
