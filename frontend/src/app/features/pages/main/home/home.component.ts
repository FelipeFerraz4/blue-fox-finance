import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../core/services/translation/translation.service';
import { PublicHeaderComponent } from '../../../../shared/components/public/public-header/public-header.component';
import { PublicFooterComponent } from '../../../../shared/components/public/public-footer/public-footer.component';

/** Página pública em /pt e /en; textos em core/content/{pt,en}/home.ts. */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, PublicHeaderComponent, PublicFooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected readonly i18n = inject(TranslationService);
}
