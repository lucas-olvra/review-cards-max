import { ImportForm } from '@/components/ImportForm';
import { cardClass } from '@/lib/ui';

export default function ImportPage() {
  return (
    <div className={cardClass}>
      <h2 className="mb-2 text-xl font-bold">Importar dados antigos</h2>
      <p className="mb-6 text-sm text-slate-400">
        Selecione o arquivo <code>review-cards.json</code> exportado da versão anterior do app
        (botão &quot;Exportar&quot;). Cada tópico vira uma seção nova na sua conta.
      </p>
      <ImportForm />
    </div>
  );
}
