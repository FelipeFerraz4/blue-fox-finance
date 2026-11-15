import { Injectable, NgZone, computed, signal } from '@angular/core';
import { isBrowserEnv, storageGet, storageSet } from '../../utils/browser-storage';

const SCALE_KEY = 'bf-font-scale';
const CONTRAST_KEY = 'bf-contrast';

export const FONT_SCALE_MIN = 0.875;
export const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_STEP = 0.125;

/**
 * Recursos de acessibilidade da barra flutuante:
 * - tamanho da fonte (A-/A+) via --a11y-font-scale no <html> (o layout é todo em rem);
 * - alto contraste via <html data-contrast="high">;
 * - leitura em voz alta (Web Speech API) do texto selecionado ou do conteúdo principal.
 * As preferências ficam no localStorage e o index.html as aplica antes do Angular.
 */
@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  readonly fontScale = signal<number>(this.readScale());
  readonly highContrast = signal<boolean>(this.readContrast());
  readonly speaking = signal(false);
  // false no prerender: a barra esconde o botão de leitura até o navegador assumir
  private readonly browser = isBrowserEnv();
  readonly speechSupported = this.browser && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  readonly canDecrease = computed(() => this.fontScale() > FONT_SCALE_MIN);
  readonly canIncrease = computed(() => this.fontScale() < FONT_SCALE_MAX);
  readonly isDefault = computed(() => this.fontScale() === 1 && !this.highContrast());

  constructor(private readonly zone: NgZone) {
    this.applyScale();
    this.applyContrast();
  }

  increaseFont(): void {
    this.setScale(this.fontScale() + FONT_SCALE_STEP);
  }

  decreaseFont(): void {
    this.setScale(this.fontScale() - FONT_SCALE_STEP);
  }

  toggleContrast(): void {
    this.highContrast.set(!this.highContrast());
    this.store(CONTRAST_KEY, this.highContrast() ? 'high' : null);
    this.applyContrast();
  }

  /** Volta fonte e contraste ao padrão e para a leitura. */
  reset(): void {
    this.setScale(1);
    if (this.highContrast()) this.toggleContrast();
    this.stopSpeaking();
  }

  /** Lê o texto selecionado; sem seleção, lê o conteúdo principal da página. */
  toggleSpeech(): void {
    if (!this.speechSupported) return;
    if (this.speaking()) {
      this.stopSpeaking();
      return;
    }
    const selected = window.getSelection()?.toString().trim();
    const main = document.querySelector('main') ?? document.body;
    const text = (selected || (main as HTMLElement).innerText || '').replace(/\s+/g, ' ').trim();
    if (!text) return;

    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 8000));
    // Idioma da página (o TranslationService mantém o lang do <html>: pt-BR ou en)
    const lang = document.documentElement.lang || 'pt-BR';
    utterance.lang = lang;
    const prefix = lang.slice(0, 2).toLowerCase();
    const voice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith(prefix));
    if (voice) utterance.voice = voice;
    const done = () => this.zone.run(() => this.speaking.set(false));
    utterance.onend = done;
    utterance.onerror = done;
    this.speaking.set(true);
    synth.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.speechSupported) window.speechSynthesis.cancel();
    this.speaking.set(false);
  }

  private setScale(value: number): void {
    const v = Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Math.round(value / FONT_SCALE_STEP) * FONT_SCALE_STEP));
    this.fontScale.set(v);
    this.store(SCALE_KEY, v === 1 ? null : String(v));
    this.applyScale();
  }

  private applyScale(): void {
    if (!this.browser) return;
    document.documentElement.style.setProperty('--a11y-font-scale', String(this.fontScale()));
  }

  private applyContrast(): void {
    if (!this.browser) return;
    const html = document.documentElement;
    if (this.highContrast()) html.setAttribute('data-contrast', 'high');
    else html.removeAttribute('data-contrast');
  }

  private readScale(): number {
    const v = parseFloat(storageGet(SCALE_KEY) ?? '');
    return v >= FONT_SCALE_MIN && v <= FONT_SCALE_MAX ? v : 1;
  }

  private readContrast(): boolean {
    return storageGet(CONTRAST_KEY) === 'high';
  }

  private store(key: string, value: string | null): void {
    storageSet(key, value);
  }
}
