import type { Cart, CartLine } from '../models/checkout.models';

export interface BackendCartItem {
  sku: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface BackendCartResponse {
  sessionId?: string;
  items: BackendCartItem[];
  itemCount: number;
  total: number;
}

export const mapBackendCart = (dto: BackendCartResponse): Cart => ({
  items: dto.items.map(
    (item): CartLine => ({
      sku: item.sku,
      name: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
      image: item.image,
    })
  ),
  subtotal: dto.total,
  itemCount: dto.itemCount,
});
