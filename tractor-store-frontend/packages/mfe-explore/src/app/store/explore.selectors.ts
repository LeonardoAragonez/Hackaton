import type { ExploreState } from './explore.state';

export const exploreSelectors = {
  home: (s: ExploreState) => s.home,
  category: (s: ExploreState) => s.category,
  stores: (s: ExploreState) => s.stores,
  recommendations: (s: ExploreState) => s.recommendations,
  loading: (s: ExploreState) => s.loading,
  error: (s: ExploreState) => s.error,
};
