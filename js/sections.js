import { db, save } from './storage.js';
import { escapeHtml, renderText } from './render.js';
import { showModal } from './modal.js';
import { editCard, deleteCard } from './cards.js';
import { editDiscursive, deleteDiscursive } from './discursive.js';

// ── Seções ──────────────────────────────────────────────────────
const sectionFields = s => [
    { label: 'Nome da seção', value: s?.name || '' },
    { label: 'O que é (conceito)', value: s?.concept?.what || '' },
    { label: 'Por que existe', value: s?.concept?.why || '' },
    { label: 'Onde usar — casos reais', value: s?.useCases || '' },
    { label: 'Onde não usar — limitações/trade-offs', value: s?.antiPatterns || '' },
    { label: 'Erros comuns', value: s?.commonMistakes || '' }
];

export function initAddSectionButton() {
    document.getElementById('addSection').onclick = async () => {
        const result = await showModal('Nova Seção', sectionFields());
        if (result && result[0]) {
            db.sections.push({
                name: result[0],
                concept: { what: result[1] || '', why: result[2] || '' },
                code: '',
                useCases: result[3] || '',
                antiPatterns: result[4] || '',
                commonMistakes: result[5] || '',
                exercise: { prompt: '', solution: '' },
                discursive: [],
                pitch: '',
                cards: []
            });
            save();
            window.home();
        }
    };
}

export async function editSection(i) {
    const s = db.sections[i];
    const result = await showModal('Editar Seção', sectionFields(s));
    if (result && result[0]) {
        s.name = result[0];
        s.concept = { what: result[1] || '', why: result[2] || '' };
        s.useCases = result[3] || '';
        s.antiPatterns = result[4] || '';
        s.commonMistakes = result[5] || '';
        save();
        window.home();
    }
}
window.editSection = editSection;

export async function editSectionCode(i) {
    const s = db.sections[i];
    const result = await showModal('Editar Código de Exemplo', [
        { label: 'Código de exemplo (use ``` para destacar como bloco)', value: s.code || '' }
    ]);
    if (result) {
        s.code = result[0] || '';
        save();
        openSection(i);
    }
}
window.editSectionCode = editSectionCode;

export async function delSection(i) {
    if (confirm('Tem certeza que deseja excluir esta seção?')) {
        db.sections.splice(i, 1);
        save();
        window.home();
    }
}
window.delSection = delSection;

export async function editExercise(i) {
    const s = db.sections[i];
    const result = await showModal('Editar Prática', [
        { label: 'Enunciado do exercício', value: s.exercise?.prompt || '' },
        { label: 'Gabarito / solução', value: s.exercise?.solution || '' }
    ]);
    if (result) {
        s.exercise = { prompt: result[0] || '', solution: result[1] || '' };
        save();
        openSection(i);
    }
}
window.editExercise = editExercise;

export async function editPitch(i) {
    const s = db.sections[i];
    const result = await showModal('Editar Resumo de 30 Segundos', [
        { label: 'Resumo de 30 segundos — o que você diria em voz alta para explicar isso a alguém', value: s.pitch || '' }
    ]);
    if (result) {
        s.pitch = result[0] || '';
        save();
        openSection(i);
    }
}
window.editPitch = editPitch;

// ── Abrir seção ─────────────────────────────────────────────────
function panel(icon, title, editFn, bodyHtml, open) {
    return `<details class='summary-panel'${open ? ' open' : ''}>
        <summary>${icon} ${title}
            <button class='panel-edit-btn' onclick='event.preventDefault();event.stopPropagation();${editFn}'>Editar</button>
        </summary>
        <div class='summary-body'>${bodyHtml}</div>
       </details>`;
}

