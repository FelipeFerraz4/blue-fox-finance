import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18N } from '../../../../../core/i18n/i18n.pipes';
import { PREFERRED_LANGUAGE, REGION, activeLanguage, t } from '../../../../../core/i18n/i18n';
import { LANGUAGES, LANGUAGE_NAMES, Language, REGIONS, REGION_CODES, Region } from '../../../../../core/i18n/locale';
import { LocaleService } from '../../../../../core/services/locale/locale.service';

/**
 * Perfil → Idioma e país. O idioma escolhe os textos (site e bot); o país define moeda
 * e formato de data e número. Salva na conta e recarrega a página para tudo trocar junto.
 */
@Component({
  selector: 'app-locale-card',
  standalone: true,
  imports: [...I18N, FormsModule],
  templateUrl: './locale-card.component.html',
  styleUrl: './locale-card.component.css',
})
export class LocaleCardComponent {
  private readonly locale = inject(LocaleService);

  protected readonly languages = LANGUAGES;
  protected readonly languageNames = LANGUAGE_NAMES;
  protected readonly regions = REGION_CODES;
  protected readonly regionInfo = REGIONS;

  protected readonly lang = signal<Language>(PREFERRED_LANGUAGE);
  protected readonly region = signal<Region>(REGION);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly changed = computed(() => this.lang() !== PREFERRED_LANGUAGE || this.region() !== REGION);

  /** Prévia no país escolhido (antes de salvar): moeda, data e número. */
  protected readonly preview = computed(() => {
    const info = REGIONS[this.region()];
    const money = new Intl.NumberFormat(info.locale, { style: 'currency', currency: info.currency }).format(1234.56);
    const date = new Intl.DateTimeFormat(info.locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2026, 11, 31)),
    );
    return { money, date, currency: info.currency };
  });

  protected regionName(code: Region): string {
    return `${REGIONS[code].flag} ${REGIONS[code].name[activeLanguage()]}`;
  }

  protected async save(): Promise<void> {
    this.saving.set(true);
    this.error.set('');
    try {
      await this.locale.save(this.lang(), this.region());
    } catch {
      this.error.set(t('Não foi possível salvar. Tente de novo.'));
      this.saving.set(false);
    }
  }
}
