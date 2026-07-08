const seed = { sections: [] };

export let db = JSON.parse(localStorage.getItem('rcpro') || 'null') || seed;

export const save = () => localStorage.setItem('rcpro', JSON.stringify(db));

export function setDb(newData) {
    db = newData;
    save();
}

export function repairData() {
    if (!db.sections) return;
    db.sections.forEach(section => {
        if (!section.cards) section.cards = [];
        if (!section.concept && typeof section.summary === 'string') {
            section.concept = { what: section.summary, why: '' };
        }
        delete section.summary;
        if (!section.concept) section.concept = { what: '', why: '' };
        if (!section.concept.what) section.concept.what = '';
        if (!section.concept.why) section.concept.why = '';
        if (!section.code) section.code = '';
        if (!section.useCases) section.useCases = '';
        if (!section.antiPatterns) section.antiPatterns = '';
        if (!section.commonMistakes) section.commonMistakes = '';
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
