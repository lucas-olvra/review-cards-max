import { db } from './storage.js';
import { escapeHtml, renderText } from './render.js';

const DURATION = 30; // segundos
let timer = null;

export function startPitchPractice(si) {
    const s = db.sections[si];
    const app = document.getElementById('app');
    app.innerHTML = `<button onclick='home()'>← Sair</button>
<h2>Explique em 30 segundos</h2>
<div class='card' style='text-align:center'>
<h3>${escapeHtml(s.name)}</h3>
<p style='opacity:.75'>Explique esse tópico em voz alta, como se estivesse ensinando alguém. Clique em começar quando estiver pronto.</p>
<button id='pitchStart' onclick='beginPitchTimer(${si})'>▶ Começar</button>
<div id='pitchArea' style='margin-top:16px'></div>
</div>`;
}
window.startPitchPractice = startPitchPractice;

window.beginPitchTimer = (si) => {
    const startBtn = document.getElementById('pitchStart');
    if (startBtn) startBtn.remove();
    const area = document.getElementById('pitchArea');
    area.innerHTML = `<div class='progress'><div id='pitchBar' style='width:100%;transition:width 1s linear'></div></div>
<p id='pitchClock' style='font-size:1.4rem;font-weight:700;margin-top:10px'>${DURATION}s</p>
<button onclick='revealPitch(${si})'>Terminei / Pular</button>`;

    let remaining = DURATION;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        // Se o usuário já saiu da tela do cronômetro (navegação para outra
        // tela substitui #app inteiro), para o timer em vez de forçar
        // revealPitch() de volta por cima do que o usuário está vendo agora.
        if (!document.getElementById('pitchArea')) {
            clearInterval(timer);
            timer = null;
            return;
        }
        remaining--;
        const bar = document.getElementById('pitchBar');
        const clock = document.getElementById('pitchClock');
        if (bar) bar.style.width = Math.max(0, (remaining / DURATION * 100)) + '%';
        if (clock) clock.textContent = Math.max(0, remaining) + 's';
        if (remaining <= 0) {
            clearInterval(timer);
            timer = null;
            revealPitch(si);
        }
    }, 1000);
};

window.revealPitch = (si) => {
    if (timer) { clearInterval(timer); timer = null; }
    const s = db.sections[si];
    const area = document.getElementById('pitchArea');
    area.innerHTML = `<div class='summary-body' style='text-align:left;margin-top:10px'>${renderText(s.pitch) || '<em>Sem resumo salvo.</em>'}</div>
<div class='row' style='justify-content:center;margin-top:14px'>
<button onclick='startPitchPractice(${si})'>🔁 Tentar de novo</button>
<button onclick='openSection(${si})'>← Voltar ao tópico</button>
</div>`;
};
