import type { DecideState } from './decide.state';
import type { RecommendationItem } from '@tractor-store/shared-catalog';

export const decideActions = {
  loadStart: (s: DecideState): DecideState => ({ ...s, loading: true, error: null }),
  loadSuccess: (s: DecideState, product: DecideState['product']): DecideState => ({
    ...s,
    loading: false,
    product,
  }),
  selectSku: (s: DecideState, sku: string): DecideState => ({
    ...s,
    selectedSku: sku,
    cartMessage: null,
    cartMessageKind: null,
  }),
  setError: (s: DecideState, error: string): DecideState => ({ ...s, loading: false, error }),
  setStock: (s: DecideState, stockAvailable: number | null): DecideState => ({ ...s, stockAvailable }),
  setRecommendations: (s: DecideState, recommendations: RecommendationItem[]): DecideState => ({
    ...s,
    recommendations,
  }),
  setCartMessage: (
    s: DecideState,
    message: string | null,
    kind: DecideState['cartMessageKind']
  ): DecideState => ({ ...s, cartMessage: message, cartMessageKind: kind }),
};
