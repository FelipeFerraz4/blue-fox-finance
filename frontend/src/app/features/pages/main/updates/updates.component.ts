import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../core/services/translation/translation.service';
import { PublicHeaderComponent } from '../../../../shared/components/public/public-header/public-header.component';
import { PublicFooterComponent } from '../../../../shared/components/public/public-footer/public-footer.component';

/** Página pública em /pt/updates e /en/updates; textos em core/content/{pt,en}/updates.ts. */
@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicHeaderComponent, PublicFooterComponent],
  templateUrl: './updates.component.html',
  styleUrl: './updates.component.css',
})
export class UpdatesComponent {
  protected readonly i18n = inject(TranslationService);
  selectedTab: 'all' | 'completed' | 'progress' | 'future' = 'all';
}
