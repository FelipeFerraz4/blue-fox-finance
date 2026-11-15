import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PREFERRED_LANGUAGE, REGION, saveLocale } from '../../i18n/i18n';
import { Language, Region, isLanguage, isRegion } from '../../i18n/locale';

interface LocalePreference {
  idioma: Language;
  regiao: Region;
  salvo: boolean;
}

/**
 * Idioma e país na conta (`/preferences/locale`): valem em outros aparelhos e no bot.
 * O navegador guarda a cópia local (`bf-lang`, `bf-region`), lida ao carregar.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/preferences/locale`;
  private synced = false;

  /**
   * Depois do login: se a conta já tem escolha diferente da deste navegador, aplica
   * (recarrega uma vez); se nunca escolheu, grava a deste navegador para o bot usar.
   */
  async syncWithAccount(): Promise<void> {
    if (this.synced) return;
    this.synced = true;
    try {
      const pref = await firstValueFrom(this.http.get<LocalePreference>(this.url));
      if (!pref.salvo) {
        await firstValueFrom(this.http.put(this.url, { idioma: PREFERRED_LANGUAGE, regiao: REGION }));
        return;
      }
      if (isLanguage(pref.idioma) && isRegion(pref.regiao)) saveLocale(pref.idioma, pref.regiao);
    } catch {
      /* sem API: segue com a escolha local */
    }
  }

  /** Perfil: grava na conta e no navegador e recarrega para tudo trocar junto. */
  async save(lang: Language, region: Region): Promise<void> {
    await firstValueFrom(this.http.put(this.url, { idioma: lang, regiao: region }));
    saveLocale(lang, region);
  }
}
