// ── Modal genérico ──────────────────────────────────────────────
let modalResolve;

export function showModal(title, fields) {
    return new Promise((resolve) => {
        modalResolve = resolve;
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px';
        modal.id = 'modal';

        let form = `<div style='background:white;padding:20px;border-radius:8px;max-width:500px;width:100%;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-height:90vh;overflow-y:auto'>
            <h3 style='margin-top:0;margin-bottom:20px'>${title}</h3>`;

        fields.forEach((field, idx) => {
            const isTextarea = ['Explicação','Pergunta','Analogia','Resumo','Alternativa','que é','existe','usar','comuns','Código','exercício','Gabarito','modelo'].some(k => field.label.includes(k));
            const minHeight = field.label.includes('Alternativa') ? '44px' : '80px';
            const inputEl = isTextarea
                ? `<textarea id='field${idx}' style='width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;font-size:14px;font-family:inherit;min-height:${minHeight};resize:vertical'>${field.value || ''}</textarea>`
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

// Referenciadas via onclick='...' inline no HTML gerado — precisam existir em window
window.submitModal = submitModal;
window.closeModal = closeModal;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey && document.getElementById('modal')) {
        submitModal(document.querySelectorAll('#modal input, #modal textarea').length);
    }
    if (e.key === 'Escape' && document.getElementById('modal')) closeModal(null);
});
