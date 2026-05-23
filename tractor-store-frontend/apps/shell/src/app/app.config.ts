import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  CART_API_URL,
  CATALOG_API_URL,
  CDN_BASE_URL,
  ORDER_API_URL,
} from '@tractor-store/shared-catalog';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    { provide: CATALOG_API_URL, useValue: '/api/catalog' },
    { provide: CART_API_URL, useValue: '/api/cart' },
    { provide: ORDER_API_URL, useValue: '/api/orders' },
    { provide: CDN_BASE_URL, useValue: 'https://blueprint.the-tractor.store' },
  ],
};
