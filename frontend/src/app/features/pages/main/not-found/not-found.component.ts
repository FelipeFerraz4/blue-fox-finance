import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../core/services/translation/translation.service';
import { PublicHeaderComponent } from '../../../../shared/components/public/public-header/public-header.component';
import { PublicFooterComponent } from '../../../../shared/components/public/public-footer/public-footer.component';

/**
 * 404 (rota `**`). O nginx responde com status 404 para endereços que não são do
 * sistema e entrega o app, que mostra esta página no idioma da URL (`/en/...` → inglês).
 * Sem `data.seo`, recebe noindex.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, PublicHeaderComponent, PublicFooterComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent {
  protected readonly i18n = inject(TranslationService);
}
