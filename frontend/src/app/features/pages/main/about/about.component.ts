import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../core/services/translation/translation.service';
import { PublicHeaderComponent } from '../../../../shared/components/public/public-header/public-header.component';
import { PublicFooterComponent } from '../../../../shared/components/public/public-footer/public-footer.component';

/** Página pública em /pt/about e /en/about; textos em core/content/{pt,en}/about.ts. */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, PublicHeaderComponent, PublicFooterComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  protected readonly i18n = inject(TranslationService);
}
