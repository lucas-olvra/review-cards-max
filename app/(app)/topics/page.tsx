import Link from 'next/link';
import { getTopics } from '@/lib/actions/topics';
import { TopicsList } from '@/components/TopicsList';
import { AnimatedEmoji } from '@/components/AnimatedEmoji';
import { buttonSecondaryClass, cardClass } from '@/lib/ui';

export default async function TopicsPage() {
  const topics = await getTopics();

  if (!topics.length) {
    return (
      <div className={`${cardClass} text-center`}>
        <h2 className="mb-2 text-xl font-bold">
          <AnimatedEmoji>👋</AnimatedEmoji> Bem-vindo ao Review Cards Pro
        </h2>
        <p className="mx-auto mb-5 max-w-md text-slate-400">
          Cada <strong className="text-slate-200">tópico</strong> aqui é um ciclo completo de
          aprendizado: conceito → código → onde usar → onde não usar → erros comuns → prática →
          revisão → explicar em voz alta.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/topics/new" className={buttonSecondaryClass}>
            + Criar meu primeiro tópico
          </Link>
          <Link href="/import" className={buttonSecondaryClass}>
            Importar dados antigos
          </Link>
        </div>
      </div>
    );
  }

  return <TopicsList topics={topics} />;
}
