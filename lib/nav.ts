// As telas de execução (quiz, discursivas, pitch, treino de discriminação,
// narração) podem ser abertas de mais de um lugar — o treino de discriminação,
// por exemplo, sai tanto do painel "Confundo com" de um tópico quanto da lista
// da seção. Quem abre passa `?from=`, e ao terminar a tela volta exatamente pra
// lá, no ponto em que a pessoa parou (o `from` carrega a âncora da seção).
//
// `from` vem da URL, então só destino interno é aceito: sem isso, um link
// montado por terceiros conseguiria usar o "Voltar" como redirect aberto.
export function safeInternalHref(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}

// Um `from` só é "de tópico" quando aponta pra /topics/... — é o que decide se
// o botão diz "Voltar ao tópico" ou "Voltar à seção".
export function isTopicHref(href: string): boolean {
  return href.startsWith('/topics/');
}

export function withFrom(href: string, from: string): string {
  return `${href}?from=${encodeURIComponent(from)}`;
}
