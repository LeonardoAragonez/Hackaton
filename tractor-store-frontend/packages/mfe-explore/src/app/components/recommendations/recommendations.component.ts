import { Component, inject, input } from '@angular/core';
import type { RecommendationItem } from '@tractor-store/shared-catalog';
import { ExploreFacade } from '../../store/explore.facade';

@Component({
  selector: 'explore-recommendations',
  standalone: true,
  imports: [],
  template: `
    @if (items().length) {
      <section class="ts-band ts-band--dark">
        <div class="ts-page-container">
          <div class="ts-section-header">
            <p class="ts-eyebrow">Selección editorial</p>
            <h2 class="ts-section-title">Destacados</h2>
            <p class="mt-3 text-text-muted">Modelos con mayor demanda esta temporada</p>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-10 md:grid-cols-4 md:gap-5">
            @for (item of items(); track item.sku) {
              <a
                href="#"
                class="ts-recommendation-card group"
                (click)="openRecommendation($event, item)"
              >
                <div class="ts-recommendation-card__img">
                  <img
                    [src]="facade.cdnUrl(item.image)"
                    [alt]="item.name"
                    loading="lazy"
                  />
                </div>
                <p>{{ item.name }}</p>
              </a>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class RecommendationsComponent {
  readonly facade = inject(ExploreFacade);
  readonly items = input<RecommendationItem[]>([]);

  openRecommendation(event: Event, item: RecommendationItem): void {
    event.preventDefault();
    this.facade.openRecommendation(item);
  }
}
