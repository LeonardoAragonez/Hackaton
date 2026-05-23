import { NgComponentOutlet } from '@angular/common';
import { Component, OnInit, signal, Type } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  CATALOG_EVENTS,
  CartUpdatedPayload,
  catalogEventBus,
} from '@tractor-store/shared-catalog';
import { ToastHostComponent } from '@tractor-store/ts-design-system';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgComponentOutlet, ToastHostComponent],
  template: `
    <div class="flex flex-col min-h-screen">
      <header class="sticky top-0 z-50 shrink-0 ts-site-chrome">
        <div class="flex items-center justify-between py-3 ts-page-container">
          <a routerLink="/" class="flex items-center gap-3 no-underline group">
            <span
              class="flex items-center justify-center w-10 h-10 font-black text-sm tracking-tighter uppercase rounded bg-brand-accent text-dark"
              aria-hidden="true"
            >TS</span>
            <span class="font-display text-xl font-bold tracking-wide uppercase text-white">
              Tractor<span class="text-brand-accent">Store</span>
            </span>
          </a>
          <nav class="flex items-center gap-0 sm:gap-1">
            <a
              routerLink="/"
              routerLinkActive="router-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="ts-nav-link-inverse"
            >Inicio</a>
            <a routerLink="/stores" routerLinkActive="router-link-active" class="ts-nav-link-inverse"
              >Tiendas</a
            >
            @if (miniCartReady()) {
              <ng-container *ngComponentOutlet="miniCartComponent()!" />
            } @else {
              <a routerLink="/checkout/cart" routerLinkActive="router-link-active" class="ts-nav-link-inverse"
                >Carrito</a
              >
            }
          </nav>
        </div>
      </header>
      <main class="flex flex-col flex-1 min-h-0">
        <router-outlet />
      </main>
      <ts-toast-host />
    </div>
  `,
})
export class ShellLayoutComponent implements OnInit {
  readonly miniCartComponent = signal<Type<unknown> | null>(null);
  readonly miniCartReady = signal(false);
  readonly cartCount = signal(0);

  ngOnInit(): void {
    void import('mfe-checkout/MiniCart').then((m) => {
      this.miniCartComponent.set(m.MiniCartHostComponent);
      this.miniCartReady.set(true);
    });

    catalogEventBus.on<CartUpdatedPayload>(CATALOG_EVENTS.CART_UPDATED, (payload) => {
      this.cartCount.set(payload.itemCount);
    });
  }
}
