import { redirect } from 'next/navigation';

// Tópicos agora vivem dentro de uma seção (Fase 7) — mantido como redirect
// pra não quebrar links/favoritos antigos que apontavam pra /topics.
export default function TopicsPage() {
  redirect('/sections');
}
