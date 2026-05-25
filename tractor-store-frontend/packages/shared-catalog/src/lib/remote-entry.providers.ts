import { EnvironmentProviders, importProvidersFrom, Provider, makeEnvironmentProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import {
  CART_API_URL,
  CATALOG_API_URL,
  CDN_BASE_URL,
  ORDER_API_URL,
} from './tokens/api.tokens';

export const remoteEntryTokenProviders: Provider[] = [
  { provide: CATALOG_API_URL, useValue: '/api/catalog' },
  { provide: CART_API_URL, useValue: '/api/cart' },
  { provide: ORDER_API_URL, useValue: '/api/orders' },
  { provide: CDN_BASE_URL, useValue: 'https://blueprint.the-tractor.store' },
];

/** DI for federated route trees (includes HttpClient). */
export const remoteEntryProviders: EnvironmentProviders = makeEnvironmentProviders([
  importProvidersFrom(HttpClientModule),
  ...remoteEntryTokenProviders,
]);
