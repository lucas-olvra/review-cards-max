import { db, save } from './storage.js';
import { showModal } from './modal.js';
import { renderText } from './render.js';
import { openSection } from './sections.js';

// ── CRUD ────────────────────────────────────────────────────────
window.newDiscursive = async (i) => {
    const result = await showModal('Nova Pergunta Discursiva', [
        { label: 'Pergunta', value: '' },
        { label: 'Resposta modelo (o que uma boa resposta deveria cobrir)', value: '' }
    ]);
    if (result && result[0]) {
        db.sections[i].discursive.push({ question: result[0], modelAnswer: result[1] || '' });
        save();
        openSection(i);
    }
};

export async function editDiscursive(si, qi) {
    const q = db.sections[si].discursive[qi];
    if (!q) return;
    const result = await showModal('Editar Pergunta Discursiva', [
        { label: 'Pergunta', value: q.question || '' },
        { label: 'Resposta modelo (o que uma boa resposta deveria cobrir)', value: q.modelAnswer || '' }
    ]);
    if (result && result[0]) {
        q.question = result[0];
        q.modelAnswer = result[1] || '';
        save();
        openSection(si);
    }
}
window.editDiscursive = editDiscursive;

export function deleteDiscursive(si, qi) {
    if (confirm('Excluir pergunta discursiva?')) {
        db.sections[si].discursive.splice(qi, 1);
        save();
        openSection(si);
    }
}
window.deleteDiscursive = deleteDiscursive;

// ── Revisão discursiva ──────────────────────────────────────────
let session = {};

export function startDiscursiveReview(si) {
    const questions = [...db.sections[si].discursive];
    if (!questions.length) { alert('Sem perguntas discursivas'); return; }
    session = { si, idx: 0, hits: 0, questions };
    showDiscursiveQuestion();
}
window.startDiscursiveReview = startDiscursiveReview;

function showDiscursiveQuestion() {
    const q = session.questions[session.idx];
    const pct = (session.idx / session.questions.length) * 100;
    const app = document.getElementById('app');

    app.innerHTML = `<button onclick='home()'>← Sair</button>
<h2>Revisão Discursiva</h2>
<div class='progress'><div style='width:${pct}%'></div></div>
<p>Pergunta ${session.idx + 1} de ${session.questions.length}</p>
<div class='card'>
<h3 class='question-render'>${renderText(q.question)}</h3>
<p style='opacity:.7;font-size:.9rem'>Pense na sua resposta antes de revelar.</p>
<button onclick='revealDiscursive()'>Revelar resposta modelo</button>
<div id='fb'></div>
</div>`;
}

window.revealDiscursive = () => {
    const q = session.questions[session.idx];
    const fb = document.getElementById('fb');
    fb.innerHTML = `<div class='feedback-explanation' style='margin-top:14px'>${renderText(q.modelAnswer) || '<em>Sem resposta modelo cadastrada.</em>'}</div>
<div class='row' style='margin-top:14px'>
<button onclick='rateDiscursive(true)'>✓ Acertei</button>
<button onclick='rateDiscursive(false)'>✗ Preciso revisar</button>
</div>`;
};

window.rateDiscursive = (ok) => {
    if (ok) session.hits++;
    session.idx++;
    if (session.idx >= session.questions.length) {
        const app = document.getElementById('app');
        app.innerHTML = `<button onclick='home()'>Home</button><div class='card'>
<h2>Resultado</h2><p>Acertos: ${session.hits}/${session.questions.length}</p></div>`;
        return;
    }
    showDiscursiveQuestion();
};
