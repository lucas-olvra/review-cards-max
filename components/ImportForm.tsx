'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="space-y-4">
      <input
        type="file"
        accept="application/json"
        disabled={isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-200 hover:file:bg-slate-700"
      />
      {isPending && <p className="text-sm text-slate-400">Importando...</p>}
      {error && <p className="rounded-md bg-red-950 p-3 text-sm text-red-300">{error}</p>}
      {result !== null && (
        <div className="space-y-3">
          <p className="rounded-md bg-emerald-950 p-3 text-sm text-emerald-300">
            {result} tópico(s) importado(s) com sucesso.
          </p>
          <a href="/topics" className={buttonPrimaryClass}>
            Ver meus tópicos
          </a>
        </div>
      )}
    </div>
  );
}
