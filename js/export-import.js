import { db, setDb } from './storage.js';

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
        r.onload = () => { setDb(JSON.parse(r.result)); window.home(); };
        r.readAsText(f);
    };
    inp.click();
};
