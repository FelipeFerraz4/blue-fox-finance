import { Language } from '../constants/locale';
import { currentLocale } from './locale-context';
import { API_EN } from './api.en';
import { BOT_EN } from './bot.en';

/**
 * Tradução do backend com a mesma regra do frontend: a chave é o texto em português
 * (como está no código) e o inglês fica nos dicionários (`api.en.ts`, `bot.en.ts`).
 * Sem tradução, devolve o português. Parâmetros `{nome}`.
 */
const EN: Record<string, string> = { ...API_EN, ...BOT_EN };

export function t(key: string, params?: Record<string, string | number | null | undefined>, lang?: Language): string {
  const language = lang ?? currentLocale().lang;
  let text = (language === 'en' && EN[key]) || key;
  if (params) {
    for (const [name, value] of Object.entries(params)) text = text.split(`{${name}}`).join(String(value ?? ''));
  }
  return text;
}

// Mensagens já montadas (ex.: exceções com o nome do item): acha o modelo pelo formato
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TEMPLATES = Object.entries(API_EN)
  .filter(([pt]) => /\{\w+\}/.test(pt))
  .map(([pt, en]) => {
    const names = [...pt.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    const pattern = new RegExp('^' + escapeRegex(pt).replace(/\\\{\w+\\\}/g, '(.*?)') + '$', 's');
    return { pattern, names, en, size: pt.length };
  })
  .sort((a, b) => b.size - a.size);

/** Traduz uma mensagem pronta (texto exato ou um modelo com parâmetros). */
export function translateMessage(message: string, lang: Language = currentLocale().lang): string {
  if (lang !== 'en' || !message) return message;
  if (EN[message]) return EN[message];
  for (const tpl of TEMPLATES) {
    const match = tpl.pattern.exec(message);
    if (!match) continue;
    let text = tpl.en;
    tpl.names.forEach((name, i) => (text = text.split(`{${name}}`).join(match[i + 1])));
    return text;
  }
  return message;
}
