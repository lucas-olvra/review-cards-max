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
