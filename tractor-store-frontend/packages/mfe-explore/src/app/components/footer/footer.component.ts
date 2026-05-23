import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'explore-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="shrink-0 mt-auto ts-site-chrome">
      <div class="ts-site-chrome-accent-bar" aria-hidden="true"></div>
      <div class="py-12 ts-page-container">
        <div class="ts-footer-grid">
          <div>
            <p
              class="text-xl font-bold text-white font-[family-name:var(--font-family-display)]"
            >
              Tractor<span class="text-brand-accent">Store</span>
            </p>
            <p class="mt-2 text-sm leading-relaxed text-white/70 max-w-xs">
              Maquinaria agrícola de confianza. Tractores clásicos y autónomos para el campo moderno.
            </p>
          </div>
          <div>
            <p class="mb-3 text-xs font-bold tracking-widest uppercase text-white/50">Explorar</p>
            <nav class="flex flex-col gap-2">
              <a routerLink="/" class="ts-footer-link">Inicio</a>
              <a routerLink="/products/classic" class="ts-footer-link">Tractores clásicos</a>
              <a routerLink="/products/autonomous" class="ts-footer-link">Tractores autónomos</a>
              <a routerLink="/stores" class="ts-footer-link">Tiendas</a>
            </nav>
          </div>
          <div>
            <p class="mb-3 text-xs font-bold tracking-widest uppercase text-white/50">Compra</p>
            <nav class="flex flex-col gap-2">
              <a routerLink="/checkout/cart" class="ts-footer-link">Carrito</a>
              <a routerLink="/checkout/checkout" class="ts-footer-link">Checkout</a>
            </nav>
          </div>
        </div>
        <div
          class="flex flex-col items-center justify-between gap-3 pt-10 mt-10 border-t border-white/10 sm:flex-row"
        >
          <p class="text-sm text-white/55">&copy; {{ year }} Tractor Store</p>
          <p class="text-xs text-white/45">Edición Hackathon Quind</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
