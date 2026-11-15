import { Injectable, computed, signal } from '@angular/core';

export type ThemePreference = 'system' | 'light' | 'dark';
export type EffectiveTheme = 'light' | 'dark';

const STORAGE_KEY = 'bf-theme';

/**
 * Tema claro/escuro. A preferência ("system" por padrão) fica no localStorage e o tema
 * resolvido vai para <html data-theme="light|dark">, que redefine os tokens do styles.css.
 * O script inline do index.html aplica o mesmo antes do Angular, para não piscar.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.media.matches);

  readonly preference = signal<ThemePreference>(this.read());
  readonly effective = computed<EffectiveTheme>(() => {
    const pref = this.preference();
    if (pref === 'system') return this.systemDark() ? 'dark' : 'light';
    return pref;
  });

  constructor() {
    this.media.addEventListener('change', (e) => {
      this.systemDark.set(e.matches);
      this.apply();
    });
    this.apply();
  }

  set(pref: ThemePreference): void {
    this.preference.set(pref);
    try {
      if (pref === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      /* navegação privada: vale só nesta aba */
    }
    this.apply();
  }

  /** Alterna entre claro e escuro (sai de "system" ao escolher manualmente). */
  toggle(): void {
    this.set(this.effective() === 'dark' ? 'light' : 'dark');
  }

  private apply(): void {
    document.documentElement.setAttribute('data-theme', this.effective());
  }

  private read(): ThemePreference {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === 'light' || v === 'dark' ? v : 'system';
    } catch {
      return 'system';
    }
  }
}
