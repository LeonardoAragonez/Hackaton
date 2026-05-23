import { Component, inject, OnInit } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { ExploreFacade } from '../../store/explore.facade';
import { ToastService } from '@tractor-store/shared-catalog';

@Component({
  selector: 'explore-stores-page',
  standalone: true,
  imports: [FooterComponent],
  template: `
    <div class="ts-page-layout">
      <section class="ts-band ts-band--dark">
        <div class="ts-page-container py-4 animate-slide-up">
          <p class="ts-eyebrow">Red oficial</p>
          <h1 class="mt-2 ts-section-title text-white">Nuestras tiendas</h1>
          <p class="mt-4 max-w-xl text-text-muted">
            Recoge tu equipo en el punto más cercano. Selecciona tu tienda preferida para el checkout.
          </p>
        </div>
      </section>
      <main class="ts-page-layout__content ts-page-container ts-page-container--catalog py-12 animate-slide-up">
        <div class="ts-stores-grid">
          @for (store of facade.stores(); track store.id) {
            <article
              class="ts-store-card group"
              (click)="selectStore(store.id, store.name)"
              (keyup.enter)="selectStore(store.id, store.name)"
              tabindex="0"
              role="button"
            >
              <div class="ts-store-card__media">
                <img [src]="facade.cdnUrl(store.image)" [alt]="store.name" loading="lazy" />
                <div class="ts-store-card__overlay" aria-hidden="true"></div>
                <div class="ts-store-card__body">
                  <span class="ts-badge mb-3">Concesionario</span>
                  <h2 class="font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">
                    {{ store.name }}
                  </h2>
                  <p class="mt-2 text-white/80">{{ store.street }}, {{ store.city }}</p>
                </div>
              </div>
            </article>
          }
        </div>
      </main>
      <explore-footer />
    </div>
  `,
})
export class StoresPageComponent implements OnInit {
  readonly facade = inject(ExploreFacade);
  private readonly toast = inject(ToastService);

  ngOnInit(): void {
    this.facade.loadStores();
  }

  selectStore(storeId: string, storeName: string): void {
    this.facade.selectStore(storeId, storeName);
    this.toast.show(`Tienda seleccionada: ${storeName}`, 'info');
  }
}
