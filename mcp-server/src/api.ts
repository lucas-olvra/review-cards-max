const API_URL = process.env.REVIEW_CARDS_API_URL;
const API_TOKEN = process.env.REVIEW_CARDS_API_TOKEN;

if (!API_URL) {
  throw new Error('REVIEW_CARDS_API_URL não foi definida.');
}
if (!API_TOKEN) {
  throw new Error('REVIEW_CARDS_API_TOKEN não foi definida.');
}

const baseUrl = API_URL.replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
      ...init?.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (body && typeof body === 'object' && 'error' in body ? body.error : null) ??
      `Requisição falhou com status ${res.status}`;
    throw new Error(String(message));
  }

  return body as T;
}

export interface CardInput {
  question: string;
  options?: string[];
  correct?: number;
  explanation?: string;
  analogy?: string;
}

export interface DiscursiveInput {
  question: string;
  model_answer?: string;
}

export interface AnalogyShapeInput {
  id: string;
  type: 'box' | 'circle' | 'text';
  x: number;
  y: number;
  w?: number;
  h?: number;
  text?: string;
  color?: string;
}

export interface AnalogyArrowInput {
  from: string;
  to: string;
  label?: string;
}

export interface AnalogyDiagramInput {
  shapes?: AnalogyShapeInput[];
  arrows?: AnalogyArrowInput[];
}

export interface SectionInput {
  name: string;
  kind?: 'programming' | 'language';
  language?: 'en' | 'es' | 'fr' | 'it' | 'de';
}

export interface CreateTopicInput {
  name: string;
  section_id?: string;
  section_name?: string;
  concept_what?: string;
  concept_why?: string;
  code?: string;
  use_cases?: string;
  anti_patterns?: string;
  common_mistakes?: string;
  exercise_prompt?: string;
  exercise_solution?: string;
  pitch?: string;
  analogy_caption?: string;
  analogy_diagram?: AnalogyDiagramInput;
  cards?: CardInput[];
  discursive?: DiscursiveInput[];
}

export const api = {
  listSections: () =>
    request<{ sections: { id: string; name: string; kind: string; language: string | null }[] }>(
      '/api/v1/sections'
    ),

  createSection: (input: SectionInput) =>
    request<{ id: string }>('/api/v1/sections', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  listTopics: () => request<{ topics: { id: string; name: string; created_at: string }[] }>('/api/v1/topics'),

  createTopic: (input: CreateTopicInput) =>
    request<{ id: string }>('/api/v1/topics', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getTopic: (id: string) => request<Record<string, unknown>>(`/api/v1/topics/${id}`),

  updateTopic: (id: string, fields: Record<string, unknown>) =>
    request<{ ok: true }>(`/api/v1/topics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    }),

  deleteTopic: (id: string) =>
    request<{ ok: true }>(`/api/v1/topics/${id}`, { method: 'DELETE' }),

  addCard: (topicId: string, card: CardInput) =>
    request<{ id: string }>(`/api/v1/topics/${topicId}/cards`, {
      method: 'POST',
      body: JSON.stringify(card),
    }),

  addDiscursive: (topicId: string, item: DiscursiveInput) =>
    request<{ id: string }>(`/api/v1/topics/${topicId}/discursive`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),
};
