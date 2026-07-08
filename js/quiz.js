import { db } from './storage.js';
import { escapeHtml, renderText } from './render.js';

// ── Quiz ────────────────────────────────────────────────────────
let quiz = {};

export function startQuiz(si) {
    const cards = [...db.sections[si].cards];
    if (!cards.length) { alert('Sem cartões'); return; }
    quiz = { si, idx: 0, hits: 0, cards };
    showQuestion();
}
window.startQuiz = startQuiz;

function showQuestion() {
    const c = quiz.cards[quiz.idx];
    const s = db.sections[quiz.si];
    const pct = (quiz.idx / quiz.cards.length) * 100;
    const app = document.getElementById('app');

    // Resumo da seção aparece no quiz como dropdown fechado — consulta opcional
    const conceptText = s.concept?.what || '';
    const summaryHtml = conceptText
        ? `<details class='summary-panel quiz-summary'>
            <summary>📋 Consultar Conceito</summary>
            <div class='summary-body'>${renderText(conceptText)}</div>
           </details>`
        : '';

    app.innerHTML = `<button onclick='home()'>← Sair</button>
<h2>Revisão</h2>
<div class='progress'><div style='width:${pct}%'></div></div>
<p>Pergunta ${quiz.idx + 1} de ${quiz.cards.length}</p>
${summaryHtml}
<div class='card'>
<h3 class='question-render'>${renderText(c.question)}</h3>
${c.options.map((o, i) => `<div class='option'><button onclick='answer(${i})'><span class='option-render'>${renderText(o)}</span></button></div>`).join('')}
<div id='fb'></div>
</div>`;
}

window.answer = i => {
    const c = quiz.cards[quiz.idx];
    const ok = i === c.correct;
    if (ok) quiz.hits++;

    const fb = document.getElementById('fb');
    const wrap = document.createElement('div');
    wrap.className = (ok ? 'ok' : 'bad') + ' card feedback-card';

    const status = document.createElement('div');
    status.className = 'feedback-status';
    status.textContent = ok ? '✓ Correto' : '✗ Incorreto';
    wrap.appendChild(status);

    if (!ok) {
        const corr = document.createElement('div');
        corr.className = 'feedback-correct';
        corr.innerHTML = 'Resposta correta: <strong>' + escapeHtml(c.options[c.correct]) + '</strong>';
        wrap.appendChild(corr);
    }

    if (c.explanation) {
        const exp = document.createElement('div');
        exp.className = 'feedback-explanation';
        exp.innerHTML = '📖 ' + renderText(c.explanation);
        wrap.appendChild(exp);
    }

    if (c.analogy) {
        const details = document.createElement('details');
        details.className = 'analogy-panel';
        const sum = document.createElement('summary');
        sum.textContent = '💡 Ver analogia';
        const body = document.createElement('div');
        body.className = 'analogy-body';
        body.innerHTML = renderText(c.analogy);
        details.appendChild(sum);
        details.appendChild(body);
        wrap.appendChild(details);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'next-btn';
    nextBtn.textContent = 'Próxima →';
    nextBtn.onclick = nextQ;
    wrap.appendChild(nextBtn);

    fb.innerHTML = '';
    fb.appendChild(wrap);
};

function nextQ() {
    quiz.idx++;
    if (quiz.idx >= quiz.cards.length) {
        const app = document.getElementById('app');
        app.innerHTML = `<button onclick='home()'>Home</button><div class='card'>
<h2>Resultado</h2><p>Acertos: ${quiz.hits}/${quiz.cards.length}</p></div>`;
        return;
    }
    showQuestion();
}
window.nextQ = nextQ;
