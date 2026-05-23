export const CATALOG_EVENTS = {
  CART_UPDATED: 'checkout:cart-updated',
  STORE_SELECTED: 'explore:store-selected',
} as const;

export type CatalogEventType = (typeof CATALOG_EVENTS)[keyof typeof CATALOG_EVENTS];

export interface CartUpdatedPayload {
  itemCount: number;
  subtotal: number;
}

export interface StoreSelectedPayload {
  storeId: string;
  storeName: string;
}

export type CatalogEventPayload = CartUpdatedPayload | StoreSelectedPayload;

export interface CatalogEvent<T extends CatalogEventPayload = CatalogEventPayload> {
  type: CatalogEventType;
  payload: T;
}

export class CatalogEventBus extends EventTarget {
  emit<T extends CatalogEventPayload>(type: CatalogEventType, payload: T): void {
    this.dispatchEvent(new CustomEvent(type, { detail: payload }));
  }

  on<T extends CatalogEventPayload>(
    type: CatalogEventType,
    handler: (payload: T) => void
  ): () => void {
    const listener = (e: Event) => handler((e as CustomEvent<T>).detail);
    this.addEventListener(type, listener);
    return () => this.removeEventListener(type, listener);
  }
}

export const catalogEventBus = new CatalogEventBus();
