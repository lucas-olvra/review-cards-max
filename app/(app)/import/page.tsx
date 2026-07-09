import { ImportForm } from '@/components/ImportForm';
import { cardClass } from '@/lib/ui';

export default function ImportPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '30px 26px 80px' }}>
      <h1 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 34, letterSpacing: '-.025em', margin: '0 0 6px' }}>
        Importar dados antigos
      </h1>
      <p style={{ fontSize: 15, color: '#6B6862', margin: '0 0 30px' }}>
        Selecione o arquivo <code>review-cards.json</code> exportado da versão anterior do app
        (botão &quot;Exportar&quot;). Cada tópico vira uma seção nova na sua conta.
      </p>
      <div className={cardClass} style={{ borderRadius: 22, padding: 28 }}>
        <ImportForm />
      </div>
    </div>
  );
}
