'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { createClient } from '@/lib/supabase/client';
import { createNarrationSession } from '@/lib/actions/language';
import { accent, buttonPrimaryClass, buttonSecondaryClass, inputClass, textareaClass } from '@/lib/ui';
import type { LanguageFrame } from '@/lib/language/seed';

type Phase = 'setup' | 'recording' | 'review';

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// A extensão precisa bater com o container que o navegador realmente gravou —
// Chrome entrega webm e Safari mp4, e o Storage serve o arquivo de volta pelo
// content-type que subiu.
function extensionFor(mimeType: string) {
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
}

export function NarrationRunner({
  sectionId,
  userId,
  prompts,
  frames,
  targetMinutes,
  backHref,
}: {
  sectionId: string;
  userId: string;
  prompts: string[];
  frames: LanguageFrame[];
  targetMinutes: number;
  backHref: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('setup');
  const [isRecording, setIsRecording] = useState(false);
  const [prompt, setPrompt] = useState(prompts[0] ?? '');
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState('');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const targetSeconds = targetMinutes * 60;

  useEffect(() => {
    if (phase !== 'recording') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Sair da página no meio da gravação deixaria o microfone ligado e a URL do
  // preview vazando memória — os dois são limpos aqui.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function startRecording() {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const recorded = new Blob(chunksRef.current, { type: recorder.mimeType });
        setBlob(recorded);
        setPreviewUrl(URL.createObjectURL(recorded));
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start();
      recorderRef.current = recorder;
      setElapsed(0);
      setIsRecording(true);
      setPhase('recording');
    } catch {
      setMicError('Não consegui acessar o microfone. Você ainda pode narrar usando só o cronômetro.');
    }
  }

  function startWithoutRecording() {
    setMicError(null);
    setBlob(null);
    setElapsed(0);
    setIsRecording(false);
    setPhase('recording');
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
    setPhase('review');
  }

  async function save() {
    setSaving(true);
    let audioPath: string | null = null;

    if (blob) {
      const supabase = createClient();
      // O primeiro segmento do path é o que as políticas do bucket usam pra
      // decidir o dono — mudar essa ordem quebra o RLS do Storage.
      const path = `${userId}/${sectionId}/${Date.now()}.${extensionFor(blob.type)}`;
      const { error } = await supabase.storage.from('narrations').upload(path, blob, {
        contentType: blob.type || 'audio/webm',
      });
      if (!error) audioPath = path;
    }

    await createNarrationSession({ sectionId, prompt, durationSeconds: elapsed, audioPath, notes });
    router.push(backHref);
  }

  const progress = Math.min(1, elapsed / targetSeconds);

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '30px 26px 60px' }}>
      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h1 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 30, letterSpacing: '-.025em', margin: '0 0 8px' }}>
              O que você vai narrar?
            </h1>
            <p style={{ fontSize: 14.5, color: '#6B6862', margin: '0 0 24px', lineHeight: 1.6 }}>
              Escolha algo que você realmente faz. O exercício é descrever em tempo real — não montar um texto bonito.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="rcp-pill-btn"
                  style={{
                    background: p === prompt ? accent : '#fff',
                    color: p === prompt ? '#fff' : '#55524B',
                    border: '1.5px solid rgba(0,0,0,.08)',
                    fontSize: 12.5,
                    padding: '8px 13px',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <label style={{ display: 'block', marginBottom: 24 }}>
              <span className="rcp-label">Ou escreva o seu tema</span>
              <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className={inputClass} placeholder="ex: Montando minha mochila" />
            </label>

            {micError && (
              <p style={{ fontSize: 13.5, color: '#B42318', background: '#FDECEA', borderRadius: 12, padding: '11px 14px', margin: '0 0 16px' }}>
                {micError}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={startRecording} className={buttonPrimaryClass}>
                <i className="ph-fill ph-microphone" style={{ marginRight: 7 }} />
                Gravar e começar
              </button>
              <button type="button" onClick={startWithoutRecording} className={buttonSecondaryClass}>
                Só o cronômetro
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'recording' && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#86827A', margin: '0 0 20px' }}>{prompt}</p>

            <div style={{ position: 'relative', width: 190, height: 190, margin: '0 auto 22px' }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,.07)" strokeWidth="7" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={accent}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - progress)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <div className="rcp-font-display" style={{ fontWeight: 700, fontSize: 34, letterSpacing: '-.02em' }}>
                  {formatClock(elapsed)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 26 }}>
              {isRecording && (
                <motion.span
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ width: 9, height: 9, borderRadius: 999, background: '#EF4444', display: 'inline-block' }}
                />
              )}
              <span style={{ fontSize: 13, color: '#86827A' }}>
                {isRecording ? 'Gravando' : 'Sem gravação'} · meta de {targetMinutes} min
              </span>
            </div>

            {frames.length > 0 && (
              <div style={{ textAlign: 'left', marginBottom: 26 }}>
                <p style={{ fontSize: 12.5, color: '#86827A', margin: '0 0 8px' }}>Se travar, encaixe um destes:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {frames.map((f) => (
                    <span
                      key={f.id}
                      className="rcp-font-code"
                      style={{ fontSize: 12.5, background: '#fff', border: '1.5px solid rgba(0,0,0,.07)', borderRadius: 999, padding: '6px 12px' }}
                    >
                      {f.template}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button type="button" onClick={stopRecording} className={buttonPrimaryClass}>
              <i className="ph-fill ph-stop" style={{ marginRight: 7 }} />
              Terminei
            </button>
          </motion.div>
        )}

        {phase === 'review' && (
          <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-.025em', margin: '0 0 8px' }}>
              {formatClock(elapsed)} de narração
            </h1>
            <p style={{ fontSize: 14.5, color: '#6B6862', margin: '0 0 22px', lineHeight: 1.6 }}>
              Ouça antes de salvar. Vai soar estranho — todo mundo acha. O que importa é onde você travou.
            </p>

            {previewUrl && <audio src={previewUrl} controls style={{ width: '100%', marginBottom: 20 }} />}

            <label style={{ display: 'block', marginBottom: 22 }}>
              <span className="rcp-label">Onde você travou? (opcional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={textareaClass}
                style={{ minHeight: 84 }}
                placeholder="ex: não sabia dizer &quot;engarrafamento&quot;, troquei por &quot;a lot of cars&quot;"
              />
            </label>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={save} disabled={saving} className={buttonPrimaryClass}>
                {saving ? <i className="ph ph-spinner rcp-spin" style={{ marginRight: 7 }} /> : <i className="ph-bold ph-check" style={{ marginRight: 7 }} />}
                {saving ? 'Salvando…' : 'Salvar sessão'}
              </button>
              <button type="button" onClick={() => setPhase('setup')} disabled={saving} className={buttonSecondaryClass}>
                Descartar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
