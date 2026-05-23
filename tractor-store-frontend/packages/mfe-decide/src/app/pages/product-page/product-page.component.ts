import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ButtonComponent, VariantOptionComponent } from '@tractor-store/ts-design-system';
import type { RecommendationItem } from '@tractor-store/shared-catalog';
import { DecideFacade } from '../../store/decide.facade';

@Component({
  selector: 'decide-product-page',
  standalone: true,
  imports: [CurrencyPipe, ButtonComponent, VariantOptionComponent],
  template: `
    <div class="animate-slide-up">
      @if (facade.loading()) {
        <div class="ts-showroom ts-page-container">
          <div class="ts-skeleton ts-showroom__stage min-h-[24rem]"></div>
        </div>
      } @else if (facade.error()) {
        <p class="py-20 text-center text-danger ts-page-container">{{ facade.error() }}</p>
      } @else if (facade.product()) {
        <section class="ts-showroom">
          <div class="ts-page-container ts-showroom__grid">
            <div class="ts-showroom__stage animate-scale-in" [attr.data-sku]="facade.selectedVariant()?.sku">
              <img
                [src]="facade.productHeroUrl(facade.selectedVariant()?.image ?? facade.product()!.variants[0].image)"
                [alt]="facade.product()!.name"
                fetchpriority="high"
                decoding="async"
              />
            </div>

            <div class="ts-configurator">
              <p class="ts-eyebrow">{{ facade.product()!.category }}</p>
              <h1 class="mt-2">{{ facade.product()!.name }}</h1>

              <div class="ts-spec-grid">
                @for (h of facade.product()!.highlights; track h) {
                  <div class="ts-spec-item">{{ h }}</div>
                }
              </div>

              <p class="mt-8 mb-3 ts-form-label">Acabado / color</p>
              <div class="flex flex-wrap gap-3">
                @for (v of facade.product()!.variants; track v.sku) {
                  <ts-variant-option
                    [color]="v.color"
                    [label]="v.name"
                    [selected]="facade.selectedVariant()?.sku === v.sku"
                    (select)="facade.selectSku(v.sku)"
                  />
                }
              </div>

              <div class="ts-price-block">
                <p class="ts-price">{{ facade.selectedVariant()?.price | currency }}</p>
                @if (facade.stockAvailable() !== null) {
                  <span class="ts-trust-pill">{{ facade.stockAvailable() }} uds. disponibles</span>
                }
              </div>

              <ts-button variant="cta" (clicked)="facade.addToCart()" class="block w-full">
                Añadir al carrito
              </ts-button>
              <p class="mt-4 text-xs text-center text-text-muted uppercase tracking-wider">
                Financiación · Recogida en tienda · Envío gratis
              </p>
            </div>
          </div>
        </section>

        <section class="ts-band ts-band--dark">
          <div class="ts-page-container">
            <div class="ts-section-header">
              <p class="ts-eyebrow">Relacionados</p>
              <h2 class="ts-section-title">También te puede interesar</h2>
            </div>
            @if (facade.recommendations().length) {
              <div class="grid grid-cols-2 gap-4 mt-8 md:grid-cols-4 md:gap-5">
                @for (item of facade.recommendations(); track item.sku) {
                  <a
                    href="#"
                    class="ts-recommendation-card group"
                    (click)="openRecommendation($event, item)"
                  >
                    <div class="ts-recommendation-card__img">
                      <img [src]="facade.cdnUrl(item.image)" [alt]="item.name" loading="lazy" />
                    </div>
                    <p>{{ item.name }}</p>
                  </a>
                }
              </div>
            } @else {
              <div class="grid grid-cols-2 gap-4 mt-8 md:grid-cols-4">
                @for (i of [1, 2, 3, 4]; track i) {
                  <div class="ts-skeleton aspect-square rounded-[var(--radius-showroom)]"></div>
                }
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class ProductPageComponent implements OnInit, OnDestroy {
  readonly facade = inject(DecideFacade);
  private readonly route = inject(ActivatedRoute);
  private paramSub?: Subscription;

  ngOnInit(): void {
    const paramSource = this.route.parent?.paramMap ?? this.route.paramMap;
    this.paramSub = paramSource.subscribe((params) => {
      const id = params.get('id') ?? '';
      if (id) {
        this.facade.loadProduct(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  openRecommendation(event: Event, item: RecommendationItem): void {
    event.preventDefault();
    this.facade.openRecommendation(item);
  }
}
