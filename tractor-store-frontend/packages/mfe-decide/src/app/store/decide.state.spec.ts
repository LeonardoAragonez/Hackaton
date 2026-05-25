import { createDecideStore, initialDecideState } from './decide.state';

describe('decideState', () => {
  it('createDecideStore expone signal con estado inicial', () => {
    const store = createDecideStore();
    expect(store.state()).toEqual(initialDecideState());
  });

  it('createDecideStore permite actualizar el estado', () => {
    const store = createDecideStore();
    store.state.update((s) => ({ ...s, loading: true, error: 'x' }));
    expect(store.state().loading).toBe(true);
    expect(store.state().error).toBe('x');
  });
});
