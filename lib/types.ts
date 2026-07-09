export interface Topic {
  id: string;
  user_id: string;
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
