import { createExploreStore, initialExploreState } from './explore.state';

describe('exploreState', () => {
  it('createExploreStore expone signal con estado inicial', () => {
    const store = createExploreStore();
    expect(store.state()).toEqual(initialExploreState());
  });

  it('createExploreStore permite mutar el signal', () => {
    const store = createExploreStore();
    store.state.update((s) => ({ ...s, loading: true }));
    expect(store.state().loading).toBe(true);
  });
});
