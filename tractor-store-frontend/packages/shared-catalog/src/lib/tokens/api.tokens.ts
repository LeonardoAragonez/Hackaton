import { InjectionToken } from '@angular/core';

/** @deprecated Use CATALOG_API_URL */
export const EXPLORE_API_URL = new InjectionToken<string>('EXPLORE_API_URL');
/** @deprecated Use CATALOG_API_URL */
export const DECIDE_API_URL = new InjectionToken<string>('DECIDE_API_URL');
/** @deprecated Use CART_API_URL and ORDER_API_URL */
export const CHECKOUT_API_URL = new InjectionToken<string>('CHECKOUT_API_URL');

export const CATALOG_API_URL = new InjectionToken<string>('CATALOG_API_URL');
export const CART_API_URL = new InjectionToken<string>('CART_API_URL');
export const ORDER_API_URL = new InjectionToken<string>('ORDER_API_URL');

export const CDN_BASE_URL = new InjectionToken<string>('CDN_BASE_URL', {
  factory: () => 'https://blueprint.the-tractor.store',
});
