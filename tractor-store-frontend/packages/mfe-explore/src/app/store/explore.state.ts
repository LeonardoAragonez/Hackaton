import { signal } from '@angular/core';
import type { Category, ExploreHome, Store } from '@tractor-store/shared-catalog';

export interface ExploreState {
  home: ExploreHome | null;
  category: Category | null;
  stores: Store[];
  recommendations: Record<string, unknown>;
  loading: boolean;
  error: string | null;
}

export const initialExploreState = (): ExploreState => ({
  home: null,
  category: null,
  stores: [],
  recommendations: {},
  loading: false,
  error: null,
});

export const createExploreStore = () => {
  const state = signal<ExploreState>(initialExploreState());
  return { state };
};
