import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '@tractor-store/ts-design-system';
import { FooterComponent } from '../../components/footer/footer.component';
import { ExploreFacade } from '../../store/explore.facade';

@Component({
  selector: 'explore-category-page',
  standalone: true,
  imports: [ProductCardComponent, FooterComponent],
  template: `
    <div class="ts-page-layout">
      <section class="ts-band ts-band--dark">
        <div class="ts-page-container py-6">
          <p class="ts-eyebrow">Gama</p>
          <h1 class="mt-2 ts-section-title text-white">{{ facade.category()?.name }}</h1>
          <p class="mt-3 text-text-muted">
            {{ facade.category()?.products?.length ?? 0 }} modelos en stock
          </p>
        </div>
      </section>
      <main class="ts-page-layout__content py-12 ts-page-container ts-page-container--catalog animate-slide-up">
        <div class="ts-category-grid">
          @for (p of facade.category()?.products ?? []; track p.id) {
            <ts-product-card
              [name]="p.name"
              [imageUrl]="facade.cdnUrl(p.image)"
              [price]="p.startPrice"
              (selected)="facade.goToProduct(p.id)"
            />
          }
        </div>
      </main>
      <explore-footer />
    </div>
  `,
})
export class CategoryPageComponent implements OnInit {
  readonly facade = inject(ExploreFacade);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const key = this.route.snapshot.paramMap.get('key') ?? 'classic';
    this.facade.loadCategory(key);
  }
}
