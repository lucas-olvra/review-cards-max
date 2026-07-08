import { db, save } from './storage.js';
import { showModal } from './modal.js';
import { openSection } from './sections.js';

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

export async function editCard(si, ci) {
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
}
window.editCard = editCard;

export function deleteCard(si, ci) {
    if (confirm('Excluir cartão?')) { db.sections[si].cards.splice(ci, 1); save(); openSection(si); }
}
window.deleteCard = deleteCard;
