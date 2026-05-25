import type { Store } from './explore.models';

export interface VariantInventory {
  id: string;
  name: string;
  sku: string;
  price: number;
  image: string;
  inventory: number;
}

export interface CartLine {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  items: CartLine[];
  subtotal: number;
  itemCount: number;
}

export type FulfillmentType = 'PICKUP' | 'DELIVERY';

export interface PlaceOrderRequest {
  fulfillmentType: FulfillmentType;
  email: string;
  name: string;
  storeId?: string;
  address?: string;
  city?: string;
  zip?: string;
}

export interface OrderShipping {
  address: string;
  city: string;
  zip: string;
}

export interface OrderConfirmation {
  orderId: string;
  message: string;
  fulfillmentType: FulfillmentType;
  pickupStore?: Store;
  shipping?: OrderShipping;
}
