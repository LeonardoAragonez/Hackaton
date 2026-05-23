import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CART_API_URL, CATALOG_API_URL, ORDER_API_URL, CDN_BASE_URL } from '@tractor-store/shared-catalog';
import { remoteRoutes } from './remote-entry/entry.routes';
import { CheckoutApiService } from './data/checkout-api.service';
import { CheckoutFacade } from './store/checkout.facade';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(remoteRoutes),
    provideHttpClient(),
    { provide: CART_API_URL, useValue: '/api/cart' },
    { provide: CATALOG_API_URL, useValue: '/api/catalog' },
    { provide: ORDER_API_URL, useValue: '/api/orders' },
    { provide: CDN_BASE_URL, useValue: 'https://blueprint.the-tractor.store' },
    CheckoutApiService,
    CheckoutFacade,
  ],
};
