import { db, save } from './storage.js';

const TOUR_FLAG = 'rcpro_tour_seen';

// ── Estado vazio ────────────────────────────────────────────────
export function emptyStateHtml() {
    return `<div class='card' style='text-align:center'>
        <h2 style='margin-top:0'>👋 Bem-vindo ao Review Cards Pro</h2>
        <p style='max-width:520px;margin:0 auto 14px;line-height:1.7'>
            Cada <strong>seção</strong> aqui é um tópico de estudo com um ciclo completo:
            conceito → código → onde usar → onde não usar → erros comuns → prática → revisão → explicar em voz alta.
        </p>
        <div class='row' style='justify-content:center;margin-top:18px'>
            <button onclick="document.getElementById('addSection').click()">+ Criar minha primeira seção</button>
            <button onclick='createExampleSection()'>✨ Ver exemplo</button>
        </div>
    </div>`;
}

// ── Tópico de exemplo ───────────────────────────────────────────
window.createExampleSection = () => {
    db.sections.push({
        name: 'Closures em JavaScript',
        concept: {
            what: 'Uma closure é uma função que "lembra" das variáveis do escopo onde foi criada, mesmo depois que esse escopo já terminou de executar.',
            why: 'Existe porque JavaScript usa escopo léxico: funções internas mantêm acesso ao ambiente em que nasceram. Isso permite encapsular estado sem precisar de classes.'
        },
        code: 'function makeCounter() {\n```\nfunction makeCounter() {\n  let count = 0;\n  return function () {\n    count++;\n    return count;\n  };\n}\n\nconst counter = makeCounter();\ncounter(); // 1\ncounter(); // 2\n```',
        useCases: '- Contadores e geradores de ID com estado privado\n- Callbacks assíncronos que precisam lembrar de um valor (ex: setTimeout, event listeners)\n- Factories de função (funções que criam outras funções configuradas)\n- Debounce/throttle em manipulação de eventos',
        antiPatterns: 'Evite criar closures dentro de loops grandes ou hot paths sem necessidade — cada closure mantém sua própria referência ao escopo, o que pode reter memória além do esperado. Também não é a ferramenta certa quando você precisa de estado compartilhado entre múltiplas instâncias (aí uma classe costuma ser mais clara).',
        commonMistakes: '- Usar `var` em vez de `let` dentro de um loop e esperar que cada closure capture um valor diferente de `i`\n- Não perceber que a closure mantém a variável, não uma cópia do valor — se a variável mudar depois, a closure vê o valor atualizado\n- Criar closures desnecessárias dentro de funções chamadas com muita frequência, aumentando o uso de memória',
        cards: [
            {
                question: 'O que uma closure "lembra" depois que a função externa já terminou de executar?',
                options: [
                    'As variáveis do escopo léxico em que foi criada',
                    'Apenas o valor de retorno da função externa',
                    'Nada — o escopo é sempre descartado',
                    'Somente variáveis globais'
                ],
                correct: 0,
                explanation: 'A função interna mantém uma referência viva ao ambiente léxico onde nasceu, não uma cópia estática dele.',
                analogy: 'É como uma mochila que a função carrega consigo: mesmo saindo da "sala" (escopo) onde foi criada, ela continua com acesso ao que colocou na mochila.'
            },
            {
                question: 'Qual é um erro clássico ao usar closures dentro de um loop `for (var i ...)`?',
                options: [
                    'O loop não executa',
                    'Todas as closures acabam compartilhando o mesmo `i`, geralmente com o valor final do loop',
                    'O JavaScript lança um erro de sintaxe',
                    'As closures perdem acesso a `i` completamente'
                ],
                correct: 1,
                explanation: '`var` tem escopo de função, não de bloco — todas as closures do loop compartilham a mesma variável `i`. Trocar por `let` resolve, pois `let` cria uma nova binding a cada iteração.',
                analogy: ''
            }
        ]
    });
    save();
    window.home();
};

// ── Tour dispensável ────────────────────────────────────────────
export function showTour() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px';
    modal.id = 'tourModal';

    modal.innerHTML = `<div style='background:white;color:#111;padding:24px;border-radius:8px;max-width:480px;width:100%;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-height:90vh;overflow-y:auto'>
        <h3 style='margin-top:0'>❓ Como funciona o Review Cards Pro</h3>
        <ol style='line-height:1.9;padding-left:20px;margin:0 0 20px'>
            <li>Crie uma <strong>seção</strong> para cada tópico que quiser estudar.</li>
            <li>Preencha os painéis do ciclo de aprendizado: o que é, código, onde usar, onde não usar e erros comuns.</li>
            <li>Adicione <strong>cartões</strong> (perguntas de múltipla escolha) e use "Revisar" para testar seu conhecimento.</li>
            <li>Use "Exportar" de vez em quando para ter um backup dos seus dados (tudo fica salvo só no seu navegador).</li>
        </ol>
        <div style='display:flex;justify-content:flex-end'>
            <button onclick='closeTour()' style='padding:10px 20px;border:none;border-radius:4px;cursor:pointer;background:#007bff;color:white;font-size:14px;font-weight:500'>Entendi</button>
        </div>
    </div>`;

    document.body.appendChild(modal);
}
window.showTour = showTour;

window.closeTour = () => {
    const modal = document.getElementById('tourModal');
    if (modal) modal.remove();
    localStorage.setItem(TOUR_FLAG, '1');
};

export function maybeShowTourOnFirstVisit() {
    if (!localStorage.getItem(TOUR_FLAG)) showTour();
}

export function initHelpButton() {
    const btn = document.getElementById('helpTour');
    if (btn) btn.addEventListener('click', () => showTour());
}
