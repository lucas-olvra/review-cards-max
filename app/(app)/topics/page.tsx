import Link from 'next/link';
import { getTopics, deleteTopic } from '@/lib/actions/topics';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import { buttonDangerClass, buttonSecondaryClass, cardClass } from '@/lib/ui';

export default async function TopicsPage() {
  const topics = await getTopics();

  if (!topics.length) {
    return (
      <div className={`${cardClass} text-center`}>
        <h2 className="mb-2 text-xl font-bold">👋 Bem-vindo ao Review Cards Pro</h2>
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

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <div key={topic.id} className={cardClass}>
          <h3 className="text-lg font-semibold">{topic.name}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/topics/${topic.id}`} className={buttonSecondaryClass}>
              Abrir
            </Link>
            <Link href={`/topics/${topic.id}/review`} className={buttonSecondaryClass}>
              Revisar
            </Link>
            <ConfirmSubmitButton
              action={deleteTopic.bind(null, topic.id)}
              confirmMessage="Tem certeza que deseja excluir este tópico?"
              className={buttonDangerClass}
            >
              Excluir
            </ConfirmSubmitButton>
          </div>
        </div>
      ))}
    </div>
  );
}
