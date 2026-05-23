import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '@tractor-store/ts-design-system';
import { ProductSummary } from '@tractor-store/shared-catalog';

const ITEMS_PER_SLIDE = 3;

@Component({
  selector: 'explore-category-carousel',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <article class="category-carousel">
      <header class="category-carousel-header">
        <div>
          <p class="ts-eyebrow">{{ categoryKey() }}</p>
          <h3 class="mt-1 text-xl font-bold tracking-tight">
            <a
              [routerLink]="['/products', categoryKey()]"
              class="text-text no-underline transition-colors hover:text-brand-secondary"
            >
              {{ title() }}
            </a>
          </h3>
        </div>
        <div class="flex items-center gap-3" aria-label="Controles del carrusel">
          <button
            type="button"
            class="carousel-btn carousel-btn--ghost"
            [disabled]="!canPrev()"
            (click)="prev()"
            aria-label="Anterior"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="text-xs font-medium tabular-nums text-text-muted">
            {{ currentSlide() + 1 }} / {{ totalSlides() }}
          </span>
          <button
            type="button"
            class="carousel-btn carousel-btn--ghost"
            [disabled]="!canNext()"
            (click)="next()"
            aria-label="Siguiente"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      <div class="category-carousel-viewport">
        <div
          class="category-carousel-track"
          [style.transform]="'translateX(-' + currentSlide() * 100 + '%)'"
        >
          @for (slide of slides(); track $index) {
            <div class="category-carousel-slide">
              @for (p of slide; track p.id) {
                <ts-product-card
                  [name]="p.name"
                  [imageUrl]="imageUrlFn()(p.image)"
                  [price]="p.startPrice"
                  (selected)="onSelect()(p.id)"
                />
              }
              @for (pad of slidePadding(slide.length); track pad) {
                <div class="hidden lg:block" aria-hidden="true"></div>
              }
            </div>
          }
        </div>
      </div>

      @if (totalSlides() > 1) {
        <footer class="category-carousel-dots">
          @for (slide of slides(); track $index) {
            <button
              type="button"
              class="carousel-dot"
              [class.carousel-dot-active]="currentSlide() === $index"
              [attr.aria-label]="'Grupo ' + ($index + 1)"
              (click)="goTo($index)"
            ></button>
          }
        </footer>
      }
    </article>
  `,
  styles: `
    .category-carousel {
      background: var(--color-surface-elevated);
      border: 1px solid rgba(15, 26, 20, 0.07);
      border-radius: calc(var(--radius-card) + 4px);
      box-shadow: var(--shadow-card);
    }

    .category-carousel-header h3 {
      font-family: var(--font-family-display);
    }

    .category-carousel-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.5rem 1.5rem 0;
    }

    .category-carousel-viewport {
      overflow: hidden;
      padding: 1.25rem 1rem 1.5rem;
    }

    @media (min-width: 640px) {
      .category-carousel-viewport {
        padding: 1.5rem;
      }
    }

    .category-carousel-track {
      display: flex;
      transition: transform 480ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .category-carousel-slide {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      min-width: 100%;
      flex-shrink: 0;
    }

    @media (min-width: 640px) {
      .category-carousel-slide {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .category-carousel-slide {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
      }
    }

    .category-carousel-dots {
      display: flex;
      justify-content: center;
      gap: 0.375rem;
      padding: 0 1.5rem 1.25rem;
    }

    .carousel-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--radius-button);
      border: 1px solid var(--color-border);
      background: var(--color-surface-elevated);
      color: var(--color-text);
      cursor: pointer;
      transition:
        border-color var(--transition-fast),
        background var(--transition-fast);
    }

    .carousel-btn:hover:not(:disabled) {
      border-color: var(--color-brand-secondary);
      background: rgba(45, 106, 79, 0.06);
    }

    .carousel-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .carousel-dot {
      width: 6px;
      height: 6px;
      padding: 0;
      border: none;
      border-radius: 9999px;
      background: var(--color-border);
      cursor: pointer;
      transition:
        width 280ms ease,
        background 200ms ease;
    }

    .carousel-dot-active {
      width: 1.25rem;
      background: var(--color-brand-primary);
    }
  `,
})
export class CategoryCarouselComponent {
  readonly title = input.required<string>();
  readonly categoryKey = input.required<string>();
  readonly products = input.required<ProductSummary[]>();
  readonly imageUrlFn = input.required<(path: string) => string>();
  readonly onSelect = input.required<(id: string) => void>();

  readonly currentSlide = signal(0);

  readonly slides = computed(() => {
    const items = this.products();
    const chunks: ProductSummary[][] = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_SLIDE) {
      chunks.push(items.slice(i, i + ITEMS_PER_SLIDE));
    }
    return chunks.length ? chunks : [[]];
  });

  readonly totalSlides = computed(() => this.slides().length);
  readonly canPrev = computed(() => this.currentSlide() > 0);
  readonly canNext = computed(() => this.currentSlide() < this.totalSlides() - 1);

  slidePadding(count: number): number[] {
    const pad = ITEMS_PER_SLIDE - count;
    return pad > 0 ? Array.from({ length: pad }) : [];
  }

  prev(): void {
    if (this.canPrev()) {
      this.currentSlide.update((i) => i - 1);
    }
  }

  next(): void {
    if (this.canNext()) {
      this.currentSlide.update((i) => i + 1);
    }
  }

  goTo(index: number): void {
    if (index >= 0 && index < this.totalSlides()) {
      this.currentSlide.set(index);
    }
  }
}
