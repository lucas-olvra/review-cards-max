'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AnimatedEmoji } from '@/components/AnimatedEmoji';

type Slide = {
  icon: string;
  color: string;
  tint: string;
  title: string;
  text: string;
};

// Ilustra, passo a passo, o ciclo completo de um tópico — o mesmo ciclo descrito
// em `lib/stages.ts` (STAGE_DEFS), acrescido de revisão e explicação em voz alta,
// que acontecem na página do tópico depois que os estágios básicos existem.
const SLIDES: Slide[] = [
  {
    icon: 'ph-fill ph-brain',
    color: '#2C4BE0',
    tint: '#E9ECFF',
    title: '1. Conceito',
    text: 'Você escreve o que é e por que existe, em uma ou duas frases — o resumo que você vai querer lembrar.',
  },
  {
    icon: 'ph-fill ph-code',
    color: '#7C3AED',
    tint: '#F1E9FE',
    title: '2. Código',
    text: 'Um exemplo curto e direto de como isso aparece na prática.',
  },
  {
    icon: 'ph-fill ph-check-circle',
    color: '#0E9F6E',
    tint: '#E1FAEF',
    title: '3. Onde usar',
    text: 'Situações reais em que essa ideia realmente ajuda.',
  },
  {
    icon: 'ph-fill ph-prohibit',
    color: '#EF4444',
    tint: '#FEECEA',
    title: '4. Onde não usar',
    text: 'Limitações e alternativas — pra você não forçar a barra.',
  },
  {
    icon: 'ph-fill ph-warning',
    color: '#D97706',
    tint: '#FDF0DC',
    title: '5. Erros comuns',
    text: 'As armadilhas em que quase todo mundo cai pelo menos uma vez.',
  },
  {
    icon: 'ph-fill ph-barbell',
    color: '#E5387E',
    tint: '#FCE7F1',
    title: '6. Prática',
    text: 'Um exercício com gabarito, pra sair da teoria.',
  },
  {
    icon: 'ph-fill ph-cards',
    color: '#12B76A',
    tint: '#DFF7EB',
    title: '7. Revisão',
    text: 'Cartões de múltipla escolha e perguntas discursivas pra fixar de verdade.',
  },
  {
    icon: 'ph-fill ph-microphone-stage',
    color: '#161616',
    tint: '#ECECEC',
    title: '8. Explicar em voz alta',
    text: 'O teste final: ensinar o tópico em 30 segundos, no seu próprio tempo.',
  },
];

export function WelcomeCycleCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 3200);
    return () => clearInterval(id);
  }, [paused]);

  const slide = SLIDES[index];

  return (
    <div
      className="rcp-card"
      style={{ textAlign: 'center', marginBottom: 26, overflow: 'hidden' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h2 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 20, margin: '0 0 4px' }}>
        <AnimatedEmoji>👋</AnimatedEmoji> Bem-vindo ao Review Cards Pro
      </h2>
      <p style={{ maxWidth: 480, margin: '0 auto 22px', color: '#6B6862', fontSize: 14.5, lineHeight: 1.6 }}>
        Cada <strong>tópico</strong> aqui é um ciclo completo de aprendizado, em 8 passos:
      </p>

      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {/* mini "tela" ilustrativa do passo, pra dar a sensação de uso real */}
            <div
              style={{
                borderRadius: 16,
                background: slide.tint,
                padding: 18,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  background: slide.color,
                  boxShadow: `0 8px 18px -8px ${slide.color}`,
                }}
              >
                <i className={slide.icon} style={{ color: '#fff', fontSize: 22 }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ height: 9, width: '70%', borderRadius: 999, background: 'rgba(0,0,0,.14)' }} />
                <div style={{ height: 9, width: '92%', borderRadius: 999, background: 'rgba(0,0,0,.09)' }} />
                <div style={{ height: 9, width: '45%', borderRadius: 999, background: 'rgba(0,0,0,.09)' }} />
              </div>
            </div>

            <p className="rcp-font-display" style={{ fontWeight: 600, fontSize: 17, margin: '0 0 4px', color: slide.color }}>
              {slide.title}
            </p>
            <p style={{ fontSize: 14, color: '#6B6862', margin: 0, minHeight: 42 }}>{slide.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 18 }}>
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            aria-label={`Ver passo ${i + 1}: ${s.title}`}
            onClick={() => setIndex(i)}
            style={{
              width: i === index ? 20 : 7,
              height: 7,
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              background: i === index ? slide.color : 'rgba(0,0,0,.15)',
              transition: 'all 0.2s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
