const seed = { sections: [] };
let db = JSON.parse(localStorage.getItem('rcpro') || 'null') || seed;
const save = () => localStorage.setItem('rcpro', JSON.stringify(db));

function repairData() {
    if (!db.sections) return;
    db.sections.forEach(section => {
        if (!section.cards) section.cards = [];
        if (!section.summary) section.summary = '';   // resumo agora é da seção
        section.cards.forEach(card => {
            if (card.correct === null || card.correct === undefined || isNaN(card.correct)) card.correct = 0;
            if (!card.options) card.options = ['', '', '', ''];
            if (!card.question) card.question = '';
            if (!card.explanation) card.explanation = '';
            if (!card.analogy) card.analogy = '';
            delete card.summary; // remove summary do card se existir de versão anterior
        });
    });
    save();
}

repairData();
const app = document.getElementById('app');

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Renderiza texto com suporte a blocos de código (``` ```) e listas (- item)
function renderText(text) {
    if (!text) return '';
    const parts = text.split(/```/);
    return parts.map((part, i) => {
        if (i % 2 === 1) {
            // bloco de código: remove quebra de linha inicial se existir
            const code = part.replace(/^\n/, '');
            const div = document.createElement('div');
            div.textContent = code;
            return `<div class='code-block'>${div.innerHTML}</div>`;
        }
        // texto normal: processa listas e preserva quebras de linha
        return renderNormal(part);
    }).join('');
}

function renderNormal(text) {
    if (!text) return '';
    // Divide em blocos de linhas consecutivas que começam com "- " (lista) vs resto
    const lines = text.split('\n');
    const output = [];
    let listItems = [];

    const flushList = () => {
        if (listItems.length) {
            const esc = listItems.map(t => {
                const d = document.createElement('div');
                d.textContent = t;
                return `<li>${d.innerHTML}</li>`;
            }).join('');
            output.push(`<ul class='render-list'>${esc}</ul>`);
            listItems = [];
        }
    };

    lines.forEach(line => {
        if (/^- (.*)/.test(line)) {
            listItems.push(line.replace(/^- /, ''));
        } else {
            flushList();
            const div = document.createElement('div');
            div.textContent = line;
            output.push(`<span style='white-space:pre-wrap'>${div.innerHTML}</span><br>`);
        }
    });
    flushList();

    return output.join('');
}

// ── Modal genérico ──────────────────────────────────────────────
let modalResolve;
function showModal(title, fields) {
    return new Promise((resolve) => {
        modalResolve = resolve;
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px';
        modal.id = 'modal';

        let form = `<div style='background:white;padding:20px;border-radius:8px;max-width:500px;width:100%;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-height:90vh;overflow-y:auto'>
            <h3 style='margin-top:0;margin-bottom:20px'>${title}</h3>`;

        fields.forEach((field, idx) => {
            const isTextarea = ['Explicação','Pergunta','Analogia','Resumo'].some(k => field.label.includes(k));
            const inputEl = isTextarea
                ? `<textarea id='field${idx}' style='width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;font-size:14px;font-family:inherit;min-height:80px;resize:vertical'>${field.value || ''}</textarea>`
                : `<input type='${field.type || 'text'}' id='field${idx}' value='${field.value || ''}' style='width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;font-size:14px'>`;

            form += `<div style='margin-bottom:16px'>
                <label style='display:block;font-weight:500;margin-bottom:6px;color:#333'>${field.label}</label>
                ${inputEl}
            </div>`;
        });

        form += `<div style='display:flex;gap:10px;justify-content:flex-end;margin-top:24px;padding-top:16px;border-top:1px solid #eee'>
            <button onclick='closeModal(null)' style='padding:10px 20px;border:1px solid #ccc;border-radius:4px;cursor:pointer;background:#f5f5f5;font-size:14px;font-weight:500'>Cancelar</button>
            <button onclick='submitModal(${fields.length})' style='padding:10px 20px;border:none;border-radius:4px;cursor:pointer;background:#007bff;color:white;font-size:14px;font-weight:500'>OK</button>
        </div></div>`;

        modal.innerHTML = form;
        document.body.appendChild(modal);
        document.getElementById('field0').focus();
    });
}

function submitModal(fieldCount) {
    const values = [];
    for (let i = 0; i < fieldCount; i++) values.push(document.getElementById(`field${i}`).value);
    closeModal(values);
}

function closeModal(result) {
    const modal = document.getElementById('modal');
    if (modal) modal.remove();
    if (modalResolve) { modalResolve(result); modalResolve = null; }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey && document.getElementById('modal')) {
        submitModal(document.querySelectorAll('#modal input, #modal textarea').length);
    }
    if (e.key === 'Escape' && document.getElementById('modal')) closeModal(null);
});

// ── Home ────────────────────────────────────────────────────────
function home() {
    let html = `<div class='row'><button onclick='exportDb()'>Exportar</button><button onclick='importDb()'>Importar</button></div>`;
    db.sections.forEach((s, i) => {
        html += `<div class='section'><h3>${escapeHtml(s.name)}</h3>
<p>${s.cards.length} cartões</p>
<div class='row'>
<button class='open-section' data-index='${i}'>Abrir</button>
<button class='edit-section' data-index='${i}'>Editar</button>
<button class='del-section' data-index='${i}'>Excluir</button>
<button class='quiz-section' data-index='${i}'>Revisar</button>
</div></div>`;
    });
    app.innerHTML = html;

    document.querySelectorAll('.open-section').forEach(btn =>
        btn.addEventListener('click', function() { openSection(parseInt(this.dataset.index)); }));
    document.querySelectorAll('.edit-section').forEach(btn =>
        btn.addEventListener('click', function() { editSection(parseInt(this.dataset.index)); }));
    document.querySelectorAll('.del-section').forEach(btn =>
        btn.addEventListener('click', function() { delSection(parseInt(this.dataset.index)); }));
    document.querySelectorAll('.quiz-section').forEach(btn =>
        btn.addEventListener('click', function() { startQuiz(parseInt(this.dataset.index)); }));
}

// ── Seções ──────────────────────────────────────────────────────
document.getElementById('addSection').onclick = async () => {
    const result = await showModal('Nova Seção', [
        { label: 'Nome da seção', value: '' },
        { label: 'Resumo Rápido (opcional) — cole aqui o conceito que os cartões vão testar', value: '' }
    ]);
    if (result && result[0]) {
        db.sections.push({ name: result[0], summary: result[1] || '', cards: [] });
        save();
        home();
    }
};

window.editSection = async (i) => {
    const s = db.sections[i];
    const result = await showModal('Editar Seção', [
        { label: 'Nome', value: s.name },
        { label: 'Resumo Rápido', value: s.summary || '' }
    ]);
    if (result && result[0]) {
        s.name = result[0];
        s.summary = result[1] || '';
        save();
        home();
    }
};

window.delSection = async (i) => {
    if (confirm('Tem certeza que deseja excluir esta seção?')) {
        db.sections.splice(i, 1);
        save();
        home();
    }
};

// ── Abrir seção ─────────────────────────────────────────────────
window.openSection = i => {
    const s = db.sections[i];

    // Resumo rápido da seção — sempre visível no topo, expansível
    const summaryHtml = s.summary
        ? `<details class='summary-panel' open>
            <summary>📋 Resumo Rápido — ${escapeHtml(s.name)}</summary>
            <div class='summary-body'>${renderText(s.summary)}</div>
           </details>`
        : '';

    let html = `<button onclick='home()'>← Voltar</button>
<h2>${escapeHtml(s.name)}</h2>
${summaryHtml}
<button onclick='newCard(${i})' style='margin-top:8px'>+ Cartão</button>`;

    s.cards.forEach((c, idx) => {
        html += `<div class='card'>
<div class='question-render'>${renderText(c.question)}</div>
<div class='row' style='margin-top:10px'>
<button class='edit-btn' data-si='${i}' data-ci='${idx}'>Editar</button>
<button class='delete-btn' data-si='${i}' data-ci='${idx}'>Excluir</button>
</div></div>`;
    });

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
};

// ── Cartões ─────────────────────────────────────────────────────
window.newCard = async (i) => {
    const result = await showModal('Novo Cartão', [
        { label: 'Pergunta', value: '' },
        { label: 'Alternativa A', value: '' },
        { label: 'Alternativa B', value: '' },
        { label: 'Alternativa C', value: '' },
        { label: 'Alternativa D', value: '' },
        { label: 'Resposta correta (0=A, 1=B, 2=C, 3=D)', value: '0' },
        { label: 'Explicação', value: '' },
        { label: 'Analogia (opcional) — compare com algo do dia a dia para fixar melhor', value: '' }
    ]);
    if (result && result[0] && result[1] && result[2] && result[3] && result[4]) {
        db.sections[i].cards.push({
            question: result[0],
            options: [result[1], result[2], result[3], result[4]],
            correct: Math.max(0, Math.min(3, parseInt(result[5]) || 0)),
            explanation: result[6] || '',
            analogy: result[7] || ''
        });
        save();
        openSection(i);
    } else if (result) {
        alert('Por favor, preencha a Pergunta e todas as 4 Alternativas!');
    }
};

window.editCard = async (si, ci) => {
    const c = db.sections[si].cards[ci];
    if (!c) return;
    const result = await showModal('Editar Cartão', [
        { label: 'Pergunta', value: c.question || '' },
        { label: 'Alternativa A', value: c.options?.[0] || '' },
        { label: 'Alternativa B', value: c.options?.[1] || '' },
        { label: 'Alternativa C', value: c.options?.[2] || '' },
        { label: 'Alternativa D', value: c.options?.[3] || '' },
        { label: 'Resposta correta (0=A, 1=B, 2=C, 3=D)', value: String(c.correct ?? 0) },
        { label: 'Explicação', value: c.explanation || '' },
        { label: 'Analogia (opcional) — compare com algo do dia a dia para fixar melhor', value: c.analogy || '' }
    ]);
    if (result && result[0] && result[1] && result[2] && result[3] && result[4]) {
        c.question = result[0];
        c.options = [result[1], result[2], result[3], result[4]];
        c.correct = Math.max(0, Math.min(3, parseInt(result[5]) || 0));
        c.explanation = result[6] || '';
        c.analogy = result[7] || '';
        save();
        openSection(si);
    } else if (result) {
        alert('Por favor, preencha a Pergunta e todas as 4 Alternativas!');
        editCard(si, ci);
    }
};

window.deleteCard = (si, ci) => {
    if (confirm('Excluir cartão?')) { db.sections[si].cards.splice(ci, 1); save(); openSection(si); }
};

// ── Quiz ────────────────────────────────────────────────────────
let quiz = {};
window.startQuiz = si => {
    const cards = [...db.sections[si].cards];
    if (!cards.length) { alert('Sem cartões'); return; }
    quiz = { si, idx: 0, hits: 0, cards };
    showQuestion();
};

function showQuestion() {
    const c = quiz.cards[quiz.idx];
    const s = db.sections[quiz.si];
    const pct = (quiz.idx / quiz.cards.length) * 100;

    // Resumo da seção aparece no quiz como dropdown fechado — consulta opcional
    const summaryHtml = s.summary
        ? `<details class='summary-panel quiz-summary'>
            <summary>📋 Consultar Resumo Rápido</summary>
            <div class='summary-body'>${renderText(s.summary)}</div>
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

window.nextQ = () => {
    quiz.idx++;
    if (quiz.idx >= quiz.cards.length) {
        app.innerHTML = `<button onclick='home()'>Home</button><div class='card'>
<h2>Resultado</h2><p>Acertos: ${quiz.hits}/${quiz.cards.length}</p></div>`;
        return;
    }
    showQuestion();
};

// ── Export / Import ─────────────────────────────────────────────
window.exportDb = () => {
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    a.download = 'review-cards.json';
    a.click();
};
window.importDb = () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.onchange = e => {
        const f = e.target.files[0];
        const r = new FileReader();
        r.onload = () => { db = JSON.parse(r.result); save(); home(); };
        r.readAsText(f);
    };
    inp.click();
};

home();