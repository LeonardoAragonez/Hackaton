import type { ProductVariant } from '@tractor-store/shared-catalog';
import type { DecideState } from './decide.state';

export const decideSelectors = {
  product: (s: DecideState) => s.product,
  selectedSku: (s: DecideState) => s.selectedSku,
  selectedVariant: (s: DecideState): ProductVariant | undefined =>
    s.product?.variants.find((v) => v.sku === s.selectedSku),
  loading: (s: DecideState) => s.loading,
  error: (s: DecideState) => s.error,
  cartMessage: (s: DecideState) => s.cartMessage,
  cartMessageKind: (s: DecideState) => s.cartMessageKind,
  stockAvailable: (s: DecideState) => s.stockAvailable,
  recommendations: (s: DecideState) => s.recommendations,
};
