import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'explore-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="sticky top-0 z-40 border-b border-white/10 bg-hero shadow-lg backdrop-blur-md">
      <div class="h-1 w-full bg-accent" aria-hidden="true"></div>
      <div class="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        <a routerLink="/" class="flex items-center gap-3 group">
          <span
            class="flex items-center justify-center w-10 h-10 text-lg font-black rounded-xl bg-accent text-brand-primary shadow-lg transition-transform group-hover:scale-110"
            aria-hidden="true"
          >🚜</span>
          <span class="text-xl font-display font-extrabold tracking-tight text-white">
            Tractor<span class="text-brand-accent">Store</span>
          </span>
        </a>
        <nav class="flex items-center gap-8">
          <a routerLink="/" class="ts-nav-link">Inicio</a>
          <a routerLink="/stores" class="ts-nav-link">Tiendas</a>
          <a routerLink="/checkout/cart" class="ts-nav-link">Carrito</a>
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent {}
