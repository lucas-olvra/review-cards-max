export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Renderiza texto com suporte a blocos de código (``` ```) e listas (- item)
export function renderText(text) {
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
