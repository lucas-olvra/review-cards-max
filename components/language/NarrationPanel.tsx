'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { deleteNarrationSession, getNarrationAudioUrl } from '@/lib/actions/language';
import { accent } from '@/lib/ui';
import type { NarrationStats } from '@/lib/language/stats';
import type { NarrationSession } from '@/lib/types';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Abaixo de um minuto arredondaria pra "0 min" e a primeira sessão pareceria
// não ter contado — nesse caso mostra segundos.
function formatTotal(stats: NarrationStats) {
  if (stats.totalMinutes > 0) return `${stats.totalMinutes} min`;
  return `${stats.totalSeconds}s`;
}

function StatTile({ icon, color, tint, value, label }: { icon: string; color: string; tint: string; value: string; label: string }) {
  return (
    <div className="rcp-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, flex: 'none', display: 'grid', placeItems: 'center', background: tint }}>
        <i className={icon} style={{ color, fontSize: 18 }} />
      </span>
      <div>
        <div className="rcp-font-display" style={{ fontWeight: 700, fontSize: 21, lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12.5, color: '#86827A' }}>{label}</div>
      </div>
    </div>
  );
}

// O bucket é privado, então cada áudio só ganha URL quando o usuário clica em
// ouvir — evita pedir dezenas de URLs assinadas só pra renderizar a lista.
function SessionRow({ session, sectionId }: { session: NarrationSession; sectionId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function loadAudio() {
    if (!session.audio_path) return;
    setLoading(true);
    setUrl(await getNarrationAudioUrl(session.audio_path));
    setLoading(false);
  }

  return (
    <div className="rcp-list-row" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '600 14px var(--font-body)' }}>{session.prompt || 'Narração livre'}</div>
          <div style={{ fontSize: 12.5, color: '#86827A', marginTop: 2 }}>
            {new Date(session.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} ·{' '}
            {formatDuration(session.duration_seconds)}
          </div>
        </div>

        {session.audio_path && !url && (
          <button type="button" onClick={loadAudio} disabled={loading} className="rcp-icon-btn" title="Ouvir">
            <i className={loading ? 'ph ph-spinner rcp-spin' : 'ph-fill ph-play'} style={{ fontSize: 16 }} />
          </button>
        )}

        <button
          type="button"
          title="Excluir gravação"
          onClick={() => startTransition(() => deleteNarrationSession(sectionId, session.id))}
          disabled={pending}
          className="rcp-icon-btn"
        >
          <i className="ph ph-trash" style={{ fontSize: 15 }} />
        </button>
      </div>

      {session.notes && (
        <p style={{ fontSize: 13, color: '#6B6862', margin: 0, lineHeight: 1.55 }}>{session.notes}</p>
      )}

      {url && <audio src={url} controls style={{ width: '100%' }} />}
    </div>
  );
}

export function NarrationPanel({
  sectionId,
  sessions,
  stats,
}: {
  sectionId: string;
  sessions: NarrationSession[];
  stats: NarrationStats;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div
        className="rcp-card"
        style={{ background: '#161616', borderColor: '#161616', padding: 24, color: '#fff' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <i className="ph-fill ph-microphone-stage" style={{ fontSize: 20, color: '#fff' }} />
          <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 18, margin: 0, color: '#fff' }}>
            Narração em voz alta
          </h3>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', margin: '0 0 18px', lineHeight: 1.6, maxWidth: '54ch' }}>
          5 a 10 minutos por dia narrando o que você está fazendo, em tempo real. Travou numa palavra? Fala em
          português e segue. É o único exercício que treina velocidade de produção.
        </p>
        <Link
          href={`/sections/${sectionId}/narration`}
          className="rcp-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#fff' }}
        >
          <i className="ph-fill ph-microphone" />
          {stats.narratedToday ? 'Narrar de novo' : 'Narrar agora'}
        </Link>
        {stats.narratedToday && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 14, fontSize: 13.5, color: '#5FE3A1' }}>
            <i className="ph-fill ph-check-circle" /> Já narrou hoje
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <StatTile
          icon="ph-fill ph-flame"
          color="#D97706"
          tint="#FDF0DC"
          value={`${stats.streakDays}`}
          label={stats.streakDays === 1 ? 'dia seguido' : 'dias seguidos'}
        />
        <StatTile icon="ph-fill ph-timer" color={accent} tint="#E9ECFF" value={formatTotal(stats)} label="narrados no total" />
        <StatTile icon="ph-fill ph-waveform" color="#12B76A" tint="#DFF7EB" value={`${stats.totalSessions}`} label="sessões narradas" />
      </div>

      {sessions.length === 0 ? (
        <div className="rcp-card" style={{ textAlign: 'center', padding: 34 }}>
          <i className="ph-fill ph-waveform" style={{ fontSize: 30, color: '#9A968E' }} />
          <p style={{ fontSize: 14, color: '#6B6862', margin: '12px 0 0', lineHeight: 1.6, maxWidth: '46ch', marginInline: 'auto' }}>
            Nenhuma narração ainda. A primeira vai soar ridícula — é exatamente assim que funciona. Em 3 ou 4 semanas
            você vai voltar aqui e ouvir a diferença.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h4 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 15.5, margin: '6px 0 0' }}>
            Suas sessões
          </h4>
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} sectionId={sectionId} />
          ))}
        </div>
      )}
    </div>
  );
}
