import { signal } from '@angular/core';
import type { ProductDetail, RecommendationItem } from '@tractor-store/shared-catalog';

export interface DecideState {
  product: ProductDetail | null;
  selectedSku: string | null;
  recommendations: RecommendationItem[];
  loading: boolean;
  error: string | null;
  cartMessage: string | null;
  cartMessageKind: 'success' | 'error' | null;
  stockAvailable: number | null;
}

export const initialDecideState = (): DecideState => ({
  product: null,
  selectedSku: null,
  recommendations: [],
  loading: false,
  error: null,
  cartMessage: null,
  cartMessageKind: null,
  stockAvailable: null,
});

export const createDecideStore = () => ({
  state: signal<DecideState>(initialDecideState()),
});
