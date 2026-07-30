import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSection } from '@/lib/actions/sections';
import { getLanguageItems } from '@/lib/actions/language';
import { NarrationRunner } from '@/components/language/NarrationRunner';
import { planFor } from '@/lib/language/seed';
import { safeInternalHref } from '@/lib/nav';

export default async function NarrationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const section = await getSection(id);
  if (!section || section.kind !== 'language') notFound();

  // Sem isso a sessão salva devolvia a pessoa pra aba "Moldes" da seção, longe
  // do painel de narração de onde ela tinha saído.
  const backHref = safeInternalHref(from, `/sections/${id}?tab=narration`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const plan = planFor(section.language);
  const items = await getLanguageItems(id);
  const userFrames = items
    .filter((i) => i.kind === 'frame')
    .map((i) => ({ id: `db:${i.id}`, template: i.term, meaning: i.meaning, hint: '', examples: i.examples }));

  // Só os primeiros moldes viram muleta na tela de gravação — a lista inteira
  // vira parede de texto e tira o foco de narrar.
  const cues = [...plan.frames, ...userFrames].slice(0, 8);

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '26px 26px 0' }}>
      <Link
        href={backHref}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A' }}
      >
        <i className="ph ph-x" /> Sair
      </Link>
      <NarrationRunner
        sectionId={id}
        userId={user.id}
        prompts={plan.narrationPrompts}
        frames={cues}
        targetMinutes={5}
        backHref={backHref}
      />
    </div>
  );
}
