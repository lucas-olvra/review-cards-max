import { createTopic } from '@/lib/actions/topics';
import { buttonPrimaryClass, cardClass, inputClass, labelClass, textareaClass } from '@/lib/ui';

export default function NewTopicPage() {
  return (
    <div className={cardClass}>
      <h2 className="mb-6 text-xl font-bold">Novo Tópico</h2>
      <form action={createTopic} className="space-y-5">
        <div>
          <label className={labelClass}>Nome do tópico</label>
          <input name="name" required className={inputClass} placeholder="ex: Closures em JavaScript" />
        </div>
        <div>
          <label className={labelClass}>O que é (conceito)</label>
          <textarea name="concept_what" className={textareaClass} />
        </div>
        <div>
          <label className={labelClass}>Por que existe</label>
          <textarea name="concept_why" className={textareaClass} />
        </div>
        <div>
          <label className={labelClass}>Onde usar — casos reais</label>
          <textarea name="use_cases" className={textareaClass} />
        </div>
        <div>
          <label className={labelClass}>Onde não usar — limitações/trade-offs</label>
          <textarea name="anti_patterns" className={textareaClass} />
        </div>
        <div>
          <label className={labelClass}>Erros comuns</label>
          <textarea name="common_mistakes" className={textareaClass} />
        </div>
        <button type="submit" className={buttonPrimaryClass}>
          Criar tópico
        </button>
      </form>
    </div>
  );
}
