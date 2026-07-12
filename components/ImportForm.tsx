'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { importLegacyJson } from '@/lib/actions/import';
import { buttonPrimaryClass } from '@/lib/ui';

export function ImportForm() {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleFile = (file: File) => {
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? '');
      startTransition(async () => {
        try {
          const { imported } = await importLegacyJson(raw);
          setResult(imported);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Falha ao importar o arquivo.');
        }
      });
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input
        type="file"
        accept="application/json"
        disabled={isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        style={{ fontSize: 14, color: '#55524B' }}
      />
      {isPending && <p style={{ fontSize: 14, color: '#86827A' }}>Importando...</p>}
      {error && (
        <p style={{ borderRadius: 12, background: '#FDECEA', color: '#B42318', padding: 12, fontSize: 14 }}>{error}</p>
      )}
      {result !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ borderRadius: 12, background: '#E1FAEF', color: '#0E7A4E', padding: 12, fontSize: 14 }}>
            {result} tópico(s) importado(s) com sucesso.
          </p>
          <Link href="/sections" className={buttonPrimaryClass} style={{ alignSelf: 'flex-start' }}>
            Ver minhas seções
          </Link>
        </div>
      )}
    </div>
  );
}
