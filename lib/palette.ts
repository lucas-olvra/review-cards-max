// Paleta vívida cíclica para os cartões de tópico na home. Portada do getter
// `palette` do design "Review Cards Pro" — puramente decorativa, não ligada ao
// conteúdo do tópico (mesmo comportamento do mockup original).
export const TOPIC_PALETTE = [
  { bg: '#2C4BE0', icon: 'ph-fill ph-brackets-curly' },
  { bg: '#E5387E', icon: 'ph-fill ph-database' },
  { bg: '#12B76A', icon: 'ph-fill ph-tree-structure' },
  { bg: '#7C3AED', icon: 'ph-fill ph-arrows-clockwise' },
] as const;

export function paletteFor(index: number) {
  return TOPIC_PALETTE[index % TOPIC_PALETTE.length];
}
