// Classes Tailwind compartilhadas entre os formulários/páginas do app (Fase 4: cor de
// destaque indigo/violeta + microinterações CSS nos botões).
export const inputClass =
  'w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none';
export const textareaClass = `${inputClass} min-h-[100px] resize-y font-sans`;
export const buttonPrimaryClass =
  'rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm shadow-indigo-950/50 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100';
export const buttonSecondaryClass =
  'rounded-md border border-slate-700 bg-slate-800 px-4 py-2 font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-700 active:scale-[0.98]';
export const buttonDangerClass =
  'rounded-md border border-red-900 bg-red-950 px-4 py-2 font-medium text-red-300 transition-all hover:bg-red-900 active:scale-[0.98]';
export const cardClass = 'rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20';
export const labelClass = 'mb-1.5 block text-sm font-medium text-slate-300';
