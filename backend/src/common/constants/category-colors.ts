/**
 * Paleta das categorias de itens (mesma ordem da tela Categorias de Itens do site).
 * Cores variadas, legíveis nos temas claro e escuro; o emoji é o mais próximo para o bot.
 */
export const CATEGORY_COLORS = [
  { hex: '#ef4444', label: 'Vermelho', emoji: '🔴' },
  { hex: '#f97316', label: 'Laranja', emoji: '🟠' },
  { hex: '#eab308', label: 'Amarelo', emoji: '🟡' },
  { hex: '#22c55e', label: 'Verde', emoji: '🟢' },
  { hex: '#14b8a6', label: 'Turquesa', emoji: '🩵' },
  { hex: '#3b82f6', label: 'Azul', emoji: '🔵' },
  { hex: '#8b5cf6', label: 'Roxo', emoji: '🟣' },
  { hex: '#ec4899', label: 'Rosa', emoji: '🩷' },
  { hex: '#a16207', label: 'Marrom', emoji: '🟤' },
  { hex: '#64748b', label: 'Cinza', emoji: '🩶' },
] as const;

/** "#RGB" ou "#RRGGBB" (o "#" é opcional na entrada). */
export const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Normaliza para "#rrggbb" minúsculo, ou null se não for uma cor hexadecimal. */
export function normalizeHex(raw: string | null | undefined): string | null {
  const s = raw?.trim() ?? '';
  if (!HEX_COLOR.test(s)) return null;
  let hex = s.replace('#', '').toLowerCase();
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return `#${hex}`;
}

/** Cor da paleta menos usada entre as já usadas (empate: a primeira na ordem). */
export function nextCategoryColor(used: (string | null)[]): string {
  const count = new Map<string, number>(CATEGORY_COLORS.map((c) => [c.hex, 0]));
  for (const u of used) {
    const hex = normalizeHex(u);
    if (hex && count.has(hex)) count.set(hex, count.get(hex)! + 1);
  }
  const min = Math.min(...count.values());
  return CATEGORY_COLORS.find((c) => count.get(c.hex) === min)!.hex;
}
