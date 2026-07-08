import { db } from './storage.js';
import { escapeHtml } from './render.js';
import { emptyStateHtml } from './onboarding.js';

// ── Home ────────────────────────────────────────────────────────
export function home() {
    const app = document.getElementById('app');
    let html = `<div class='row'><button onclick='exportDb()'>Exportar</button><button onclick='importDb()'>Importar</button></div>`;

    if (!db.sections.length) {
        html += emptyStateHtml();
        app.innerHTML = html;
        return;
    }

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
        btn.addEventListener('click', function() { window.openSection(parseInt(this.dataset.index)); }));
    document.querySelectorAll('.edit-section').forEach(btn =>
        btn.addEventListener('click', function() { window.editSection(parseInt(this.dataset.index)); }));
    document.querySelectorAll('.del-section').forEach(btn =>
        btn.addEventListener('click', function() { window.delSection(parseInt(this.dataset.index)); }));
    document.querySelectorAll('.quiz-section').forEach(btn =>
        btn.addEventListener('click', function() { window.startQuiz(parseInt(this.dataset.index)); }));
}
window.home = home;
