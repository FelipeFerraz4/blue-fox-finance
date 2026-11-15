/**
 * localStorage seguro: no prerender (sem navegador) e em navegação privada com o
 * storage bloqueado, leitura devolve null e gravação é ignorada.
 */
export function storageGet(key: string): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Grava (ou remove, com null). */
export function storageSet(key: string, value: string | null): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* sem storage: vale só nesta aba */
  }
}

/** true no navegador; false no prerender (Node). */
export const isBrowserEnv = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined';