export function openSection(i) {
    const s = db.sections[i];

    let panels = '';

    const conceptBody = (renderText(s.concept?.what) || '') +
        (s.concept?.why ? `<p style='margin-top:10px'><strong>Por que existe:</strong></p>${renderText(s.concept.why)}` : '');
    if (s.concept?.what || s.concept?.why) {
        panels += panel('🧠', 'O que é / Por que existe', `editSection(${i})`, conceptBody, true);
    }

    if (s.code) {
        panels += panel('💻', 'Código', `editSectionCode(${i})`, renderText(s.code), false);
    } else {
        panels += `<div class='row' style='margin-bottom:14px'><button onclick='editSectionCode(${i})'>+ Código de exemplo</button></div>`;
    }

    if (s.useCases) panels += panel('✅', 'Onde usar', `editSection(${i})`, renderText(s.useCases), false);
    if (s.antiPatterns) panels += panel('🚫', 'Onde não usar', `editSection(${i})`, renderText(s.antiPatterns), false);
    if (s.commonMistakes) panels += panel('⚠️', 'Erros comuns', `editSection(${i})`, renderText(s.commonMistakes), false);

    if (s.exercise?.prompt) {
        const exerciseBody = renderText(s.exercise.prompt) +
            (s.exercise.solution
                ? `<details class='analogy-panel' style='margin-top:12px'><summary>✅ Ver gabarito</summary><div class='analogy-body'>${renderText(s.exercise.solution)}</div></details>`
                : '');
        panels += panel('🏋️', 'Prática', `editExercise(${i})`, exerciseBody, false);
    } else {
        panels += `<div class='row' style='margin-bottom:14px'><button onclick='editExercise(${i})'>+ Exercício de prática</button></div>`;
    }

    let html = `<button onclick='home()'>← Voltar</button>
<h2>${escapeHtml(s.name)}</h2>
${panels}
<button onclick='newCard(${i})' style='margin-top:8px'>+ Cartão</button>`;

    s.cards.forEach((c, idx) => {
        html += `<div class='card'>
<div class='question-render'>${renderText(c.question)}</div>
<div class='row' style='margin-top:10px'>
<button class='edit-btn' data-si='${i}' data-ci='${idx}'>Editar</button>
<button class='delete-btn' data-si='${i}' data-ci='${idx}'>Excluir</button>
</div></div>`;
    });

    html += `<h3 style='margin-top:24px'>💬 Perguntas Discursivas</h3>
<div class='row' style='margin-bottom:10px'>
<button onclick='newDiscursive(${i})'>+ Pergunta Discursiva</button>
${s.discursive.length ? `<button onclick='startDiscursiveReview(${i})'>Revisar Discursivas</button>` : ''}
</div>`;

    s.discursive.forEach((q, idx) => {
        html += `<div class='card'>
<div class='question-render'>${renderText(q.question)}</div>
<div class='row' style='margin-top:10px'>
<button class='edit-disc-btn' data-si='${i}' data-qi='${idx}'>Editar</button>
<button class='delete-disc-btn' data-si='${i}' data-qi='${idx}'>Excluir</button>
</div></div>`;
    });

    if (s.pitch) {
        const pitchBody = renderText(s.pitch) +
            `<div class='row' style='margin-top:12px'><button onclick='startPitchPractice(${i})'>🎤 Praticar (30s)</button></div>`;
        html += panel('🎤', 'Explicar em 30 segundos', `editPitch(${i})`, pitchBody, false);
    } else {
        html += `<div class='row' style='margin-top:14px'><button onclick='editPitch(${i})'>+ Resumo de 30 segundos</button></div>`;
    }

    const app = document.getElementById('app');
    app.innerHTML = html;

    document.querySelectorAll('.edit-btn').forEach(btn =>
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            editCard(parseInt(this.dataset.si), parseInt(this.dataset.ci));
        }));
    document.querySelectorAll('.delete-btn').forEach(btn =>
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            deleteCard(parseInt(this.dataset.si), parseInt(this.dataset.ci));
        }));
    document.querySelectorAll('.edit-disc-btn').forEach(btn =>
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            editDiscursive(parseInt(this.dataset.si), parseInt(this.dataset.qi));
        }));
    document.querySelectorAll('.delete-disc-btn').forEach(btn =>
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            deleteDiscursive(parseInt(this.dataset.si), parseInt(this.dataset.qi));
        }));
}
window.openSection = openSection;
