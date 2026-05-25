import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { RecommendationsComponent } from '../../components/recommendations/recommendations.component';
import { CategoryCarouselComponent } from '../../components/category-carousel/category-carousel.component';
import { ExploreFacade } from '../../store/explore.facade';

@Component({
  selector: 'explore-home-page',
  standalone: true,
  imports: [RouterLink, FooterComponent, RecommendationsComponent, CategoryCarouselComponent],
  template: `
    <div class="ts-page-layout">
      @if (facade.loading()) {
        <div class="ts-skeleton ts-hero-cinematic min-h-[60vh]"></div>
      } @else if (facade.error()) {
        <p class="py-20 text-center text-danger ts-page-container">{{ facade.error() }}</p>
      } @else {
        <div class="ts-page-layout__content">
          <section class="ts-hero-cinematic" [style]="heroStyles()">
            <div class="ts-hero-cinematic__content">
              <span class="ts-hero-cinematic__tag">Colección 2026</span>
              <h1 class="ts-hero-cinematic__title">Potencia para el campo</h1>
              <p class="ts-hero-cinematic__lead">
                Tractores clásicos y autónomos. Diseño industrial, tecnología de precisión y red de tiendas en todo el país.
              </p>
              <div class="ts-hero-cinematic__actions">
                @if (facade.home()?.teaser?.[0]; as first) {
                  <a [routerLink]="first.url" class="ts-btn-cta no-underline">Ver {{ first.title }}</a>
                }
                @if (facade.home()?.teaser?.[1]; as second) {
                  <a [routerLink]="second.url" class="ts-btn-ghost no-underline">Ver {{ second.title }}</a>
                }
              </div>
              <div class="ts-hero-cinematic__stats">
                <div class="ts-hero-cinematic__stat">
                  <strong>2</strong>
                  <span>Gamas de producto</span>
                </div>
                <div class="ts-hero-cinematic__stat">
                  <strong>100%</strong>
                  <span>Stock verificado</span>
                </div>
                <div class="ts-hero-cinematic__stat">
                  <strong>0€</strong>
                  <span>Envío incluido</span>
                </div>
              </div>
            </div>
          </section>

          <section class="ts-page-container py-16 md:py-20">
            <div class="ts-section-header">
              <p class="ts-eyebrow">Nuestra gama</p>
              <h2 class="ts-section-title">Elige tu línea</h2>
              <p class="mt-3 text-text-muted">
                Dos familias de tractores pensadas para distintos retos del campo.
              </p>
            </div>
            <div class="ts-lineup-grid">
              @for (t of facade.home()?.teaser ?? []; track t.title) {
                <a [routerLink]="t.url" class="ts-lineup-card group">
                  <img [src]="facade.cdnUrl(t.image)" [alt]="t.title" loading="lazy" />
                  <div class="ts-lineup-card__overlay" aria-hidden="true"></div>
                  <div class="ts-lineup-card__body">
                    <h2 class="ts-lineup-card__title">{{ t.title }}</h2>
                    <span class="ts-lineup-card__cta">Descubrir →</span>
                  </div>
                </a>
              }
            </div>
          </section>

          <section class="ts-catalog-section ts-band">
            <div class="ts-page-container">
              <div class="ts-section-header">
                <p class="ts-eyebrow">Catálogo</p>
                <h2 class="ts-section-title">Modelos disponibles</h2>
              </div>
              <div class="flex flex-col gap-8">
                @for (cat of facade.home()?.categories ?? []; track cat.key) {
                  <explore-category-carousel
                    [title]="cat.name"
                    [categoryKey]="cat.key"
                    [products]="cat.products"
                    [imageUrlFn]="cdnUrl"
                    [onSelect]="goToProduct"
                  />
                }
              </div>
            </div>
          </section>

          <explore-recommendations [items]="recommendationList()" />
        </div>
      }
      <explore-footer />
    </div>
  `,
})
export class HomePageComponent implements OnInit {
  readonly facade = inject(ExploreFacade);

  readonly heroStyles = computed(() => {
    const teaser = this.facade.home()?.teaser?.[0];
    if (!teaser) return {};
    return { '--hero-image': `url(${this.facade.cdnUrl(teaser.image)})` } as Record<string, string>;
  });

  readonly cdnUrl = (path: string): string => this.facade.cdnUrl(path);
  readonly goToProduct = (id: string): void => {
    this.facade.goToProduct(id);
  };

  readonly recommendationList = computed(() => {
    const rec = this.facade.recommendations();
    return Object.values(rec) as import('@tractor-store/shared-catalog').RecommendationItem[];
  });

  ngOnInit(): void {
    this.facade.loadHome();
  }
}
