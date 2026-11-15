import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LANGUAGES, Language, TranslationService } from '../../../../core/services/translation/translation.service';

/**
 * Cabeçalho das páginas públicas (Início, Sobre, Atualizações): navegação no idioma
 * da URL, seletor PT | EN (links reais para a mesma página no outro idioma, que o
 * Google também segue) e botão de Login. No celular, menu em gaveta.
 */
@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.css',
})
export class PublicHeaderComponent {
  protected readonly i18n = inject(TranslationService);
  protected readonly languages = LANGUAGES;
  protected mobileMenuOpen = false;

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  protected chooseLanguage(lang: Language): void {
    this.i18n.remember(lang);
    this.closeMobileMenu();
  }
}
