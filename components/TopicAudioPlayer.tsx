'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { SIMPLE_STAGE_DEFS, PRACTICE_STAGE_DEF } from '@/lib/stages';
import { accent } from '@/lib/ui';
import type { Topic } from '@/lib/types';

type Segment = { title: string; text: string; icon: string; color: string };

const noopSubscribe = () => () => {};

// Assume suportado durante SSR/hidratação (server e client concordam), só
// corrige pra `false` depois que o client consegue checar `window` de fato —
// evita tanto mismatch de hidratação quanto setState direto num efeito.
function useSpeechSupported() {
  return useSyncExternalStore(
    noopSubscribe,
    () => 'speechSynthesis' in window,
    () => true
  );
}

// Monta os segmentos narráveis do tópico: um por estágio com conteúdo, na
// mesma ordem em que aparecem na página. `code` é pulado (ler código em voz
// alta não ajuda) e a prática narra só o enunciado — nunca o gabarito, pra
// não entregar a resposta em áudio.
function buildSegments(topic: Topic): { segments: Segment[]; skippedCode: boolean } {
  const segments: Segment[] = [];
  let skippedCode = false;

  for (const stage of SIMPLE_STAGE_DEFS) {
    const value = topic[stage.key]?.trim();
    if (!value) continue;
    if (stage.isCode) {
      skippedCode = true;
      continue;
    }
    segments.push({ title: stage.title, text: value, icon: stage.icon, color: stage.color });
  }

  const prompt = topic.exercise_prompt?.trim();
  if (prompt) {
    segments.push({ title: PRACTICE_STAGE_DEF.title, text: prompt, icon: PRACTICE_STAGE_DEF.icon, color: PRACTICE_STAGE_DEF.color });
  }

  return { segments, skippedCode };
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices.find((v) => v.lang.toLowerCase().startsWith('pt')) ?? voices[0];
}

export function TopicAudioPlayer({ topic }: { topic: Topic }) {
  const { segments, skippedCode } = useMemo(() => buildSegments(topic), [topic]);

  const supported = useSpeechSupported();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const rateRef = useRef(rate);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, [supported]);

  // Navegação entre tópicos no App Router não recarrega a página — sem isso
  // um áudio tocando ficaria preso quando o usuário sai do tópico.
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  function speakFrom(index: number) {
    if (!supported || index < 0 || index >= segments.length) {
      setPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const segment = segments[index];
    const utterance = new SpeechSynthesisUtterance(`${segment.title}. ${segment.text}`);
    utterance.lang = 'pt-BR';
    utterance.rate = rateRef.current;
    const voice = pickVoice(voices);
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      setCurrent((i) => {
        const next = i + 1;
        if (next < segments.length) {
          speakFrom(next);
          return next;
        }
        setPlaying(false);
        return i;
      });
    };

    setCurrent(index);
    setPlaying(true);
    setPaused(false);
    window.speechSynthesis.speak(utterance);
  }

  function handlePlayPause() {
    if (!playing) {
      speakFrom(current);
      return;
    }
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
  }

  function handleSkip(delta: number) {
    const next = current + delta;
    if (next < 0 || next >= segments.length) return;
    speakFrom(next);
  }

  if (segments.length === 0) return null;

  return (
    <div className="rcp-card" style={{ marginBottom: 22, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: '#E9ECFF',
            flex: 'none',
          }}
        >
          <i className="ph-fill ph-speaker-high" style={{ color: accent, fontSize: 18 }} />
        </span>
        <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 16, margin: 0, flex: 1 }}>
          Ouvir este tópico
        </h3>
      </div>

      {!supported ? (
        <p style={{ fontSize: 13.5, color: '#86827A', margin: 0 }}>
          Áudio não suportado neste navegador.
        </p>
      ) : (
        <>
          <div
            className="rcp-scroll"
            style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 4 }}
          >
            {segments.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => speakFrom(i)}
                style={{
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 12px 7px 7px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: i === current && playing ? s.color : `${s.color}1A`,
                  transition: 'background 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    display: 'grid',
                    placeItems: 'center',
                    background: i === current && playing ? 'rgba(255,255,255,.25)' : s.color,
                  }}
                >
                  <i className={s.icon} style={{ color: '#fff', fontSize: 11 }} />
                </span>
                <span
                  style={{
                    font: '600 12px var(--font-body)',
                    color: i === current && playing ? '#fff' : s.color,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.title}
                </span>
              </button>
            ))}
          </div>

          {skippedCode && (
            <p style={{ fontSize: 12.5, color: '#86827A', margin: '0 0 12px' }}>
              Código pulado no áudio — veja na tela.
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <button
              type="button"
              onClick={() => handleSkip(-1)}
              disabled={current === 0}
              className="rcp-icon-btn"
              title="Estágio anterior"
            >
              <i className="ph-fill ph-skip-back" style={{ fontSize: 16 }} />
            </button>

            <button
              type="button"
              onClick={handlePlayPause}
              className="rcp-btn-primary"
              style={{ width: 40, height: 40, borderRadius: 999, padding: 0, display: 'grid', placeItems: 'center' }}
            >
              <i
                className={playing && !paused ? 'ph-fill ph-pause' : 'ph-fill ph-play'}
                style={{ fontSize: 16 }}
              />
            </button>

            <button
              type="button"
              onClick={() => handleSkip(1)}
              disabled={current >= segments.length - 1}
              className="rcp-icon-btn"
              title="Próximo estágio"
            >
              <i className="ph-fill ph-skip-forward" style={{ fontSize: 16 }} />
            </button>

            <button type="button" onClick={handleStop} disabled={!playing} className="rcp-icon-btn" title="Parar">
              <i className="ph-fill ph-stop" style={{ fontSize: 16 }} />
            </button>

            <div style={{ flex: 1 }} />

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#86827A' }}>
              Velocidade
              <input
                type="range"
                min={0.75}
                max={1.5}
                step={0.25}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                style={{ width: 70 }}
              />
              <span style={{ width: 28 }}>{rate}x</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
